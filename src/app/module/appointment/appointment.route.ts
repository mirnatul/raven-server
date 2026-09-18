import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Tips: first auth then zob
router.post(
	"/book-appointment",
	auth(Role.CLIENT),
	AppointmentController.requestService,
);

export const AppointmentRoutes = router;
