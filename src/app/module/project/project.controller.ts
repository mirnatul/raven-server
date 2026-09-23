import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { ProjectService } from "./project.service";

const getAllService = catchAsync(async (req: Request, res: Response) => {
	const result = await ProjectService.getAllService();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Services fetched successfully",
		data: result,
	});
});

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
			message: "Payment initiated successfully",
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
			message: "Payment initiated successfully",
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

const createProject = catchAsync(async (req: Request, res: Response) => {
	const result = await ProjectService.createProject(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Project created successfully",
		data: result,
	});
});

const assignDeveloperToProject = catchAsync(
	async (req: Request, res: Response) => {
		const { projectId } = req.params;

		const result = await ProjectService.assignDeveloperToProject(
			projectId as string,
			req.body,
			req.user!,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Developer assigned to project successfully",
			data: result,
		});
	},
);

const getProjectMembers = catchAsync(async (req: Request, res: Response) => {
	const { projectId } = req.params;

	const result = await ProjectService.getProjectMembers(projectId as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Project members retrieved successfully",
		data: result,
	});
});

const getProjectDeveloperScheduleReport = catchAsync(
	async (req: Request, res: Response) => {
		const { projectId } = req.params;

		const result = await ProjectService.getProjectDeveloperScheduleReport(
			projectId as string,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Project developer schedule report retrieved successfully",
			data: result,
		});
	},
);

const getProjectProgress = catchAsync(async (req: Request, res: Response) => {
	const { projectId } = req.params;

	const result = await ProjectService.getProjectProgress(projectId as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Project progress retrieved successfully",
		data: result,
	});
});

const markProjectAsDelivered = catchAsync(
	async (req: Request, res: Response) => {
		const { projectId } = req.params;

		const result = await ProjectService.markProjectAsDelivered(
			projectId as string,
			req?.user?.userId as string,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Project marked as delivered successfully",
			data: result,
		});
	},
);

const createProjectReview = catchAsync(async (req: Request, res: Response) => {
	const { projectId } = req.params;

	const { rating, comment } = req.body;

	const result = await ProjectService.createProjectReview({
		projectId: projectId as string,
		clientId: req?.user?.userId as string,
		rating,
		comment,
	});

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Project review submitted successfully",
		data: result,
	});
});

export const ProjectController = {
	getAllService,
	projectRequest,
	getMyProjectRequests,
	getAllProjectRequests,
	offerProjectPrice,
	createPaymentInitiate,
	pay,
	payCallback,
	createProject,
	assignDeveloperToProject,
	getProjectMembers,
	getProjectDeveloperScheduleReport,
	getProjectProgress,
	markProjectAsDelivered,
	createProjectReview,
};
