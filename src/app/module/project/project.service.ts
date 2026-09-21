import {
	PaymentStatus,
	ProjectRequestStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import {
	IAssignDeveloperToProjectPayload,
	ICreateProjectPayload,
	IPaymentInitiatePayload,
	IProjectRequestOfferPayload,
	IProjectRequestPayload,
} from "./project.interface";
import httpStatus from "http-status";

const projectRequest = async (
	payload: IProjectRequestPayload,
	user: RequestUser,
) => {
	const { serviceId, projectDescription } = payload;

	// Check service exists
	const service = await prisma.service.findUnique({
		where: {
			id: serviceId,
		},
	});

	if (!service) {
		throw new AppError(httpStatus.NOT_FOUND, "Service not found");
	}

	// If logged-in client, verify the client profile exists
	let clientId: string | undefined;

	if (user?.userId) {
		const client = await prisma.client.findUnique({
			where: {
				userId: user.userId,
			},
		});

		if (!client) {
			throw new AppError(httpStatus.NOT_FOUND, "Client profile not found");
		}

		clientId = client.id;
	}

	// Create project request
	const result = await prisma.projectRequest.create({
		data: {
			clientId,
			serviceId,
			projectDescription,
			status: ProjectRequestStatus.UNDER_REVIEW,
		},
		include: {
			service: true,
		},
	});

	return result;
};

const getMyProjectRequests = async (user: RequestUser) => {
	const client = await prisma.client.findUnique({
		where: {
			userId: user.userId,
		},
	});

	if (!client) {
		throw new AppError(httpStatus.NOT_FOUND, "Client profile not found");
	}

	const result = await prisma.projectRequest.findMany({
		where: {
			clientId: client.id,
		},
		orderBy: {
			createdAt: "desc",
		},
		include: {
			service: true,
		},
	});

	return result;
};

const getAllProjectRequests = async () => {
	const result = await prisma.projectRequest.findMany({
		orderBy: {
			createdAt: "desc",
		},
		include: {
			client: {
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							contactNumber: true,
						},
					},
				},
			},
			service: true,
		},
	});

	return result;
};

const offerProjectPrice = async (
	projectRequestId: string,
	payload: IProjectRequestOfferPayload,
) => {
	const { proposedPrice, adminMessage } = payload;

	// Check project request exists
	const projectRequest = await prisma.projectRequest.findUnique({
		where: {
			id: projectRequestId,
		},
	});

	if (!projectRequest) {
		throw new AppError(httpStatus.NOT_FOUND, "Project request not found");
	}

	// Check current status
	if (projectRequest.status !== ProjectRequestStatus.UNDER_REVIEW) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Project request is not under review",
		);
	}

	// Offer price
	const result = await prisma.projectRequest.update({
		where: {
			id: projectRequestId,
		},
		data: {
			proposedPrice,
			adminMessage,
			status: ProjectRequestStatus.OFFER_PROJECT_PRICE,
		},
	});

	return result;
};

// create payment initiate
const createPaymentInitiate = async (
	payload: IPaymentInitiatePayload,
	user: RequestUser,
) => {
	// console.log(payload.projectRequestId);
	const transactionResult = await prisma.$transaction(
		async (tx) => {
			// create a new appointment with status PENDING
			const projectRequest = await tx.projectRequest.findUnique({
				where: {
					id: payload.projectRequestId,
					// status: ProjectRequestStatus.OFFER_PROJECT_PRICE,
				},
			});

			if (!projectRequest) {
				throw new AppError(httpStatus.NOT_FOUND, "There is no project request");
			}

			if (projectRequest.status === "PAID") {
				throw new AppError(
					httpStatus.CONFLICT,
					"You already paid for this project",
				);
			}

			if (projectRequest.status !== ProjectRequestStatus.OFFER_PROJECT_PRICE) {
				throw new AppError(httpStatus.NOT_FOUND, "Admin don't offer price yet");
			}

			const bkashIdToken = await getBkashIdToken();
			if (!bkashIdToken) {
				throw new AppError(
					httpStatus.BAD_GATEWAY,
					"Failed to get bKash ID token",
				);
			}

			const bkashCreatePayment = await fetch(
				`${config.bkash_base_url}/tokenized/checkout/create`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						Authorization: bkashIdToken,
						"X-App-Key": config.bkash_app_key,
					},
					body: JSON.stringify({
						// agreementID: "TokenizedMerchant01L3IKB6H1565072174986", // appointment id
						mode: "0011",
						// payerReference: "01723888888", // user email
						payerReference: user.email, // user email
						callbackURL: `${config.bkash_callback_url}/project/pay-cover/payment/callback`, // callback url
						// merchantAssociationInfo: "MI05MID54RF09123456One",
						amount: projectRequest.proposedPrice ?? 0,
						currency: "BDT",
						intent: "sale",
						// merchantInvoiceNumber: "Inv0120", // appointment id (should be unique)
						merchantInvoiceNumber: projectRequest.id, // appointment id (should be unique)
					}),
				},
			);

			const bkashCreatePaymentResult = await bkashCreatePayment.json();

			// payment model create
			await tx.payment.create({
				data: {
					merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
					projectRequestId: projectRequest.id,
					amount: projectRequest.proposedPrice ?? 0,
					gateWayResponse: bkashCreatePaymentResult,
					bkashPaymentId: bkashCreatePaymentResult.paymentID,
					payerReference: user.email,
				},
			});

			return {
				paymentUrl: bkashCreatePaymentResult.bkashURL,
			};
		},
		{
			maxWait: 10000,
			timeout: 30000,
		},
	);
	return transactionResult;
};

