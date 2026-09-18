import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { PaymentService } from "./payment.service";

const bookAppointment = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;
		const result = await PaymentService.createPaymentInitiate(payload, user);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Payment initiated successfully",
			data: result,
		});
	}),
);

const pay = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;
		const result = await PaymentService.pay(payload, user);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Paid Successfully",
			data: result,
		});
	}),
);

const payCallback = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const { redirectUrl } = await PaymentService.payCallback(req.query);
		res.redirect(redirectUrl);
	}),
);

export const PaymentController = {
	bookAppointment,
	pay,
	payCallback,
};
