import { Router } from "express";
import { AppointmentController } from "./appointment.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Tips: first auth then zob
router.post(
	"/book-appointment",
	auth(Role.CLIENT),
	AppointmentController.bookAppointment,
);

router.post(
	"/pay-appointment",
	auth(Role.CLIENT),
	AppointmentController.payAppointment,
);

router.post(
	"/cancel-appointment",
	auth(Role.CLIENT, Role.DEVELOPER, Role.ADMIN, Role.SUPER_ADMIN, Role.PRODUCT_MANAGER),
	AppointmentController.cancelAppointment,
);

// called by bkash callback - automatically
router.get(
	"/book-appointment/payment/callback",
	AppointmentController.bookAppointmentCallback,
);
export const AppointmentRoutes = router;
