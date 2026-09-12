import { UploadApiResponse } from "cloudinary";
import { prisma } from "../../lib/prisma";
import cloudinary from "../../lib/cloudinary";
import bcrypt from "bcryptjs";
import config from "../../config";
import {
	Role,
	DeveloperVerificationStatus,
} from "../../../generated/prisma/enums";
import crypto from "crypto";
import { redisClient } from "../../lib/redis";
import path from "path";
import ejs from "ejs";
import { transporter } from "../../lib/nodemailer";
import {
	IApplyAsDeveloperPayload,
	IApproveDeveloperPayload,
	IVerifyDeveloperEmailPayload,
} from "./developer.interface";
import { RequestUser } from "../../middleware/checkAuth";
import { IQuery } from "../../interfaces";
import { DeveloperWhereInput } from "../../../generated/prisma/models";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const applyAsDeveloper = async (
	payload: IApplyAsDeveloperPayload,
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

	const randomDeveloperPassword = Math.random().toString(36).slice(-8);
	const hashedPassword = await bcrypt.hash(
		randomDeveloperPassword,
		Number(config.bcrypt_salt_rounds),
	);
	// create developer application
	const developerApplication = await prisma.user.create({
		data: {
			...payload.user,
			password: hashedPassword,
			role: Role.DEVELOPER,
			needPasswordChange: true,
			developer: {
				create: {
					name: payload.user.name,
					email: payload.user.email,
					...payload.developer,
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
			developer: true,
		},
	});

	// email validation for developer
	const expirationSeconds = 60 * 60;
	const otpKey = `developer-application-otp:${payload.user.email}`;
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

	return developerApplication;
};

const verifyDeveloperEmail = async (payload: IVerifyDeveloperEmailPayload) => {
	const otp = payload.otp;
	const email = payload.email.trim().toLowerCase();

	const existingUser = await prisma.user.findUnique({
		where: { email, role: Role.DEVELOPER },
	});

	if (!existingUser) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Developer application not found",
		);
	}

	if (existingUser.emailVerified) {
		throw new AppError(httpStatus.CONFLICT, "Email Already Verified");
	}

	const otpKey = `developer-application-otp:${email}`;

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
		include: { developer: true },
	});

	return verifiedUser;
};

const approveDeveloper = async (
	payload: IApproveDeveloperPayload,
	reviewer: RequestUser,
) => {
	const { developerId, verificationStatus, rejectionReason } = payload;

	const existingDeveloper = await prisma.developer.findUnique({
		where: { id: developerId },
		include: { user: true },
	});

	if (!existingDeveloper) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor Application Not Found");
	}

	if (existingDeveloper.isDeleted) {
		throw new AppError(httpStatus.GONE, "Doctor Application Has Been Deleted");
	}

	if (!existingDeveloper.user.emailVerified) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Doctor Has Not Verified Their Email Yet. Application Cannot Be Reviewed.",
		);
	}

	if (
		existingDeveloper.verificationStatus !== DeveloperVerificationStatus.PENDING
	) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Doctor Application Has Already Been ${existingDeveloper.verificationStatus.toLowerCase()}`,
		);
	}

	if (
		verificationStatus === DeveloperVerificationStatus.REJECTED &&
		!rejectionReason
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Rejection Reason Is Required When Rejecting A Doctor Application",
		);
	}

	const updatedDeveloper = await prisma.developer.update({
		where: { id: developerId },
		data: {
			verificationStatus,
			rejectionReason:
				verificationStatus === DeveloperVerificationStatus.REJECTED
					? rejectionReason
					: null,
			reviewedBy: reviewer.userId,
			reviewedAt: new Date(),
		},
	});

	const isApproved = verificationStatus === DeveloperVerificationStatus.APPROVED;

	const tempatePath = path.join(
		process.cwd(),
		`src/app/templates/${
			isApproved
				? "developer-application-approved.ejs"
				: "developer-application-rejected.ejs"
		}`,
	);

	const templateData = {
		name: updatedDeveloper.name,
		reason: updatedDeveloper.rejectionReason,
	};

	const html = await ejs.renderFile(tempatePath, templateData);

	await transporter.sendMail({
		from: config.email_sender,
		to: updatedDeveloper.email,
		subject: isApproved
			? "Your Developer Application Has Been Approved"
			: "Your Developer Application Has Been Rejected",
		html,
	});

	return updatedDeveloper;
};

const getAllDevelopers = async (query: IQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortOrder = query.sortOrder ? query.sortOrder : "desc";

	const andConditions: DeveloperWhereInput[] = [];

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
			verificationStatus: query.verificationStatus as DeveloperVerificationStatus,
		});
	}

	// default condition
	andConditions.push({ isDeleted: false });

	const allDevelopers = await prisma.developer.findMany({
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

	const totalDeveloperCount = await prisma.developer.count({
		where: {
			AND: andConditions,
		},
	});

	return {
		data: allDevelopers,
		meta: {
			page: page,
			limit: limit,
			total: totalDeveloperCount,
			totalPages: Math.ceil(totalDeveloperCount / limit),
		},
	};
};

export const DeveloperServices = {
	applyAsDeveloper,
	verifyDeveloperEmail,
	approveDeveloper,
	getAllDevelopers,
};