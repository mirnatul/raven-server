import { Router } from "express";
import { UserController } from "./user.controller";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Tips: first auth then zob
router.patch(
	"/profile-image",
	auth(Role.ADMIN, Role.CLIENT, Role.SUPER_ADMIN, Role.DEVELOPER),
	upload.single("profileImage"),
	UserController.uploadProfileImage,
);

export const UserRoutes = router;
