import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { DeveloperServices } from "./developer.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import {
	ApplyForJobValidationZodSchema,
	HireDeveloperValidationZodSchema,
} from "./developer.validation";
import { AppError } from "../../utils/AppError";

const applyForJob = catchAsync(async (req: Request, res: Response) => {
	if (!req.file) {
		throw new AppError(httpStatus.BAD_REQUEST, "Resume is required");
	}

	const zodValidationResult = ApplyForJobValidationZodSchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			zodValidationResult.error.issues[0].message,
		);
	}

	const payload = zodValidationResult.data;

	const result = await DeveloperServices.applyForJob(payload, req.file.buffer);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Job application submitted successfully",
		data: result,
	});
});

const hireApplicant = catchAsync(async (req: Request, res: Response) => {
	const result = await DeveloperServices.hireApplicant(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Hired Successfully",
		data: result,
	});
});

const getAllDevelopers = catchAsync(async (req: Request, res: Response) => {
	const { data, meta } = await DeveloperServices.getAllDevelopers(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Developer retrieved successfully",
		data: data,
		meta: meta,
	});
});

const updateDeveloperProfile = catchAsync(
	async (req: Request, res: Response) => {
		const userId = req.user?.userId as string;

		const result = await DeveloperServices.updateDeveloperProfile(
			userId,
			req.body,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Developer profile updated successfully",
			data: result,
		});
	},
);

const getDeveloperNext30DaysSchedule = catchAsync(
	async (req: Request, res: Response) => {
		const { developerId } = req.params;

		const result = await DeveloperServices.getDeveloperNext30DaysSchedule(
			developerId as string,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Developer schedule retrieved successfully",
			data: result,
		});
	},
);

export const DeveloperController = {
	applyForJob,
	hireApplicant,
	getAllDevelopers,
	updateDeveloperProfile,
	getDeveloperNext30DaysSchedule,
};
