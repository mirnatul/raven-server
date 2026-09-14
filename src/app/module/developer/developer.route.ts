import { Router } from "express";
import { DeveloperController } from "./developer.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/apply-as-developer", DeveloperController.applyAsDeveloper);

router.post(
	"/apply-as-developer/verify-email",
	DeveloperController.verifyDeveloperEmail,
);

router.post(
	"/hired-developer",
	auth(Role.ADMIN, Role.PROJECT_MANAGER),
	DeveloperController.hireDeveloper,
);

router.get(
	"/all-developers",
	auth(Role.ADMIN, Role.PROJECT_MANAGER),
	DeveloperController.getAllDevelopers,
);

export const DeveloperRoutes = router;