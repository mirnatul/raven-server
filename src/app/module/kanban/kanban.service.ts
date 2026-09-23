import { TaskStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
	IAssignTaskPayload,
	IDeveloperTaskStatusPayload,
	IPMTaskStatusPayload,
} from "./kanban.interface";

const assignTaskAssign = async (payload: IAssignTaskPayload) => {
	const { projectId, developerId, title, description, priority, dueDate } =
		payload;

	// Check project exists
	const project = await prisma.project.findUnique({
		where: {
			id: projectId,
		},
	});

	if (!project) {
		throw new AppError(404, "Project not found");
	}

	// Check developer exists
	const developer = await prisma.developer.findUnique({
		where: {
			id: developerId,
		},
	});

	if (!developer) {
		throw new AppError(404, "Developer not found");
	}

	// Check developer is assigned to this project
	const projectMember = await prisma.projectMember.findFirst({
		where: {
			projectId,
			userId: developer.userId,
		},
	});

	if (!projectMember) {
		throw new AppError(400, "This developer is not a member of this project");
	}

	// Check developer availability for selected date
	const selectedDate = new Date(dueDate);

	const startOfDay = new Date(selectedDate);
	startOfDay.setHours(0, 0, 0, 0);

	const endOfDay = new Date(selectedDate);
	endOfDay.setHours(23, 59, 59, 999);

	const availability = await prisma.developerAvailability.findFirst({
		where: {
			developerId,
			date: {
				gte: startOfDay,
				lte: endOfDay,
			},
		},
	});

	if (!availability) {
		throw new AppError(400, "Developer is not available on this date");
	}

	// Create task
	const task = await prisma.task.create({
		data: {
			projectId,
			assignedToId: developerId,
			title,
			description,
			priority: priority ?? "MEDIUM",
			dueDate: selectedDate,
		},
	});

	return task;
};

const getProjectTasks = async (projectId: string) => {
	const project = await prisma.project.findUnique({
		where: {
			id: projectId,
		},
	});

	if (!project) {
		throw new AppError(404, "Project not found");
	}

	const tasks = await prisma.task.findMany({
		where: {
			projectId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return tasks;
};

const getDeveloperTasks = async (developerId: string) => {
	const developer = await prisma.developer.findUnique({
		where: {
			id: developerId,
		},
	});

	if (!developer) {
		throw new AppError(404, "Developer not found");
	}

	const tasks = await prisma.task.findMany({
		where: {
			assignedToId: developerId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return tasks;
};

const updateTaskStatusByDeveloper = async (
	payload: IDeveloperTaskStatusPayload,
) => {
	const { taskId, userId, status } = payload;

	const task = await prisma.task.findUnique({
		where: {
			id: taskId,
		},
	});

	if (!task) {
		throw new AppError(404, "Task not found");
	}

	const developer = await prisma.developer.findUnique({
		where: { userId },
	});

	// Make sure this task belongs to this developer
	if (task.assignedToId !== developer?.id) {
		throw new AppError(403, "This task is not assigned to you");
	}

	const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
		BACKLOG: ["TODO"],
		TODO: ["IN_PROGRESS"],
		IN_PROGRESS: ["IN_REVIEW"],
		IN_REVIEW: [],
		CHANGES_REQUESTED: ["IN_PROGRESS"],
		DONE: [],
	};

	const allowedStatuses = allowedTransitions[task.status];

	if (!allowedStatuses.includes(status)) {
		throw new AppError(
			400,
			`Developer cannot change task from ${task.status} to ${status}`,
		);
	}

	const updatedTask = await prisma.task.update({
		where: {
			id: taskId,
		},
		data: {
			status,
		},
	});

	return updatedTask;
};

const updateTaskStatusByProjectManager = async (
	payload: IPMTaskStatusPayload,
) => {
	const { taskId, userId, status } = payload;

	const task = await prisma.task.findUnique({
		where: {
			id: taskId,
		},
		include: {
			project: true,
		},
	});

	if (!task) {
		throw new AppError(404, "Task not found");
	}

	// Make sure this PM manages this project
	if (task.project.projectManagerId !== userId) {
		throw new AppError(403, "You are not the project manager of this project");
	}

	const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
		BACKLOG: [],
		TODO: [],
		IN_PROGRESS: [],
		IN_REVIEW: ["CHANGES_REQUESTED", "DONE"],
		CHANGES_REQUESTED: [],
		DONE: [],
	};

	const allowedStatuses = allowedTransitions[task.status];

	if (!allowedStatuses.includes(status)) {
		throw new AppError(
			400,
			`Project manager cannot change task from ${task.status} to ${status}`,
		);
	}

	// Update task
	const updatedTask = await prisma.task.update({
		where: {
			id: taskId,
		},
		data: {
			status,
		},
	});

	// Get all tasks of this project
	const projectTasks = await prisma.task.findMany({
		where: {
			projectId: task.projectId,
		},
		select: {
			status: true,
		},
	});

	const totalTasks = projectTasks.length;

	const completedTasks = projectTasks.filter(
		(task) => task.status === TaskStatus.DONE,
	).length;

	// If all tasks are DONE, complete the project
	if (totalTasks > 0 && completedTasks === totalTasks) {
		await prisma.project.update({
			where: {
				id: task.projectId,
			},
			data: {
				status: "COMPLETED",
			},
		});
	}

	return updatedTask;
};

export const KanbanService = {
	assignTaskAssign,
	getProjectTasks,
	getDeveloperTasks,
	updateTaskStatusByDeveloper,
	updateTaskStatusByProjectManager,
};
