import { TaskPriority, TaskStatus } from "../../../generated/prisma/enums";

export interface IAssignTaskPayload {
	projectId: string;
	developerId: string;
	title: string;
	description?: string;
	priority?: TaskPriority;
	dueDate: string;
}

export interface IDeveloperTaskStatusPayload {
	taskId: string;
	developerId: string;
	status: TaskStatus;
}

export interface IPMTaskStatusPayload {
	taskId: string;
	projectManagerId: string;
	status: TaskStatus;
}