const pay = async (payload: IPaymentInitiatePayload, user: RequestUser) => {
	const projectRequestId = payload.projectRequestId;

	const existingProjectRequest = await prisma.projectRequest.findUnique({
		where: {
			id: projectRequestId,
		},
	});
	if (!existingProjectRequest) {
		throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
	}
	if (existingProjectRequest.status !== ProjectRequestStatus.UNDER_REVIEW) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Project is ${existingProjectRequest.status}`,
		);
	}

	const bkashIdToken = await getBkashIdToken();
	if (!bkashIdToken) {
		throw new AppError(httpStatus.BAD_GATEWAY, "Failed to get bKash ID token");
	}

	const bkashCreatePaymentResponse = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: bkashIdToken,
				"X-App-Key": config.bkash_app_key,
			},
			body: JSON.stringify({
				// agreementID: "TokenizedMerchant01L3IKB6H1565072174986", // appointment id
				mode: "0011",
				// payerReference: "01723888888", // user email
				payerReference: user.email, // user email
				callbackURL: `${config.bkash_callback_url}/project/pay-cover/payment/callback`, // callback url
				// merchantAssociationInfo: "MI05MID54RF09123456One",
				amount: existingProjectRequest.proposedPrice,
				currency: "BDT",
				intent: "sale",
				// merchantInvoiceNumber: "Inv0120", // appointment id (should be unique)
				merchantInvoiceNumber: existingProjectRequest.id, // appointment id (should be unique)
			}),
		},
	);

	const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

	await prisma.payment.update({
		where: {
			// bkashPaymentId: bkashCreatePaymentResult.paymentID, // can't use because it will create new payment id
			projectRequestId: existingProjectRequest.id,
		},
		data: {
			merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
			gateWayResponse: bkashCreatePaymentResult,
			bkashPaymentId: bkashCreatePaymentResult.paymentID,
		},
	});

	return {
		paymentUrl: bkashCreatePaymentResult.bkashURL,
	};
};

const payCallback = async (query: Record<string, any>) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		const paymentId = query.paymentID;
		if (!paymentId) {
			throw new AppError(httpStatus.BAD_REQUEST, "Payment ID is required");
		}
		const status = query.status;
		if (!status) {
			throw new AppError(httpStatus.BAD_REQUEST, "Status is required");
		}

		const bkashIdToken = await getBkashIdToken();
		if (!bkashIdToken) {
			throw new AppError(
				httpStatus.BAD_GATEWAY,
				"Failed to get bKash ID token",
			);
		}

		const executedPaymentResponse = await fetch(
			`${config.bkash_base_url}/tokenized/checkout/execute`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: bkashIdToken,
					"X-App-Key": config.bkash_app_key,
				},
				body: JSON.stringify({
					paymentID: paymentId,
				}),
			},
		);

		const executedPaymentResult = await executedPaymentResponse.json();

		if (status === "success") {
			await tx.projectRequest.update({
				where: { id: executedPaymentResult.merchantInvoiceNumber },
				data: {
					status: ProjectRequestStatus.PAID,
				},
			});
			await tx.payment.update({
				where: {
					projectRequestId: executedPaymentResult.merchantInvoiceNumber,
					bkashPaymentId: executedPaymentResult.paymentID, // will always generated
				},
				data: {
					status: PaymentStatus.PAID,
					bkashTrxId: executedPaymentResult.trxID,
					paidAt: executedPaymentResult.paymentExecuteTime,
					gateWayResponse: executedPaymentResult,
				},
			});

			return {
				redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=success`,
			};
		} else if (status === "failure") {
			await tx.payment.update({
				where: {
					bkashPaymentId: executedPaymentResult.paymentID,
				},
				data: {
					status: PaymentStatus.FAILED,
					gateWayResponse: executedPaymentResult,
				},
			});
			return {
				redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=failure`,
			};
		} else if (status === "cancel") {
			await tx.payment.update({
				where: {
					bkashPaymentId: executedPaymentResult.paymentID,
				},
				data: {
					status: PaymentStatus.CANCELLED,
					gateWayResponse: executedPaymentResult,
				},
			});
			return {
				redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=cancel`,
			};
		} else {
			return {
				executedPaymentResult,
				redirectUrl: `${config.frontend_url}/dashboard/my-appointments?error=payment-failed`,
			};
		}
	});
	return transactionResult;
};

