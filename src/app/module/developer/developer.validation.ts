import { z } from "zod";

export const ApplyAsDeveloperValidationZodSchema = z.object({
	user: z.object({
		name: z.string().min(2, "Name must be at least 2 characters").max(100),
		email: z.email("Please provide a valid email address"),
	}),

	developer: z.object({
		address: z.string().max(255).optional(),
		specialization: z.string().min(2, "Specialization is required").max(100),
		licenseNumber: z.string().min(2, "License number is required").max(100),
		qualifications: z.string().min(2, "Qualifications are required"),
		experienceYears: z.number().min(0),
		bio: z.string().max(1000).optional(),
		consultationFee: z.number().positive().optional(),
		contactNumber: z
			.string()
			.trim()
			.min(5, "Contact number is invalid")
			.optional(),
	}),
});