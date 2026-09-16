import z from "zod";

export const UpdateProfileValidationSchema = z.object({
	body: z.object({
		name: z
			.string()
			.trim()
			.min(2, "Name must be at least 2 characters")
			.max(100, "Name must not exceed 100 characters")
			.optional(),

		contactNumber: z
			.string()
			.trim()
			.min(10, "Contact number must be at least 10 characters")
			.max(20, "Contact number must not exceed 20 characters")
			.optional(),

		address: z
			.string()
			.trim()
			.max(500, "Address must not exceed 500 characters")
			.optional(),
	}),
});
