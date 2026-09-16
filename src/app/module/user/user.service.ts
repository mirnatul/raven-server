import { UploadApiResponse } from "cloudinary";
import cloudinary from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IUpdateProfilePayload } from "./user.interface";

const uploadProfileImage = async (buffer: Buffer, userId: string) => {
	const currentUser = await prisma.user.findUnique({
		where: { id: userId },
		select: { imagePublicId: true, imageUrl: true },
	});

	const cloudinaryResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "image",
					},
					async (error, result) => {
						if (error) {
							return reject(error);
						}
						if (!result) {
							return reject(new Error("No result returned from Cloudinary"));
						}
						resolve(result);
					},
				)
				.end(buffer);
		},
	);

	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			imageUrl: cloudinaryResult.secure_url,
			imagePublicId: cloudinaryResult.public_id,
		},
		omit: { password: true },
	});

	// after new url set delete the previous one
	if (currentUser?.imagePublicId && currentUser.imageUrl) {
		await cloudinary.uploader.destroy(currentUser.imagePublicId);
	}

	return updatedUser;
};

const updateMyProfile = async (
	userId: string,
	payload: IUpdateProfilePayload,
) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
			isDeleted: false,
		},
	});

	if (!user) {
		throw new AppError(404, "User not found");
	}

	const updatedUser = await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			name: payload.name,
			contactNumber: payload.contactNumber,
			address: payload.address,
		},
		select: {
			id: true,
			name: true,
			email: true,
			contactNumber: true,
			address: true,
			authProvider: true,
			emailVerified: true,
			role: true,
			status: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return updatedUser;
};

export const UserServices = { uploadProfileImage, updateMyProfile };
