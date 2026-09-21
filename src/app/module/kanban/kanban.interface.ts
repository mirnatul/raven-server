import { TaskPriority } from "../../../generated/prisma/enums";

export interface IAssignTaskPayload {
	projectId: string;
	developerId: string;
	title: string;
	description?: string;
	priority?: TaskPriority;
	dueDate: string;
}
