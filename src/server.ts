import app from "./app";
import config from "./app/config";
// import { deleteUnverifiedDevelopers } from "./app/lib/corn";
import { transporter } from "./app/lib/nodemailer";
import { prisma } from "./app/lib/prisma";
import { redisClient } from "./app/lib/redis";
import { seedAdmin, seedProjectManager } from "./app/utils/seed";
import { seedServices } from "./app/utils/seedService";

const PORT = config.port;

const main = async () => {
	try {
		await prisma.$connect();
		console.log("Connected to the database successfully.");

		await redisClient.connect();
		console.log("Redis connected successfully");

		await transporter.verify();
		console.log("nodemailer connected successfully");

		await seedAdmin();
		await seedServices();
		// await seedProjectManager();

		// corn job
		// await deleteUnverifiedDevelopers();

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
};

main();
