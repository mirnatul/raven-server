import { AppointmentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const requestService = async (payload: any, user: RequestUser) => {
	let schedule = await prisma.schedule.findFirst({
		where: {
			date: new Date(payload.date),
		},
	});

	const appointment = await prisma.appointment.create({
		data: {
			status: AppointmentStatus.PENDING,
		},
	});

	return appointment;
};

export const AppointmentService = {
	requestService,
};
