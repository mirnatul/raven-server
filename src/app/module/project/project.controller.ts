import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { ProjectService } from "./project.service";

const projectRequest = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;
		const result = await ProjectService.projectRequest(payload, user);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Project request send successfully",
			data: result,
		});
	}),
);

const getMyProjectRequests = catchAsync(async (req: Request, res: Response) => {
	const user = req.user!;

	const result = await ProjectService.getMyProjectRequests(user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "My project requests retrieved successfully",
		data: result,
	});
});

const getAllProjectRequests = catchAsync(
	async (req: Request, res: Response) => {
		const result = await ProjectService.getAllProjectRequests();

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Project requests retrieved successfully",
			data: result,
		});
	},
);

const offerProjectPrice = catchAsync(async (req: Request, res: Response) => {
	const { projectRequestId } = req.params;
	const payload = req.body;

	const result = await ProjectService.offerProjectPrice(
		projectRequestId as string,
		payload,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Project price offered successfully",
		data: result,
	});
});

const createPaymentInitiate = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;
		const result = await ProjectService.createPaymentInitiate(payload, user);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Appointment payment initiated successfully",
			data: result,
		});
	}),
);

const pay = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const payload = req.body;
		const user = req.user!;
		const result = await ProjectService.pay(payload, user);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Appointment payment initiated successfully",
			data: result,
		});
	}),
);

const payCallback = catchAsync(
	catchAsync(async (req: Request, res: Response) => {
		const { redirectUrl } = await ProjectService.payCallback(req.query);
		res.redirect(redirectUrl);
	}),
);

export const ProjectController = {
	projectRequest,
	getMyProjectRequests,
	getAllProjectRequests,
	offerProjectPrice,
	createPaymentInitiate,
	pay,
	payCallback,
};
