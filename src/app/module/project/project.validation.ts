import { z } from "zod";

export const projectRequestValidationSchema = z.object({
	serviceId: z.string().min(1, "Service ID is required"),
	projectDescription: z.string().min(1, "Project description is required"),
});

export const projectRequestOfferValidationSchema = z.object({
	proposedPrice: z.number().positive("Proposed price must be greater than 0"),
	adminMessage: z.string().optional(),
});

export const paymentInitiateValidationSchema = z.object({
	projectRequestId: z.string().min(1, "Project request ID is required"),
});

export const createProjectValidationSchema = z.object({
	projectRequestId: z.string().min(1, "Project request ID is required"),
	title: z.string().min(1, "Project title is required"),
	description: z.string().min(1, "Project description is required"),
	startDate: z.coerce.date().optional(),
	deadline: z.coerce.date().optional(),
	projectManagerId: z.string().min(1, "Project manager ID is required"),
});
