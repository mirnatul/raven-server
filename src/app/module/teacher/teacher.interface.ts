import { TeacherVerificationStatus } from "../../../generated/prisma/enums";

export interface IApplyAsTeacherPayload {
	user: {
		name: string;
		email: string;
	};
	teacher: {
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

export interface IVerifyTeacherEmailPayload {
	email: string;
	otp: string;
}

export interface IApproveTeacherPayload {
	teacherId: string;
	verificationStatus: TeacherVerificationStatus;
	rejectionReason: string;
}
