import cron from "node-cron";
import { prisma } from "./prisma";
import { Role, TeacherVerificationStatus } from "../../generated/prisma/enums";

export const deleteUnverifiedTeachers = async () => {
	cron.schedule("*/10 * * * *", async () => {
		try {
			// prisma business logic
			// delete teacher that are not verified within 1 hour
			const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
			const deletedTeachers = await prisma.user.deleteMany({
				where: {
					role: Role.TEACHER,
					emailVerified: false,
					createdAt: { lt: oneHourAgo },
					teacher: {
						verificationStatus: TeacherVerificationStatus.PENDING,
					},
				},
			});

			if (deletedTeachers.count > 0) {
				console.log(
					`Cron: Deleted ${deletedTeachers.count} unverified email teacher applications older than 1 hour ago`,
				);
			}
		} catch (error) {
			console.log("Cron: Failed to delete unverified applications", error);
		}

		console.log(
			"Cron: Unverified teacher delete cron schedule (every 10 minute)",
		);
	});
};
