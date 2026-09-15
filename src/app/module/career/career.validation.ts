import { z } from "zod";

export const createJobOpeningSchema = z.object({
	title: z.string().min(1, "Job title is required"),

	position: z.enum(["DEVELOPER", "PROJECT_MANAGER"]),

	description: z.string().min(1, "Description is required"),

	requirements: z.string().min(1, "Requirements are required"),

	responsibilities: z.string().min(1, "Responsibilities are required"),

	nice_to_have: z.string().min(1, "Nice to have is required"),

	employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),

	workplaceType: z.enum(["ONSITE", "REMOTE", "HYBRID"]),

	location: z.string().optional(),

	salaryMin: z.number().nonnegative().optional(),

	salaryMax: z.number().nonnegative().optional(),

	experienceMin: z.number().int().nonnegative().optional(),

	experienceMax: z.number().int().nonnegative().optional(),

	skills: z.array(z.string()).optional(),

	applicationDeadline: z.string().datetime().optional(),
});
