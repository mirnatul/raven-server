import bcrypt from "bcryptjs";
import { Role } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import config from "../config";
import { AppError } from "./AppError";
import httpStatus from "http-status";

export const seedSuperAdmin = async () => {
	try {
		const isSuperAdminExist = await prisma.user.findFirst({
			where: {
				role: Role.SUPER_ADMIN,
			},
		});
		if (isSuperAdminExist) {
			// console.log("Super admin already exists!");
			return;
		}

		const name = config.super_admin_name;
		const email = config.super_admin_email;
		const password = config.super_admin_password;

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const superAdmin = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.SUPER_ADMIN,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Super Admin created", superAdmin);
	} catch (error) {
		console.log("Error seeding super admin", error);

		await prisma.user.delete({
			where: {
				email: config.super_admin_email,
			},
		});
	}
};

//create tester admin

export const seedTesterAdmin = async () => {
	try {
		const isTesterAdminExist = await prisma.user.findUnique({
			where: {
				email: config.tester_admin_email,
			},
		});

		if (isTesterAdminExist) {
			// console.log("Tester Admin Already Exists!");
			return;
		}

		const name = config.tester_admin_name;
		const email = config.tester_admin_email;
		const password = config.tester_admin_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Admin Name , Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerAdmin = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.ADMIN,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Tester Admin Created : ", testerAdmin);
	} catch (error) {
		console.log("Error Seeding Tester Admin : ", error);

		await prisma.user.delete({
			where: {
				email: config.tester_admin_email,
			},
		});
	}
};

// create tester product manager

export const seedTesterProductManager = async () => {
	try {
		const isTesterProductManagerExist = await prisma.user.findUnique({
			where: {
				email: config.tester_product_manager_email,
			},
		});

		if (isTesterProductManagerExist) {
			// console.log("Tester Product Manager Already Exists!");
			return;
		}

		const name = config.tester_product_manager_name;
		const email = config.tester_product_manager_email;
		const password = config.tester_product_manager_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Product Manager Name , Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerProductManager = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.PRODUCT_MANAGER,
				needPasswordChange: false,
				emailVerified: true,
			},
		});

		console.log("Tester Product Manager Created : ", testerProductManager);
	} catch (error) {
		console.log("Error Seeding Tester Product Manager : ", error);

		await prisma.user.delete({
			where: {
				email: config.tester_product_manager_email,
			},
		});
	}
};

// create tester developer

export const seedTesterDeveloper = async () => {
	try {
		const isTesterDoctorExist = await prisma.user.findUnique({
			where: {
				email: config.tester_developer_email,
			},
		});

		if (isTesterDoctorExist) {
			// console.log("Tester Doctor Already Exists!");
			return;
		}

		const name = config.tester_developer_name;
		const email = config.tester_developer_email;
		const password = config.tester_admin_password;

		if (!name || !email || !password) {
			throw new AppError(
				httpStatus.INTERNAL_SERVER_ERROR,
				"Tester Doctor Name , Email, Password Missing In Env File!!!",
			);
		}

		const hashedPassword = await bcrypt.hash(
			password,
			Number(config.bcrypt_salt_rounds),
		);

		const testerDoctor = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: Role.DEVELOPER,
				needPasswordChange: false,
				emailVerified: true,
				developer: {
					create: {
						email,
						name,
						experienceYears: 2,
						licenseNumber: "DEV123",
						qualifications: "BSc",
						specialization: "Software Engineering",
					},
				},
			},
		});

		console.log("Tester Doctor Created : ", testerDoctor);
	} catch (error) {
		console.log("Error Seeding Tester Doctor : ", error);

		await prisma.user.delete({
			where: {
				email: config.tester_developer_email,
			},
		});
	}
};
