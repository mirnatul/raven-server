import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidation } from "./auth.validation";

const router = Router();

// Tips: first auth then zob
router.post(
	"/register",
	validateRequest(UserValidation.StudentRegistrationZodSchema),
	AuthController.registerStudent,
);

router.post(
	"/verify-email",
	validateRequest(UserValidation.StudentEmailVerifyZodSchema),
	AuthController.verifyStudentEmail,
);

router.post(
	"/login",
	validateRequest(UserValidation.LoginZodSchema),
	AuthController.loginUser,
);
router.get(
	"/me",
	auth(Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.SUPER_ADMIN),
	AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);

router.post(
	"/forgot-password",
	validateRequest(UserValidation.ForgotPasswordZodSchema),
	AuthController.forgotPassword,
);
router.post(
	"/reset-password",
	validateRequest(UserValidation.ResetPasswordZodSchema),
	AuthController.resetPassword,
);

router.post("/google", AuthController.googleLogin);
export const AuthRoutes = router;
