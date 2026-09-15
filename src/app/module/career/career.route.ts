import { Router } from "express";

import { CareerController } from "./career.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { createJobOpeningSchema } from "./career.validation";

const router = Router();

router.post(
	"/job-opening",
	auth(Role.ADMIN),
	validateRequest(createJobOpeningSchema),
	CareerController.createJobOpening,
);

export const CareerRoutes = router;
