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
