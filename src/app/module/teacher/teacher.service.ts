import { UploadApiResponse } from "cloudinary";
import { prisma } from "../../lib/prisma";
import cloudinary from "../../lib/cloudinary";
import bcrypt from "bcryptjs";
import config from "../../config";
import {
	Role,
	TeacherVerificationStatus,
} from "../../../generated/prisma/enums";
import crypto from "crypto";
import { redisClient } from "../../lib/redis";
import path from "path";
import ejs from "ejs";
import { transporter } from "../../lib/nodemailer";
import {
	IApplyAsTeacherPayload,
	IApproveTeacherPayload,
	IVerifyTeacherEmailPayload,
} from "./teacher.interface";
import { RequestUser } from "../../middleware/checkAuth";
import { IQuery } from "../../interfaces";
import { TeacherWhereInput } from "../../../generated/prisma/models";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const applyAsTeacher = async (
	payload: IApplyAsTeacherPayload,
	resume: Express.Multer.File | null,
	additionalFiles: Express.Multer.File[],
) => {
	const isUserExists = await prisma.user.findUnique({
		where: { email: payload.user.email },
	});

	console.log(isUserExists);

	if (isUserExists) {
		throw new AppError(httpStatus.CONFLICT, "User already exists with this email");
	}

	// upload file (single)
	const resumeUploadResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "image",
					},
					async (error, result) => {
						if (error) {
							return reject(error);
						}
						if (!result) {
							return reject(new AppError(httpStatus.BAD_GATEWAY, "No result returned from Cloudinary"));
						}
						resolve(result);
					},
				)
				.end(resume?.buffer);
		},
	);

	// for multiple file
	const additionalFilesUploadResults = await Promise.all(
		additionalFiles.map((file) => {
			return new Promise<UploadApiResponse>((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(
						{
							resource_type: "image",
						},
						async (error, result) => {
							if (error) {
								return reject(error);
							}
							if (!result) {
								return reject(new AppError(httpStatus.BAD_GATEWAY, "No result returned from Cloudinary"));
							}
							resolve(result);
						},
					)
					.end(file.buffer);
			});
		}),
	);

	const randomTeacherPassword = Math.random().toString(36).slice(-8);
	const hashedPassword = await bcrypt.hash(
		randomTeacherPassword,
		Number(config.bcrypt_salt_rounds),
	);
	// create teacher application
	const teacherApplication = await prisma.user.create({
		data: {
			...payload.user,
			password: hashedPassword,
			role: Role.TEACHER,
			needPasswordChange: true,
			teacher: {
				create: {
					name: payload.user.name,
					email: payload.user.email,
					...payload.teacher,
					resume: resumeUploadResult.secure_url,
					resumePublicId: resumeUploadResult.public_id,
					additionalFiles: additionalFilesUploadResults.map((file) => ({
						url: file.secure_url,
						publicId: file.public_id,
					})),
				},
			},
		},
		include: {
			teacher: true,
		},
	});

	// email validation for teacher
	const expirationSeconds = 60 * 60;
	const otpKey = `teacher-application-otp:${payload.user.email}`;
	const otpValue = crypto.randomInt(100000, 1000000).toString();

	await redisClient.set(otpKey, otpValue, {
		expiration: {
			type: "EX",
			value: expirationSeconds,
		},
	});

	// send otp to email
	const templatePath = path.join(
		process.cwd(),
		"src/app/templates/registration-user-otp.ejs",
	);

	const html = await ejs.renderFile(templatePath, {
		otp: otpValue,
	});

	await transporter.sendMail({
		from: config.email_sender,
		to: payload.user.email,
		subject: "Email Verification OTP",
		html,
	});

	return teacherApplication;
};

const verifyTeacherEmail = async (payload: IVerifyTeacherEmailPayload) => {
	const otp = payload.otp;
	const email = payload.email.trim().toLowerCase();

	const existingUser = await prisma.user.findUnique({
		where: { email, role: Role.TEACHER },
	});

	if (!existingUser) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Teacher application not found",
		);
	}

	if (existingUser.emailVerified) {
		throw new AppError(httpStatus.CONFLICT, "Email Already Verified");
	}

	const otpKey = `teacher-application-otp:${email}`;

	const redisOtp = await redisClient.get(otpKey);

	if (!redisOtp) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"OTP Expired. Your Application Window Has Closed, Please Apply Again.",
		);
	}

	if (redisOtp !== otp) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP Does Not Match");
	}

	await redisClient.del(otpKey);

	const verifiedUser = await prisma.user.update({
		where: { id: existingUser.id },
		data: { emailVerified: true },
		omit: { password: true },
		include: { teacher: true },
	});

	return verifiedUser;
};

