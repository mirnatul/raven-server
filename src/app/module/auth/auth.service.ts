import bcrypt from "bcryptjs";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import {
	AuthProvider,
	Role,
	UserStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import type {
	IForgotPasswordPayload,
	IGoogleLoginPayload,
	ILoginUserPayload,
	IRegisterPatientPayload,
	IRequestUser,
	IResetPasswordPayload,
	IVerifyEmailPayload,
} from "./auth.interface";
import { googleClient } from "../../lib/googleAuth";
import type { TokenPayload } from "google-auth-library";
import { createUserTokens } from "../../helpers/authToken";
import crypto from "crypto";
import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodemailer";
import ejs from "ejs";
import path from "path";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const registerPatient = async (payload: IRegisterPatientPayload) => {
	const { name, password, student: studentData } = payload;

	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new AppError(
			httpStatus.CONFLICT,
			"User with this email already exists",
		);
	}

	const hashedPassword = await bcrypt.hash(password, 8);

	// redis
	const otpKey = `studentRegistration-otp:${payload.email}`;
	const otpValue = crypto.randomInt(100000, 1000000).toString();
	// console.log(otp);

	await redisClient.set(otpKey, otpValue, {
		expiration: {
			type: "EX",
			value: 5 * 60,
		},
	});

	// registration key value -------------------------------------------------------
	const redisUserDataPayload = {
		name,
		email,
		password: hashedPassword,
		role: Role.STUDENT,
		status: UserStatus.ACTIVE,
		student: studentData,
	};
	const studentRegistrationKey = `studentRegistration-data:${payload.email}`;

	await redisClient.set(
		studentRegistrationKey,
		JSON.stringify(redisUserDataPayload),
		{
			expiration: {
				type: "EX",
				value: 5 * 60,
			},
		},
	);
	// ------------------------------------------------------------------------------
	// send otp to mail---------------------
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
};

const verifyStudentEmail = async (payload: IVerifyEmailPayload) => {
	const otp = payload.otp;
	const email = payload.email.trim().toLowerCase();

	const isUserExist = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExist?.status === UserStatus.BLOCKED) {
		throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
	}

	if (isUserExist?.emailVerified) {
		throw new AppError(httpStatus.CONFLICT, "Email already verified");
	}
	if (isUserExist?.isDeleted || isUserExist?.status === UserStatus.DELETED) {
		throw new AppError(httpStatus.GONE, "User is deleted");
	}

	const otpKey = `studentRegistration-otp:${payload.email}`;
	const redisOtp = await redisClient.get(otpKey);
	if (!redisOtp) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
	}

	if (redisOtp !== otp) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP does not match");
	}

	await redisClient.del(otpKey);

	// if match
	const studentRegistrationKey = `studentRegistration-data:${email}`;
	const redisStudentData = await redisClient.get(studentRegistrationKey);

	if (!redisStudentData) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Student registration data not found in Redis",
		);
	}

	const studentPayload: IRegisterPatientPayload = JSON.parse(redisStudentData);

	const createdUser = await prisma.user.create({
		data: {
			name: studentPayload.name,
			email: studentPayload.email,
			password: studentPayload.password,
			role: Role.STUDENT,
			status: UserStatus.ACTIVE,
			emailVerified: true,
			student: {
				create: {
					name: studentPayload.name,
					email: studentPayload.email,
					contactNumber: studentPayload?.student?.contactNumber || null,
				},
			},
		},
		omit: { password: true },
		include: { student: true },
	});

	await redisClient.del(studentRegistrationKey);

	const templatePath = path.join(
		process.cwd(),
		"src/app/templates/student-welcome-email.ejs",
	);

	const html = await ejs.renderFile(templatePath, {
		name: createdUser.name,
	});

	await transporter.sendMail({
		from: config.email_sender,
		to: email,
		subject: "Welcome to Pathshala",
		html,
	});

	const { student, ...user } = createdUser;

	const { accessToken, refreshToken } = createUserTokens(user);

	return {
		user,
		student,
		accessToken,
		refreshToken,
	};
};

const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new AppError(httpStatus.GONE, "User is deleted");
	}

	if (user.password === null && user.googleId !== null) {
		throw new AppError(
			httpStatus.CONFLICT,
			"User already has account register with google. Try to login with google",
		);
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password as string,
	);

	if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
	}

	const { accessToken, refreshToken } = createUserTokens(user);

	return {
		accessToken,
		refreshToken,
	};
};

const getMe = async (user: IRequestUser) => {
	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.id,
		},
		include: {
			student: true,
		},
		omit: {
			password: true,
		},
	});

	if (!isUserExists) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	return isUserExists;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.id },
	});

	if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"User is inactive or not found",
		);
	}

	const { accessToken, refreshToken } = createUserTokens(user);

	return {
		accessToken,
		refreshToken,
	};
};

