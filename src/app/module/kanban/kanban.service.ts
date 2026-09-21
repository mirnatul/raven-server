import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IAssignTaskPayload } from "./kanban.interface";

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

export const KanbanService = {
	assignTaskAssign,
	getProjectTasks,
	getDeveloperTasks,
};
