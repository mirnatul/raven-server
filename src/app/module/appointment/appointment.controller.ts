import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { AppointmentService } from "./appointment.service";

const bookAppointment = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;
		const result = await AppointmentService.bookAppointment(payload, user);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Appointment payment initiated successfully",
			data: result,
		});
	}),
);

const payAppointment = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;
		const result = await AppointmentService.payAppointment(payload, user);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Appointment payment initiated successfully",
			data: result,
		});
	}),
);

const bookAppointmentCallback = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const { redirectUrl } = await AppointmentService.bookAppointmentCallback(
			req.query,
		);
		res.redirect(redirectUrl);
	}),
);

const cancelAppointment = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const payload = req.body;
		const result = await AppointmentService.cancelAppointment(payload);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Appointment cancelled and refunded successfully",
			data: result,
		});
	}),
);

export const AppointmentController = {
	bookAppointment,
	payAppointment,
	bookAppointmentCallback,
	cancelAppointment,
};
