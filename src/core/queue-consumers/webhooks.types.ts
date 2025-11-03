export interface PaystackLogHistory {
	type: string;
	message: string;
	time: number;
}

export interface PaystackLog {
	time_spent: number;
	attempts: number;
	authentication: string | null;
	errors: number;
	success: boolean;
	mobile: boolean;
	input: unknown[];
	channel: string | null;
	history: PaystackLogHistory[];
}

export interface PaystackCustomer {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	customer_code: string;
	phone: string | null;
	metadata: unknown;
	risk_action: string;
}

export interface PaystackAuthorization {
	authorization_code: string;
	bin: string;
	last4: string;
	exp_month: string;
	exp_year: string;
	card_type: string;
	bank: string;
	country_code: string;
	brand: string;
	account_name: string;
}

export interface PaystackData {
	id: number;
	domain: string;
	status: string; // e.g. "success"
	reference: string;
	amount: number;
	message: string | null;
	gateway_response: string | null;
	paid_at: string | null;
	created_at: string | null;
	channel: string | null;
	currency: string | null;
	ip_address?: string | null;
	metadata: unknown;
	log?: PaystackLog;
	fees?: unknown;
	customer?: PaystackCustomer;
	authorization?: PaystackAuthorization;
	plan?: Record<string, unknown>;
}

interface PaystackSuccessfulPaymentPayload {
	event: string; // "charge.success"
	data: PaystackData;
}

export interface PaystackSuccessfulPaymentWebhookPayload {
	body: PaystackSuccessfulPaymentPayload;
}
