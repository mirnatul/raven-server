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
			// console.log("Admin already exists!");
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
				role: Role.ADMIN,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Admin created", admin);
	} catch (error) {
		console.log("Error seeding admin", error);

		await prisma.user.delete({
			where: {
				email: config.admin_email,
			},
		});
	}
};