const googleLogin = async (payload: IGoogleLoginPayload) => {
	// console.log("service hit");
	let googleIdTokenPayload: TokenPayload | null | undefined = null;
	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id,
		});

		googleIdTokenPayload = ticket.getPayload();
	} catch (error) {
		console.log("Google ID Token Verification Failed", error);
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid or Expired Google ID Token",
		);
	}

	if (!googleIdTokenPayload) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid or Expired Google ID Token",
		);
	}

	const ifStudentExistWithGoogleAuth = await prisma.user.findUnique({
		where: {
			email: googleIdTokenPayload.email,
			role: Role.STUDENT,
			googleId: googleIdTokenPayload.sub,
		},
	});

	if (!googleIdTokenPayload.email) {
		throw new AppError(httpStatus.BAD_REQUEST, "Google email not found");
	}
	if (!googleIdTokenPayload.name) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Google email username not found",
		);
	}

	let user = ifStudentExistWithGoogleAuth;

	if (!ifStudentExistWithGoogleAuth) {
		const ifStudentExistWithCredential = await prisma.user.findUnique({
			where: {
				email: googleIdTokenPayload.email,
				role: Role.STUDENT,
				authProvider: AuthProvider.CREDENTIAL,
			},
		});
		if (ifStudentExistWithCredential) {
			if (!ifStudentExistWithCredential.emailVerified) {
				throw new AppError(httpStatus.FORBIDDEN, "Email not verified");
			}
			if (ifStudentExistWithCredential.status === UserStatus.BLOCKED) {
				throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
			}
			if (
				ifStudentExistWithCredential.isDeleted ||
				ifStudentExistWithCredential.status === UserStatus.DELETED
			) {
				throw new AppError(httpStatus.GONE, "User is deleted");
			}

			user = await prisma.user.update({
				where: {
					id: ifStudentExistWithCredential.id,
				},
				data: {
					googleId: googleIdTokenPayload.sub,
				},
			});
		} else {
			// google register
			user = await prisma.user.create({
				data: {
					name: googleIdTokenPayload.name,
					email: googleIdTokenPayload.email,
					role: Role.STUDENT,
					googleId: googleIdTokenPayload.sub,
					authProvider: AuthProvider.GOOGLE,
					emailVerified: true,
					student: {
						create: {
							name: googleIdTokenPayload.name,
							email: googleIdTokenPayload.email,
						},
					},
				},
			});

			const templatePath = path.join(
				process.cwd(),
				"src/app/templates/student-welcome-email.ejs",
			);

			const html = await ejs.renderFile(templatePath, {
				name: user.name,
			});

			await transporter.sendMail({
				from: config.email_sender,
				to: user.email,
				subject: "Welcome to Pathshala",
				html,
			});
		}
	}

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
	}
	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new AppError(httpStatus.GONE, "User is deleted");
	}

	const { accessToken, refreshToken } = createUserTokens(user);

	return { accessToken, refreshToken };
};

const forgotPassword = async (payload: IForgotPasswordPayload) => {
	const { email } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: { email },
	});

	if (!isUserExist) {
		throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
	}

	if (isUserExist.status === "BLOCKED") {
		throw new AppError(httpStatus.GONE, "User is deleted");
	}

	if (!isUserExist.emailVerified) {
		throw new AppError(httpStatus.FORBIDDEN, "User not verified");
	}

	if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
		throw new AppError(httpStatus.GONE, "User is deleted");
	}

	if (isUserExist.googleId && !isUserExist.password) {
		throw new AppError(httpStatus.CONFLICT, "User has account with google");
	}

	// redis
	const otp = crypto.randomInt(100000, 1000000).toString();
	// console.log(otp);

	const key = `forgot-password-otp:${isUserExist.email}`;
	await redisClient.set(key, otp, {
		expiration: {
			type: "EX",
			value: 5 * 60,
		},
	});

	const templatePath = path.join(
		process.cwd(),
		"src/app/templates/forgot-password.ejs",
	);

	const html = await ejs.renderFile(templatePath, { otp });

	await transporter.sendMail({
		from: config.email_sender,
		to: isUserExist.email,
		subject: "Forgot Password",
		html,
	});
};

const resetPassword = async (payload: IResetPasswordPayload) => {
	const { email, otp, newPassword } = payload;

	const isUserExist = await prisma.user.findUnique({
		where: { email },
	});

	if (!isUserExist) {
		throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
	}

	if (isUserExist.status === "BLOCKED") {
		throw new AppError(httpStatus.GONE, "User is deleted");
	}

	if (!isUserExist.emailVerified) {
		throw new AppError(httpStatus.FORBIDDEN, "User not verified");
	}

	if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
		throw new AppError(httpStatus.GONE, "User is deleted");
	}

	if (isUserExist.googleId && !isUserExist.password) {
		throw new AppError(httpStatus.CONFLICT, "User has account with google");
	}

	const key = `forgot-password-otp:${isUserExist.email}`;
	const redisOtp = await redisClient.get(key);
	// console.log("redisOtp", redisOtp);
	if (!redisOtp) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP");
	}

	if (redisOtp !== otp) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP does not match");
	}

	const hashedNewPassword = await bcrypt.hash(
		newPassword,
		Number(config.bcrypt_salt_rounds),
	);
	await prisma.user.update({
		where: { email: isUserExist.email },
		data: {
			password: hashedNewPassword,
		},
	});
	// manually delete otp
	await redisClient.del([key]);

	const templatePath = path.join(
		process.cwd(),
		"src/app/templates/reset-password-success.ejs",
	);

	const html = await ejs.renderFile(templatePath, {
		name: isUserExist.name,
	});

	await transporter.sendMail({
		from: config.email_sender,
		to: isUserExist.email,
		subject: "Password Changed",
		html,
	});
};

export const AuthService = {
	registerPatient,
	verifyStudentEmail,
	loginUser,
	getMe,
	refreshToken,
	googleLogin,
	forgotPassword,
	resetPassword,
};
