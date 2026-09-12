export class AppError extends Error {
	// APpError is a super class of Error
	public statusCode: number;

	constructor(statusCode: number, message: string, stack = "") {
		super(message); // throw new Error(message)

		this.statusCode = statusCode;

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}
