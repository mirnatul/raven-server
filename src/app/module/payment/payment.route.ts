import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { PaymentController } from "./payment.controller";

const router = Router();

// Tips: first auth then zob
router.post(
	"/book-appointment",
	auth(Role.CLIENT),
	PaymentController.bookAppointment,
);

router.post("/pay-appointment", auth(Role.CLIENT), PaymentController.pay);

// called by bkash callback - automatically
router.get("/book-appointment/payment/callback", PaymentController.payCallback);
export const PaymentRoutes = router;
