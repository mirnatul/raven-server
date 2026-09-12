import { Router } from "express";
import { TeacherController } from "./teacher.controller";
import { upload } from "../../lib/multer";
import { validateRequest } from "../../middleware/validateRequest";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
	"/apply-as-teacher",
	upload.fields([
		{ name: "resume", maxCount: 1 },
		{ name: "additionalFiles", maxCount: 10 },
	]),
	TeacherController.applyAsTeacher,
);

router.post(
	"/apply-as-teacher/verify-email",
	TeacherController.verifyTeacherEmail,
);

router.post(
	"/approve-doctor",
	auth(Role.ADMIN, Role.SUPER_ADMIN),
	TeacherController.verifyTeacherEmail,
);

router.get(
	"/all-teachers",
	auth(Role.ADMIN, Role.SUPER_ADMIN),
	TeacherController.getAllTeachers,
);

export const TeacherRoutes = router;
