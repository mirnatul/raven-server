import { DeveloperVerificationStatus } from "../../../generated/prisma/enums";

export interface IApplyAsDeveloperPayload {
	user: {
		name: string;
		email: string;
	};
	developer: {
		address?: string;
		specialization: string;
		licenseNumber: string;
		qualifications: string;
		experienceYears: number;
		bio?: string;
		consultationFee?: number;
		contactNumber?: string;
	};
}

export interface IVerifyDeveloperEmailPayload {
	email: string;
	otp: string;
}

export interface IApproveDeveloperPayload {
	developerId: string;
	verificationStatus: DeveloperVerificationStatus;
	rejectionReason: string;
}