// project create
const createProject = async (payload: ICreateProjectPayload) => {
	const projectRequest = await prisma.projectRequest.findUnique({
		where: {
			id: payload.projectRequestId,
		},
		include: {
			project: true,
		},
	});

	if (!projectRequest) {
		throw new AppError(httpStatus.NOT_FOUND, "Project request not found");
	}

	if (projectRequest.status !== ProjectRequestStatus.PAID) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Project can only be created after payment",
		);
	}

	if (projectRequest.project) {
		throw new AppError(httpStatus.CONFLICT, "Project has already been created");
	}

	if (!projectRequest.clientId) {
		throw new AppError(httpStatus.BAD_REQUEST, "Project request has no client");
	}

	console.log(payload.projectManagerId);
	const project = await prisma.project.create({
		data: {
			serviceRequestId: projectRequest.id,
			clientId: projectRequest.clientId,

			title: payload.title,
			description: payload.description,

			budget: projectRequest.proposedPrice!,

			startDate: payload.startDate,
			deadline: payload.deadline,

			projectManagerId: payload.projectManagerId,
		},
	});

	return project;
};

const assignDeveloperToProject = async (
	projectId: string,
	payload: IAssignDeveloperToProjectPayload,
	user: RequestUser,
) => {
	const { developerId, dates } = payload;

	if (!dates || dates.length === 0) {
		throw new AppError(400, "At least one date is required");
	}

	// Normalize dates to UTC midnight
	const normalizedDates = dates.map((date) => {
		const parsedDate = new Date(date);

		if (isNaN(parsedDate.getTime())) {
			throw new AppError(400, `Invalid date: ${date}`);
		}

		return new Date(
			Date.UTC(
				parsedDate.getUTCFullYear(),
				parsedDate.getUTCMonth(),
				parsedDate.getUTCDate(),
			),
		);
	});

	// Remove duplicate dates
	const uniqueDates = Array.from(
		new Map(normalizedDates.map((date) => [date.toISOString(), date])).values(),
	);

	const result = await prisma.$transaction(async (tx) => {
		// 1. Check project
		const project = await tx.project.findUnique({
			where: {
				id: projectId,
			},
		});

		if (!project) {
			throw new AppError(404, "Project not found");
		}

		// 2. Make sure this PM manages this project
		if (project.projectManagerId !== user.userId) {
			throw new AppError(
				403,
				"You are not the project manager of this project",
			);
		}

		// 3. Find developer
		const developer = await tx.developer.findUnique({
			where: {
				id: developerId,
			},
		});

		if (!developer) {
			throw new AppError(404, "Developer not found");
		}

		// 4. Check developer employment status
		if (developer.employmentStatus !== "ACTIVE") {
			throw new AppError(
				400,
				"Developer is not currently available for project assignment",
			);
		}

		// 5. Check if developer is already a member of this project
		const existingMember = await tx.projectMember.findFirst({
			where: {
				projectId,
				userId: developer.userId,
			},
		});

		if (existingMember) {
			throw new AppError(400, "Developer is already a member of this project");
		}

		// 6. Find existing availability records
		const existingAvailability = await tx.developerAvailability.findMany({
			where: {
				developerId,
				date: {
					in: uniqueDates,
				},
			},
		});

		// Any existing record means the date is unavailable
		const unavailableDates = existingAvailability.filter(
			(item) => item.status === "OCCUPIED" || item.status === "LEAVE",
		);

		if (unavailableDates.length > 0) {
			const unavailableDateStrings = unavailableDates.map(
				(item) => item.date.toISOString().split("T")[0],
			);

			throw new AppError(
				400,
				`Developer is unavailable on: ${unavailableDateStrings.join(", ")}`,
			);
		}

		// 7. Create project member
		const projectMember = await tx.projectMember.create({
			data: {
				projectId,
				userId: developer.userId,
				role: "DEVELOPER",
			},
		});

		// 8. Create availability records for selected dates
		await tx.developerAvailability.createMany({
			data: uniqueDates.map((date) => ({
				developerId,
				projectId,
				date,
				status: "OCCUPIED",
			})),
		});

		return projectMember;
	});

	return result;
};

