// import cron from "node-cron";
// import { prisma } from "./prisma";
// import { Role } from "../../generated/prisma/enums";

// export const deleteUnverifiedDevelopers = async () => {
// 	cron.schedule("*/10 * * * *", async () => {
// 		try {
// 			// prisma business logic
// 			// delete developer that are not verified within 1 hour
// 			const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
// 			const deletedDevelopers = await prisma.user.deleteMany({
// 				where: {
// 					role: Role.DEVELOPER,
// 					emailVerified: false,
// 					createdAt: { lt: oneHourAgo },
// 					developer: { isNot: null },
// 				},
// 			});

// 			if (deletedDevelopers.count > 0) {
// 				console.log(
// 					`Cron: Deleted ${deletedDevelopers.count} unverified email developer applications older than 1 hour ago`,
// 				);
// 			}
// 		} catch (error) {
// 			console.log("Cron: Failed to delete unverified applications", error);
// 		}

// 		console.log(
// 			"Cron: Unverified developer delete cron schedule (every 10 minute)",
// 		);
// 	});
// };
