import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { DeveloperServices } from "./developer.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { ApplyAsDeveloperValidationZodSchema } from "./developer.validation";
import { AppError } from "../../utils/AppError";

const applyAsDeveloper = catchAsync(async (req: Request, res: Response) => {
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
	const resume = files?.["resume"] ? files["resume"][0] : null;
	const additionalFiles = files?.["additionalFiles"] || [];

	console.log(req.body.data);

	// zod validation
	const zodValidationResult = ApplyAsDeveloperValidationZodSchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new AppError(httpStatus.BAD_REQUEST, zodValidationResult.error.issues[0].message);
	}

	const payload = zodValidationResult.data;

	const result = await DeveloperServices.applyAsDeveloper(
		payload,
		resume,
		additionalFiles,
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

const approveDeveloper = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;

	const result = await DeveloperServices.approveDeveloper(payload, user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Developer approved successfully",
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
	approveDeveloper,
	getAllDevelopers,
};