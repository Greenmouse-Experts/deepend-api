export interface PaymentSuccessData {
	customer: {
		firstName: string;
	};
	order: {
		orderNumber: string;
		items: OrderItem[];
		total: string;
	};
	payment: {
		method: string;
		date: string;
		transactionId: string;
	};
	support: {
		email: string;
		phone: string;
	};
}

export interface AdminPaymentSuccessData {
	customer: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
	};
	order: {
		orderNumber: string;
		id: string;
		status: "pending" | "completed" | "cancelled";
		createdAt: string;
		total: string;
		items: AdminOrderItem[];
		deliveryAddress?: string;
	};
	payment: {
		method: string;
		transactionId: string;
		status: "Completed" | "Failed" | "Pending";
	};
	adminDashboardUrl: string;
}

interface OrderItem {
	iconUrl: string;
	name: string;
	description: string;
	price: string;
}

interface AdminOrderItem {
	name: string;
	description: string;
	iconUrl: string;
	quantity: number;
	price: string;
}
