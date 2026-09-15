import { prisma } from "../../lib/prisma";
import { z } from "zod";

import { createJobOpeningSchema } from "./career.validation";

type ICreateJobOpeningPayload = z.infer<typeof createJobOpeningSchema>;

const createJobOpening = async (
	payload: ICreateJobOpeningPayload,
	userId: string,
) => {
	const jobOpening = await prisma.jobOpening.create({
		data: {
			title: payload.title,
			position: payload.position,
			description: payload.description,
			requirements: payload.requirements,
			responsibilities: payload.responsibilities,
			nice_to_have: payload.nice_to_have,

			employmentType: payload.employmentType,
			workplaceType: payload.workplaceType,
			location: payload.location,

			salaryMin: payload.salaryMin,
			salaryMax: payload.salaryMax,

			experienceMin: payload.experienceMin,
			experienceMax: payload.experienceMax,

			skills: payload.skills,

			applicationDeadline: payload.applicationDeadline
				? new Date(payload.applicationDeadline)
				: undefined,

			status: "PUBLISHED",

			user: {
				connect: {
					id: userId,
				},
			},
		},
	});

	return jobOpening;
};

export const CareerServices = {
	createJobOpening,
};
