import { Router } from "express";
import { DeveloperController } from "./developer.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import {
	ApplyForJobValidationZodSchema,
	HireDeveloperValidationZodSchema,
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

export const DeveloperRoutes = router;
