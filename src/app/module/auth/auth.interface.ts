import type { Role } from "../../../generated/prisma/browser";

export interface ILoginUserPayload {
	email: string;
	password: string;
}

export interface IRegisterClientPayload {
	name: string;
	email: string;
	password: string;
	contactNumber: string;
	address: string;
	companyName?: string;
	bio?: string;
}

export interface IVerifyEmailPayload {
	email: string;
	otp: string;
}

export interface IRequestUser {
	userId: string;
	email: string;
	name: string;
	role: Role;
}

export interface IGoogleLoginPayload {
	idToken: string;
	client?: {
		companyName?: string;
		contactNumber?: string;
		address?: string;
		bio?: string;
	};
}

export interface IForgotPasswordPayload {
	email: string;
}

export interface IResetPasswordPayload {
	email: string;
	newPassword: string;
	otp: string;
}
