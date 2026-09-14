export interface IApplyAsDeveloperPayload {
	user: {
		name: string;
		email: string;
		contactNumber?: string;
		address?: string;
	};
	developer: {
		specialization?: string;
		qualifications?: string;
		experienceYears?: number;
		bio?: string;
		portfolioUrl?: string;
		githubUrl?: string;
		linkedinUrl?: string;
	};
}

export interface IVerifyDeveloperEmailPayload {
	email: string;
	otp: string;
}

export interface IHireDeveloperPayload {
	developerId: string;
}