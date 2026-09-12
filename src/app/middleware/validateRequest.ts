import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import z from "zod";
import { AppError } from "../utils/AppError";
import httpStatus from "http-status";

export const validateRequest = (zodSchema: z.ZodObject) => {
	return catchAsync((req: Request, res: Response, next: NextFunction) => {
		// const payload = req.body ? req.body : {}
		const payload = req.body ?? {};
		// no need try catch if use safeParse
		const result = zodSchema.safeParse(payload);

		if (!result.success) {
			// let errorMessage = ""
			// payload.error.issues.forEach(issue => {
			// 	errorMessage = errorMessage + ", " + issue.message
			// })
			throw new AppError(httpStatus.BAD_REQUEST, result.error.issues[0].message);
		}
		req.body = result.data;
		next();
	});
};
