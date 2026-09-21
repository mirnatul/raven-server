import bcrypt from "bcryptjs";

import { Role } from "../../generated/prisma/enums";

import { prisma } from "../lib/prisma";

import config from "../config";

export const seedAdmin = async () => {
	try {
		const isAdminExist = await prisma.user.findUnique({
			where: {
				email: config.admin_email,
			},
		});

		if (isAdminExist) {
			return;
		}

		const name = config.admin_name;
		const email = config.admin_email;
		const password = config.admin_password;

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const admin = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,

				contactNumber: "01700000000",
				address: "Dhaka, Bangladesh",

				role: Role.ADMIN,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Admin created", admin.email);
	} catch (error) {
		console.log("Error seeding admin", error);
	}
};

export const seedProjectManager = async () => {
	try {
		const isProjectManagerExist = await prisma.user.findUnique({
			where: {
				email: config.project_manager_email,
			},
		});

		if (isProjectManagerExist) {
			return;
		}

		const name = config.project_manager_name;
		const email = config.project_manager_email;
		const password = config.project_manager_password;

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const projectManager = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				contactNumber: "01700000001",
				address: "Dhaka, Bangladesh",
				role: Role.PROJECT_MANAGER,
				status: "ACTIVE",
				needPasswordChange: false,
				emailVerified: true,
				authProvider: "CREDENTIAL",
			},
		});

		console.log("Project Manager created", projectManager.email);
	} catch (error) {
		console.log("Error seeding project manager", error);
	}
};
