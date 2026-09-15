import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { CareerServices } from "./career.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createJobOpening = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.userId as string;

	const result = await CareerServices.createJobOpening(req.body, userId);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Job opening created successfully",
		data: result,
	});
});

export const CareerController = {
	createJobOpening,
};
