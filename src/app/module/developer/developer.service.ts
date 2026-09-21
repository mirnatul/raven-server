import { prisma } from "../../lib/prisma";
import config from "../../config";
import {
	EmploymentStatus,
	JobApplicationStatus,
} from "../../../generated/prisma/enums";
import path from "path";
import ejs from "ejs";
import { transporter } from "../../lib/nodemailer";
import {
	IApplyForJobPayload,
	IHireDeveloperPayload,
	IUpdateDeveloperProfilePayload,
} from "./developer.interface";
import { IQuery } from "../../interfaces";
import { DeveloperWhereInput } from "../../../generated/prisma/models";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { UploadApiResponse } from "cloudinary";
import cloudinary from "../../lib/cloudinary";
import bcrypt from "bcryptjs";

const applyForJob = async (
	payload: IApplyForJobPayload,
	resumeBuffer: Buffer,
) => {
	const email = payload.email.trim().toLowerCase();

	const jobOpening = await prisma.jobOpening.findUnique({
		where: {
			id: payload.jobOpeningId,
		},
	});

	if (!jobOpening) {
		throw new AppError(httpStatus.NOT_FOUND, "Job opening not found");
	}

	if (
		jobOpening.position !== "DEVELOPER" &&
		jobOpening.position !== "PROJECT_MANAGER"
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Applications are not allowed for this position",
		);
	}

	const existingApplication = await prisma.jobApplication.findFirst({
		where: {
			jobOpeningId: payload.jobOpeningId,
			email,
		},
	});

	if (existingApplication) {
		throw new AppError(
			httpStatus.CONFLICT,
			"You have already applied for this job",
		);
	}

	// resume to cloudinary
	const cloudinaryResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "image",
					},
					(error, result) => {
						if (error) {
							return reject(error);
						}

						if (!result) {
							return reject(new Error("No result returned from Cloudinary"));
						}

						resolve(result);
					},
				)
				.end(resumeBuffer);
		},
	);

	// create job application
	const application = await prisma.jobApplication.create({
		data: {
			jobOpeningId: jobOpening.id,

			name: payload.name,
			email,
			contactNumber: payload.contactNumber,
			address: payload.address,

			// Cloudinary data
			resume: cloudinaryResult.secure_url,
			resumePublicId: cloudinaryResult.public_id,

			coverLetter: payload.coverLetter,
			portfolioUrl: payload.portfolioUrl,
			githubUrl: payload.githubUrl,
			linkedinUrl: payload.linkedinUrl,

			expectedSalary: payload.expectedSalary,
			availableFrom: payload.availableFrom,

			status: JobApplicationStatus.UNDER_REVIEW,
		},
	});
	return application;
};

const hireApplicant = async (payload: IHireDeveloperPayload) => {
	const { applicationId } = payload;

	const application = await prisma.jobApplication.findUnique({
		where: {
			id: applicationId,
		},
		include: {
			jobOpening: true,
		},
	});

	if (!application) {
		throw new AppError(404, "Job application not found");
	}

	if (application.status === "HIRED") {
		throw new AppError(400, "Applicant is already hired");
	}

	const randomDeveloperPassword = Math.random().toString(36).slice(-8);

	const hashedPassword = await bcrypt.hash(
		randomDeveloperPassword,
		Number(config.bcrypt_salt_rounds),
	);

	const result = await prisma.$transaction(async (tx) => {
		// Create User
		const user = await tx.user.create({
			data: {
				name: application.name,
				email: application.email,
				contactNumber: application.contactNumber,
				address: application.address,
				password: hashedPassword,
				role: application.jobOpening.position,
				needPasswordChange: true,
			},
		});

		// Create Developer
		const developer = await tx.developer.create({
			data: {
				userId: user.id,
				title: application.jobOpening.title,
				resume: application.resume,
				resumePublicId: application.resumePublicId,
				portfolioUrl: application.portfolioUrl,
				githubUrl: application.githubUrl,
				linkedinUrl: application.linkedinUrl,
				joiningDate: application.availableFrom,
				employmentStatus: EmploymentStatus.ACTIVE,
			},
		});

		// Update Application
		const updatedApplication = await tx.jobApplication.update({
			where: {
				id: application.id,
			},
			data: {
				status: "HIRED",
				hiredAt: new Date(),
				userId: user.id,
			},
		});

		return {
			user,
			developer,
			application: updatedApplication,
			temporaryPassword: randomDeveloperPassword,
		};
	});

	// Send email AFTER transaction succeeds
	const templatePath = path.join(
		process.cwd(),
		"src/app/templates/hired-message.ejs",
	);

	const html = await ejs.renderFile(templatePath, {
		name: result.user.name,
	});

	await transporter.sendMail({
		from: config.email_sender,
		to: result.user.email,
		subject: "Hiring Message",
		html,
	});

	return result;
};

