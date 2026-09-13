import { Router } from "express";
import { DeveloperController } from "./developer.controller";
import { upload } from "../../lib/multer";
import { validateRequest } from "../../middleware/validateRequest";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
	"/apply-as-developer",
	upload.fields([
		{ name: "resume", maxCount: 1 },
		{ name: "additionalFiles", maxCount: 10 },
	]),
	DeveloperController.applyAsDeveloper,
);

router.post(
	"/apply-as-developer/verify-email",
	DeveloperController.verifyDeveloperEmail,
);

router.post(
	"/approve-doctor",
	auth(Role.ADMIN, Role.SUPER_ADMIN, Role.PRODUCT_MANAGER),
	DeveloperController.verifyDeveloperEmail,
);

router.get(
	"/all-developers",
	auth(Role.ADMIN, Role.SUPER_ADMIN, Role.PRODUCT_MANAGER),
	DeveloperController.getAllDevelopers,
);

export const DeveloperRoutes = router;