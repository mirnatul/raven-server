export interface IProjectRequestPayload {
	serviceId: string;
	projectDescription: string;
}

export interface IProjectRequestOfferPayload {
	proposedPrice: number;
	adminMessage?: string;
}

export interface IPaymentInitiatePayload {
	projectRequestId: string;
}

export interface ICreateProjectPayload {
	projectRequestId: string;
	title: string;
	description: string;
	startDate?: Date;
	deadline?: Date;
	projectManagerId?: string;
}
