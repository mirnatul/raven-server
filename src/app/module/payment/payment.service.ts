import {
	AppointmentStatus,
	PaymentStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import crypto from "crypto";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const createPaymentInitiate = async (payload: any, user: RequestUser) => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		// create a new appointment with status PENDING
		const appointment = await tx.appointment.create({
			data: {
				status: AppointmentStatus.PENDING,
			},
		});
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
					callbackURL: `${config.bkash_callback_url}/appointment/book-appointment/payment/callback`, // callback url
					// merchantAssociationInfo: "MI05MID54RF09123456One",
					amount: "1200",
					currency: "BDT",
					intent: "sale",
					// merchantInvoiceNumber: "Inv0120", // appointment id (should be unique)
					merchantInvoiceNumber: appointment.id, // appointment id (should be unique)
				}),
			},
		);

		const bkashCreatePaymentResult = await bkashCreatePayment.json();

		// payment model create
		await tx.payment.create({
			data: {
				merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
				appointmentId: appointment.id,
				amount: "1200",
				gateWayResponse: bkashCreatePaymentResult,
				bkashPaymentId: bkashCreatePaymentResult.paymentID,
				payerReference: user.email,
			},
		});

		return {
			paymentUrl: bkashCreatePaymentResult.bkashURL,
		};
	});
	return transactionResult;
};

const pay = async (payload: any, user: RequestUser) => {
	const appointmentId = payload.appointmentId;

	const existingAppointment = await prisma.appointment.findUnique({
		where: {
			id: appointmentId,
		},
	});
	if (!existingAppointment) {
		throw new AppError(httpStatus.NOT_FOUND, "Appointment not found");
	}
	if (existingAppointment.status !== AppointmentStatus.PENDING) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Appointment is already ${existingAppointment.status}`,
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
				callbackURL: `${config.bkash_callback_url}/appointment/book-appointment/payment/callback`, // callback url
				// merchantAssociationInfo: "MI05MID54RF09123456One",
				amount: "1200",
				currency: "BDT",
				intent: "sale",
				// merchantInvoiceNumber: "Inv0120", // appointment id (should be unique)
				merchantInvoiceNumber: existingAppointment.id, // appointment id (should be unique)
			}),
		},
	);

	const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

	await prisma.payment.update({
		where: {
			// bkashPaymentId: bkashCreatePaymentResult.paymentID, // can't use because it will create new payment id
			appointmentId: existingAppointment.id,
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
			await tx.appointment.update({
				where: { id: executedPaymentResult.merchantInvoiceNumber },
				data: {
					status: AppointmentStatus.CONFIRMED,
				},
			});
			await tx.payment.update({
				where: {
					appointmentId: executedPaymentResult.merchantInvoiceNumber,
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

export const PaymentService = {
	createPaymentInitiate,
	pay,
	payCallback,
};
