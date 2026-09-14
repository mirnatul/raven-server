import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { DeveloperServices } from "./developer.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import {
	ApplyAsDeveloperValidationZodSchema,
	HireDeveloperValidationZodSchema,
} from "./developer.validation";
import { AppError } from "../../utils/AppError";

const applyAsDeveloper = catchAsync(async (req: Request, res: Response) => {
	const zodValidationResult =
		ApplyAsDeveloperValidationZodSchema.safeParse(req.body);

	if (!zodValidationResult.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			zodValidationResult.error.issues[0].message,
		);
	}

	const result = await DeveloperServices.applyAsDeveloper(
		zodValidationResult.data,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Applied as developer successfully",
		data: result,
	});
});

const verifyDeveloperEmail = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await DeveloperServices.verifyDeveloperEmail(payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Developer email verified successfully",
		data: result,
	});
});

const hireDeveloper = catchAsync(async (req: Request, res: Response) => {
	const zodValidationResult = HireDeveloperValidationZodSchema.safeParse(
		req.body,
	);

	if (!zodValidationResult.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			zodValidationResult.error.issues[0].message,
		);
	}

	const result = await DeveloperServices.hireDeveloper(
		zodValidationResult.data,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Developer hired successfully",
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

export const DeveloperController = {
	applyAsDeveloper,
	verifyDeveloperEmail,
	hireDeveloper,
	getAllDevelopers,
};