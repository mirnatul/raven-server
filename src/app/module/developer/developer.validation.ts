import { z } from "zod";

export const ApplyForJobValidationZodSchema = z.object({
	jobOpeningId: z.string().uuid("Please provide a valid job opening ID"),

	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters")
		.max(100, "Name must not exceed 100 characters"),

	email: z.email("Please provide a valid email address").trim().toLowerCase(),

	contactNumber: z
		.string()
		.trim()
		.min(5, "Contact number must be at least 5 characters")
		.max(20, "Contact number must not exceed 20 characters"),

	address: z
		.string()
		.trim()
		.min(5, "Address must be at least 5 characters")
		.max(255, "Address must not exceed 255 characters"),

	additionalFiles: z.any().optional(),

	coverLetter: z
		.string()
		.trim()
		.max(5000, "Cover letter must not exceed 5000 characters")
		.optional(),

	portfolioUrl: z.url("Please provide a valid portfolio URL").optional(),

	githubUrl: z.url("Please provide a valid GitHub URL").optional(),

	linkedinUrl: z.url("Please provide a valid LinkedIn URL").optional(),

	expectedSalary: z.coerce
		.number()
		.positive("Expected salary must be greater than 0")
		.optional(),

	availableFrom: z.coerce.date().optional(),
});

export const HireDeveloperValidationZodSchema = z.object({
	applicationId: z.string().min(1, "Developer id is required"),
});
