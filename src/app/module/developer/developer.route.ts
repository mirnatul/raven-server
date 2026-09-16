import { Router } from "express";
import { DeveloperController } from "./developer.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import {
	ApplyForJobValidationZodSchema,
	HireDeveloperValidationZodSchema,
	UpdateDeveloperProfileValidationSchema,
} from "./developer.validation";
import { upload } from "../../lib/multer";

const router = Router();

router.post(
	"/apply-for-job",
	upload.single("resume"),
	DeveloperController.applyForJob,
);

router.post(
	"/hired",
	auth(Role.ADMIN),
	validateRequest(HireDeveloperValidationZodSchema),
	DeveloperController.hireApplicant,
);

router.get(
	"/all-developers",
	auth(Role.ADMIN, Role.PROJECT_MANAGER),
	DeveloperController.getAllDevelopers,
);

router.patch(
	"/developer-profile",
	auth(Role.ADMIN, Role.DEVELOPER, Role.PROJECT_MANAGER),
	validateRequest(UpdateDeveloperProfileValidationSchema),
	DeveloperController.updateDeveloperProfile,
);

export const DeveloperRoutes = router;
