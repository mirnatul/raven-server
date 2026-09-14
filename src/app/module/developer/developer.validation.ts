import { z } from "zod";

export const ApplyAsDeveloperValidationZodSchema = z.object({
	user: z.object({
		name: z.string().min(2, "Name must be at least 2 characters").max(100),
		email: z.email("Please provide a valid email address"),
		contactNumber: z
			.string()
			.trim()
			.min(5, "Contact number is invalid")
			.max(20)
			.optional(),
		address: z.string().max(255).optional(),
	}),

	developer: z.object({
		specialization: z.string().min(2, "Specialization is required").max(100).optional(),
		qualifications: z.string().max(500).optional(),
		experienceYears: z.number().min(0).max(60).optional(),
		bio: z.string().max(1000).optional(),
		portfolioUrl: z.url("Portfolio URL is invalid").optional(),
		githubUrl: z.url("GitHub URL is invalid").optional(),
		linkedinUrl: z.url("LinkedIn URL is invalid").optional(),
	}),
});

export const HireDeveloperValidationZodSchema = z.object({
	developerId: z.string().min(1, "Developer id is required"),
});