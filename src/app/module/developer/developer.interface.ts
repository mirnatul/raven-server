import { Prisma } from "../../../generated/prisma/client";

export interface IApplyForJobPayload {
	jobOpeningId: string;

	name: string;
	email: string;
	contactNumber: string;
	address: string;

	additionalFiles?: Prisma.InputJsonValue;

	coverLetter?: string;
	portfolioUrl?: string;
	githubUrl?: string;
	linkedinUrl?: string;

	expectedSalary?: number;
	availableFrom?: Date;
}

export interface IVerifyDeveloperEmailPayload {
	email: string;
	otp: string;
}

export interface IHireDeveloperPayload {
	applicationId: string;
}
