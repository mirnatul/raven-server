import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TeacherServices } from "./teacher.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { ApplyAsTeacherValidationZodSchema } from "./teacher.validation";
import { AppError } from "../../utils/AppError";

const applyAsTeacher = catchAsync(async (req: Request, res: Response) => {
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
	const resume = files?.["resume"] ? files["resume"][0] : null;
	const additionalFiles = files?.["additionalFiles"] || [];

	console.log(req.body.data);

	// zod validation
	const zodValidationResult = ApplyAsTeacherValidationZodSchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new AppError(httpStatus.BAD_REQUEST, zodValidationResult.error.issues[0].message);
	}

	const payload = zodValidationResult.data;

	const result = await TeacherServices.applyAsTeacher(
		payload,
		resume,
		additionalFiles,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Applied as teacher successfully",
		data: result,
	});
});

const verifyTeacherEmail = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await TeacherServices.verifyTeacherEmail(payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Teacher email verified successfully",
		data: result,
	});
});

const approveTeacher = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;

	const result = await TeacherServices.approveTeacher(payload, user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Teacher approved successfully",
		data: result,
	});
});

const getAllTeachers = catchAsync(async (req: Request, res: Response) => {
	const { data, meta } = await TeacherServices.getAllTeachers(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctor retrieved successfully",
		data: data,
		meta: meta,
	});
});

export const TeacherController = {
	applyAsTeacher,
	verifyTeacherEmail,
	approveTeacher,
	getAllTeachers,
};
