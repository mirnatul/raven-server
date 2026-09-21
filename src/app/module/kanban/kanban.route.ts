import express from "express";

import { KanbanController } from "./kanban.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";

const router = express.Router();

router.post(
	"/assign-task",
	auth(Role.PROJECT_MANAGER),
	KanbanController.assignTaskAssign,
);

router.get(
	"/projects-all-task/:projectId",
	auth(Role.ADMIN, Role.PROJECT_MANAGER),
	KanbanController.getProjectTasks,
);

router.get(
	"/developer-task/:developerId",
	auth(Role.ADMIN, Role.PROJECT_MANAGER, Role.DEVELOPER),
	KanbanController.getDeveloperTasks,
);

export const KanbanRoutes = router;
