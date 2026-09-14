import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import config from "../../config";
import { Role, EmploymentStatus } from "../../../generated/prisma/enums";
import crypto from "crypto";
import { redisClient } from "../../lib/redis";
import path from "path";
import ejs from "ejs";
import { transporter } from "../../lib/nodemailer";
import {
	IApplyAsDeveloperPayload,
	IHireDeveloperPayload,
	IVerifyDeveloperEmailPayload,
} from "./developer.interface";
import { IQuery } from "../../interfaces";
import { DeveloperWhereInput } from "../../../generated/prisma/models";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const applyAsDeveloper = async (payload: IApplyAsDeveloperPayload) => {
	const email = payload.user.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new AppError(httpStatus.CONFLICT, "User already exists with this email");
	}

	const randomDeveloperPassword = Math.random().toString(36).slice(-8);
	const hashedPassword = await bcrypt.hash(
		randomDeveloperPassword,
		Number(config.bcrypt_salt_rounds),
	);

	// create developer
	const developerApplication = await prisma.user.create({
		data: {
			...payload.user,
			email,
			password: hashedPassword,
			role: Role.DEVELOPER,
			needPasswordChange: true,
			developer: {
				create: {
					...payload.developer,
				},
			},
		},
		omit: { password: true },
		include: {
			developer: true,
		},
	});

	// email validation for developer
	const expirationSeconds = 60 * 60;
	const otpKey = `developer-application-otp:${email}`;
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
		to: email,
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

const hireDeveloper = async (payload: IHireDeveloperPayload) => {
	const { developerId } = payload;

	const existingDeveloper = await prisma.developer.findUnique({
		where: { id: developerId },
		include: { user: true },
	});

	if (!existingDeveloper) {
		throw new AppError(httpStatus.NOT_FOUND, "Developer Application Not Found");
	}

	if (!existingDeveloper.user.emailVerified) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Developer Has Not Verified Their Email Yet. Application Cannot Be Hired.",
		);
	}

	if (
		existingDeveloper.employmentStatus !== EmploymentStatus.ACTIVE ||
		existingDeveloper.hiredAt
	) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Developer Has Already Been Hired`,
		);
	}

	const updatedDeveloper = await prisma.developer.update({
		where: { id: developerId },
		data: {
			employmentStatus: EmploymentStatus.ACTIVE,
			hiredAt: new Date(),
		},
		include: { user: { omit: { password: true } } },
	});

	const templatePath = path.join(
		process.cwd(),
		"src/app/templates/developer-application-approved.ejs",
	);

	const html = await ejs.renderFile(templatePath, {
		name: existingDeveloper.user.name,
		reason: null,
	});

	await transporter.sendMail({
		from: config.email_sender,
		to: existingDeveloper.user.email,
		subject: "Your Developer Application Has Been Approved",
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
				{
					user: {
						is: {
							name: { contains: query.searchTerm, mode: "insensitive" },
						},
					},
				},
				{
					user: {
						is: {
							email: { contains: query.searchTerm, mode: "insensitive" },
						},
					},
				},
				{
					specialization: {
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

	if (query.experienceYears) {
		andConditions.push({
			experienceYears: { equals: Number(query.experienceYears) },
		});
	}

	if (query.employmentStatus) {
		andConditions.push({
			employmentStatus: query.employmentStatus as EmploymentStatus,
		});
	}

	const allDevelopers = await prisma.developer.findMany({
		where: {
			AND: andConditions.length > 0 ? andConditions : undefined,
		},

		take: limit,
		skip: skip,

		orderBy: {
			[sortBy]: sortOrder,
		},

		include: {
			user: {
				omit: {
					password: true,
				},
			},
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
	hireDeveloper,
	getAllDevelopers,
};