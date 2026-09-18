import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AppointmentService } from "./appointment.service";

const requestService = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;
		const result = await AppointmentService.requestService(payload, user);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Appointment payment initiated successfully",
			data: result,
		});
	}),
);

export const AppointmentController = {
	requestService,
};
