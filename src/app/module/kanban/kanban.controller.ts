import { Request, Response } from "express";
import httpStatus from "http-status";

import { KanbanService } from "./kanban.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const assignTaskAssign = catchAsync(async (req: Request, res: Response) => {
	const result = await KanbanService.assignTaskAssign(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Task assigned successfully",
		data: result,
	});
});

const getProjectTasks = catchAsync(async (req: Request, res: Response) => {
	const { projectId } = req.params;

	const result = await KanbanService.getProjectTasks(projectId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Project tasks retrieved successfully",
		data: result,
	});
});

const getDeveloperTasks = catchAsync(async (req: Request, res: Response) => {
	const { developerId } = req.params;

	const result = await KanbanService.getDeveloperTasks(developerId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Developer tasks retrieved successfully",
		data: result,
	});
});

const updateTaskStatusByDeveloper = catchAsync(
	async (req: Request, res: Response) => {
		const result = await KanbanService.updateTaskStatusByDeveloper({
			taskId: req.params.taskId as string,
			userId: req?.user?.userId as string,
			status: req.body.status,
		});

		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Task status updated successfully",
			data: result,
		});
	},
);

const updateTaskStatusByProjectManager = catchAsync(
	async (req: Request, res: Response) => {
		const result = await KanbanService.updateTaskStatusByProjectManager({
			taskId: req.params.taskId as string,
			userId: req?.user?.userId as string,
			status: req.body.status,
		});

		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Task status updated successfully",
			data: result,
		});
	},
);

export const KanbanController = {
	assignTaskAssign,
	getProjectTasks,
	getDeveloperTasks,
	updateTaskStatusByDeveloper,
	updateTaskStatusByProjectManager,
};
