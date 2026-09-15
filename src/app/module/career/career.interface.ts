import {
	EmploymentType,
	JobPosition,
	WorkplaceType,
} from "../../../generated/prisma/enums";

export interface ICreateJobOpeningPayload {
	title: string;
	position: JobPosition;
	description: string;
	requirements: string;
	responsibilities: string;
	nice_to_have: string;

	employmentType: EmploymentType;
	workplaceType: WorkplaceType;
	location?: string;

	salaryMin?: number;
	salaryMax?: number;

	experienceMin?: number;
	experienceMax?: number;

	skills?: string[];

	applicationDeadline?: string;
}