const getAllDevelopers = async (query: IQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortOrder = query.sortOrder ? query.sortOrder : "desc";

	const andConditions: DeveloperWhereInput[] = [];

	//Searching
	if (query.searchTerm) {
		andConditions.push({
			OR: [
				{
					user: {
						is: {
							name: { contains: query.searchTerm, mode: "insensitive" },
						},
					},
				},
				{
					user: {
						is: {
							email: { contains: query.searchTerm, mode: "insensitive" },
						},
					},
				},
				{
					specialization: {
						contains: query.searchTerm,
						mode: "insensitive",
					},
				},
			],
		});
	}

	//filtering
	if (query.specialization) {
		andConditions.push({
			specialization: { equals: query.specialization, mode: "insensitive" },
		});
	}

	if (query.experienceYears) {
		andConditions.push({
			experienceYears: { equals: Number(query.experienceYears) },
		});
	}

	if (query.employmentStatus) {
		andConditions.push({
			employmentStatus: query.employmentStatus as EmploymentStatus,
		});
	}

	const allDevelopers = await prisma.developer.findMany({
		where: {
			AND: andConditions.length > 0 ? andConditions : undefined,
		},

		take: limit,
		skip: skip,

		orderBy: {
			[sortBy]: sortOrder,
		},

		include: {
			user: {
				omit: {
					password: true,
				},
			},
		},
	});

	const totalDeveloperCount = await prisma.developer.count({
		where: {
			AND: andConditions,
		},
	});

	return {
		data: allDevelopers,
		meta: {
			page: page,
			limit: limit,
			total: totalDeveloperCount,
			totalPages: Math.ceil(totalDeveloperCount / limit),
		},
	};
};

const updateDeveloperProfile = async (
	userId: string,
	payload: IUpdateDeveloperProfilePayload,
) => {
	const developer = await prisma.developer.findUnique({
		where: {
			userId,
		},
	});

	if (!developer) {
		throw new AppError(404, "Developer profile not found");
	}

	const updatedDeveloper = await prisma.developer.update({
		where: {
			userId,
		},
		data: {
			title: payload.title,
			bio: payload.bio,
			experienceYears: payload.experienceYears,
			specialization: payload.specialization,
			qualifications: payload.qualifications,
			portfolioUrl: payload.portfolioUrl,
			githubUrl: payload.githubUrl,
			linkedinUrl: payload.linkedinUrl,
		},
		select: {
			id: true,
			userId: true,
			title: true,
			resume: true,
			resumePublicId: true,
			bio: true,
			experienceYears: true,
			specialization: true,
			qualifications: true,
			joiningDate: true,
			employmentStatus: true,
			portfolioUrl: true,
			githubUrl: true,
			linkedinUrl: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return updatedDeveloper;
};

const getDeveloperNext30DaysSchedule = async (developerId: string) => {
	const developer = await prisma.developer.findUnique({
		where: {
			id: developerId,
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	});

	if (!developer) {
		throw new AppError(404, "Developer not found");
	}

	const today = new Date();

	today.setUTCHours(0, 0, 0, 0);

	const endDate = new Date(today);
	endDate.setUTCDate(endDate.getUTCDate() + 30);

	const availability = await prisma.developerAvailability.findMany({
		where: {
			developerId,
			date: {
				gte: today,
				lt: endDate,
			},
		},
		include: {
			project: {
				select: {
					id: true,
					title: true,
				},
			},
		},
		orderBy: {
			date: "asc",
		},
	});

	const availabilityMap = new Map(
		availability.map((item) => [item.date.toISOString().split("T")[0], item]),
	);

	const schedule = [];

	for (let i = 0; i < 30; i++) {
		const date = new Date(today);
		date.setUTCDate(today.getUTCDate() + i);

		const dateString = date.toISOString().split("T")[0];

		const record = availabilityMap.get(dateString);

		schedule.push({
			date: dateString,
			status: record?.status ?? "AVAILABLE",
			project: record?.project ?? null,
		});
	}

	return {
		developer: {
			id: developer.id,
			userId: developer.userId,
			name: developer.user.name,
			email: developer.user.email,
			title: developer.title,
			employmentStatus: developer.employmentStatus,
		},
		schedule,
	};
};

export const DeveloperServices = {
	applyForJob,
	hireApplicant,
	getAllDevelopers,
	updateDeveloperProfile,
	getDeveloperNext30DaysSchedule,
};
