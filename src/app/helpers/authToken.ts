import { JwtPayload, SignOptions } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import config from "../config";
import { jwtUtils } from "../utils/jwt";

export const createUserTokens = (user: {
	id: string;
	name: string;
	email: string;
	role: string;
}) => {
	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};
