import { Router } from "express";
import { ProjectController } from "./project.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import {
	assignDeveloperToProjectValidationSchema,
	createProjectValidationSchema,
	paymentInitiateValidationSchema,
	projectRequestOfferValidationSchema,
	projectRequestValidationSchema,
} from "./project.validation";

const router = Router();

// Tips: first auth then zob
router.post(
	"/project-request",
	auth(Role.CLIENT),
	validateRequest(projectRequestValidationSchema),
	ProjectController.projectRequest,
);

router.get(
	"/my-requests",
	auth(Role.CLIENT),
	ProjectController.getMyProjectRequests,
);

router.get(
	"/all-project-request",
	auth(Role.ADMIN),
	ProjectController.getAllProjectRequests,
);

router.patch(
	"/offer-price/:projectRequestId",
	auth(Role.ADMIN),
	validateRequest(projectRequestOfferValidationSchema),
	ProjectController.offerProjectPrice,
);

router.post(
	"/payment-initiate",
	auth(Role.CLIENT),
	validateRequest(paymentInitiateValidationSchema),
	ProjectController.createPaymentInitiate,
);

router.post("/pay", auth(Role.CLIENT), ProjectController.pay);

// called by bkash callback - automatically
router.get("/pay-cover/payment/callback", ProjectController.payCallback);

// project create
router.post(
	"/create-project",
	auth(Role.ADMIN),
	validateRequest(createProjectValidationSchema),
	ProjectController.createProject,
);

router.post(
	"/assign-developer/:projectId",
	auth(Role.PROJECT_MANAGER),
	validateRequest(assignDeveloperToProjectValidationSchema),
	ProjectController.assignDeveloperToProject,
);

router.get(
	"/:projectId/members",
	auth(Role.ADMIN, Role.PROJECT_MANAGER, Role.CLIENT),
	ProjectController.getProjectMembers,
);

export const ProjectRoutes = router;