const approveTeacher = async (
	payload: IApproveTeacherPayload,
	reviewer: RequestUser,
) => {
	const { teacherId, verificationStatus, rejectionReason } = payload;

	const existingTeacher = await prisma.teacher.findUnique({
		where: { id: teacherId },
		include: { user: true },
	});

	if (!existingTeacher) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor Application Not Found");
	}

	if (existingTeacher.isDeleted) {
		throw new AppError(httpStatus.GONE, "Doctor Application Has Been Deleted");
	}

	if (!existingTeacher.user.emailVerified) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Doctor Has Not Verified Their Email Yet. Application Cannot Be Reviewed.",
		);
	}

	if (
		existingTeacher.verificationStatus !== TeacherVerificationStatus.PENDING
	) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Doctor Application Has Already Been ${existingTeacher.verificationStatus.toLowerCase()}`,
		);
	}

	if (
		verificationStatus === TeacherVerificationStatus.REJECTED &&
		!rejectionReason
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Rejection Reason Is Required When Rejecting A Doctor Application",
		);
	}

	const updatedTeacher = await prisma.teacher.update({
		where: { id: teacherId },
		data: {
			verificationStatus,
			rejectionReason:
				verificationStatus === TeacherVerificationStatus.REJECTED
					? rejectionReason
					: null,
			reviewedBy: reviewer.userId,
			reviewedAt: new Date(),
		},
	});

	const isApproved = verificationStatus === TeacherVerificationStatus.APPROVED;

	const tempatePath = path.join(
		process.cwd(),
		`src/app/templates/${
			isApproved
				? "teacher-application-approved.ejs"
				: "teacher-application-rejected.ejs"
		}`,
	);

	const templateData = {
		name: updatedTeacher.name,
		reason: updatedTeacher.rejectionReason,
	};

	const html = await ejs.renderFile(tempatePath, templateData);

	await transporter.sendMail({
		from: config.email_sender,
		to: updatedTeacher.email,
		subject: isApproved
			? "Your Teacher Application Has Been Approved"
			: "Your Teacher Application Has Been Rejected",
		html,
	});

	return updatedTeacher;
};

const getAllTeachers = async (query: IQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortOrder = query.sortOrder ? query.sortOrder : "desc";

	const andConditions: TeacherWhereInput[] = [];

	//Searching
	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{ name: { contains: query.searchTerm, mode: "insensitive" } },
				{ email: { contains: query.searchTerm, mode: "insensitive" } },
				{
					specialization: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
				{
					licenseNumber: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
			],
		});
	}

	//filtering
	if (query.specialization) {
		andConditions.push({
			specialization: { equals: query.specialization, mode: "insensitive" },
		});
	}

	if (query.email) {
		andConditions.push({
			email: { contains: query.email, mode: "insensitive" },
		});
	}

	if (query.licenseNumber) {
		andConditions.push({
			licenseNumber: { equals: query.licenseNumber, mode: "insensitive" },
		});
	}

	if (query.verificationStatus) {
		andConditions.push({
			verificationStatus: query.verificationStatus as TeacherVerificationStatus,
		});
	}

	// default condition
	andConditions.push({ isDeleted: false });

	const allTeachers = await prisma.teacher.findMany({
		where: {
			AND: andConditions.length > 0 ? andConditions : undefined,
		},

		take: limit,
		skip: skip,

		orderBy: {
			// sortBy : sortOrder
			[sortBy]: sortOrder,
		},

		include: {
			user: {
				omit: {
					password: true,
				},
			},

			// schedules: true,
			// appointments: true
			// notes: true
		},
	});

	const totalTeacherCount = await prisma.teacher.count({
		where: {
			AND: andConditions,
		},
	});

	return {
		data: allTeachers,
		meta: {
			page: page,
			limit: limit,
			total: totalTeacherCount,
			totalPages: Math.ceil(totalTeacherCount / limit),
		},
	};
};

export const TeacherServices = {
	applyAsTeacher,
	verifyTeacherEmail,
	approveTeacher,
	getAllTeachers,
};
