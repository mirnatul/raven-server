import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Tips: first auth then zob
router.post(
	"/book-appointment",
	auth(Role.STUDENT),
	AppointmentController.bookAppointment,
);

router.post(
	"/pay-appointment",
	auth(Role.STUDENT),
	AppointmentController.payAppointment,
);

router.post(
	"/cancel-appointment",
	auth(Role.STUDENT, Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN),
	AppointmentController.cancelAppointment,
);

// called by bkash callback - automatically
router.get(
	"/book-appointment/payment/callback",
	AppointmentController.bookAppointmentCallback,
);
export const AppointmentRoutes = router;
