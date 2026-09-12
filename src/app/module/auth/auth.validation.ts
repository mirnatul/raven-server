import z from "zod";

const ClientRegistrationZodSchema = z.object({
	name: z.string("Not a string!").min(3, "Too small"), // custom error
	email: z.email("No email"),
	password: z
		.string()
		.min(8, "Minimum 8 character")
		.regex(/[A-Z]/, "must contain 1 uppercase")
		.regex(/[a-z]/, "must contain 1 lowercase")
		.regex(/[0-9]/, "must contain 1 number")
		.regex(/[^A-Za-z0-9]/, "must contain 1 special character"),
	client: z
		.object({
			contactNumber: z.string().optional(),
		})
		.optional(),
});

const LoginZodSchema = z.object({
	email: z.email("No email"),
	password: z
		.string()
		.min(8, "Minimum 8 character")
		.regex(/[A-Z]/, "must contain 1 uppercase")
		.regex(/[a-z]/, "must contain 1 lowercase")
		.regex(/[0-9]/, "must contain 1 number")
		.regex(/[^A-Za-z0-9]/, "must contain 1 special character"),
});

const ForgotPasswordZodSchema = z.object({
	email: z.email("No email"),
});

const ResetPasswordZodSchema = z.object({
	email: z.email("No email"),
	newPassword: z
		.string()
		.min(8, "Minimum 8 character")
		.regex(/[A-Z]/, "must contain 1 uppercase")
		.regex(/[a-z]/, "must contain 1 lowercase")
		.regex(/[0-9]/, "must contain 1 number")
		.regex(/[^A-Za-z0-9]/, "must contain 1 special character"),
	otp: z.string().length(6),
});

const ClientEmailVerifyZodSchema = z.object({
	email: z.email("No email"),
	otp: z.string().length(6),
});

export const UserValidation = {
	ClientRegistrationZodSchema,
	LoginZodSchema,
	ForgotPasswordZodSchema,
	ResetPasswordZodSchema,
	ClientEmailVerifyZodSchema,
};
