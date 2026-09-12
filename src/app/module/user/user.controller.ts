import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserServices } from "./user.service";
import { AppError } from "../../utils/AppError";

const uploadProfileImage = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		if (!req.file) {
			throw new AppError(httpStatus.BAD_REQUEST, "No file uploaded");
		}

		const userId = req.user?.userId as string;

		const result = await UserServices.uploadProfileImage(
			req.file?.buffer,
			userId,
		);
		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "New token generated successfully",
			data: result,
		});
	}),
);

export const UserController = { uploadProfileImage };