const getProjectMembers = async (projectId: string) => {
	const project = await prisma.project.findUnique({
		where: {
			id: projectId,
		},
		select: {
			id: true,
			title: true,

			// Project Manager is a User
			projectManager: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					imageUrl: true,
				},
			},

			members: {
				select: {
					id: true,
					role: true,

					user: {
						select: {
							id: true,
							name: true,
							email: true,
							role: true,
							imageUrl: true,

							developer: {
								select: {
									id: true,
									title: true,
									specialization: true,
									employmentStatus: true,

									availability: {
										where: {
											projectId: projectId,
										},
										select: {
											id: true,
											date: true,
											status: true,
										},
										orderBy: {
											date: "asc",
										},
									},
								},
							},
						},
					},
				},

				orderBy: {
					user: {
						name: "asc",
					},
				},
			},
		},
	});

	if (!project) {
		throw new AppError(404, "Project not found");
	}

	const developers = project.members
		.filter(
			(member) => member.user.role === "DEVELOPER" && member.user.developer,
		)
		.map((member) => {
			const developer = member.user.developer!;

			return {
				memberId: member.id,
				userId: member.user.id,
				developerId: developer.id,

				name: member.user.name,
				email: member.user.email,
				role: member.role,

				title: developer.title,
				specialization: developer.specialization,
				employmentStatus: developer.employmentStatus,

				imageUrl: member.user.imageUrl,

				schedule: developer.availability.map((item) => ({
					date: item.date.toISOString().split("T")[0],
					status: item.status,
				})),
			};
		});

	return {
		project: {
			id: project.id,
			title: project.title,
		},

		projectManager: project.projectManager
			? {
					id: project.projectManager.id,
					name: project.projectManager.name,
					email: project.projectManager.email,
					role: project.projectManager.role,
					imageUrl: project.projectManager.imageUrl,
				}
			: null,

		developers,
	};
};

const getProjectDeveloperScheduleReport = async (projectId: string) => {
	const project = await prisma.project.findUnique({
		where: {
			id: projectId,
		},
		select: {
			id: true,
			title: true,

			members: {
				where: {
					user: {
						role: "DEVELOPER",
					},
				},
				select: {
					user: {
						select: {
							name: true,

							developer: {
								select: {
									availability: {
										where: {
											projectId,
											status: "OCCUPIED",
										},
										select: {
											date: true,
										},
										orderBy: {
											date: "asc",
										},
									},
								},
							},
						},
					},
				},
				orderBy: {
					user: {
						name: "asc",
					},
				},
			},
		},
	});

	if (!project) {
		throw new AppError(404, "Project not found");
	}

	const developers = project.members
		.filter((member) => member.user.developer)
		.map((member) => {
			const availability = member.user.developer!.availability;

			return {
				name: member.user.name,
				totalDays: availability.length,
				dates: availability.map(
					(item) => item.date.toISOString().split("T")[0],
				),
			};
		});

	return {
		project: {
			id: project.id,
			title: project.title,
		},
		developers,
	};
};

export const ProjectService = {
	projectRequest,
	getMyProjectRequests,
	getAllProjectRequests,
	offerProjectPrice,
	createPaymentInitiate,
	pay,
	payCallback,
	createProject,
	assignDeveloperToProject,
	getProjectMembers,
	getProjectDeveloperScheduleReport,
};
