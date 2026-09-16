import { Router } from "express";
import { UserController } from "./user.controller";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { UpdateProfileValidationSchema } from "./user.validation";

const router = Router();

// Tips: first auth then zob
router.patch(
	"/profile-image",
	auth(Role.ADMIN, Role.CLIENT, Role.DEVELOPER, Role.PROJECT_MANAGER),
	upload.single("profileImage"),
	UserController.uploadProfileImage,
);

router.patch(
	"/profile",
	auth(Role.ADMIN, Role.CLIENT, Role.DEVELOPER, Role.PROJECT_MANAGER),
	validateRequest(UpdateProfileValidationSchema),
	UserController.updateMyProfile,
);

export const UserRoutes = router;
