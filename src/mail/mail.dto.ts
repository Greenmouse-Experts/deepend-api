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

interface OrderItem {
	icon: string;
	name: string;
	description: string;
	price: string;
}
