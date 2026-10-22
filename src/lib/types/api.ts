export interface ApiResponse<T> {
	error: boolean;
	status: number;
	message: string;
	data: T;
	errors?: unknown;
}

export interface Paginated<T> {
	total: number;
	page: number;
	page_size: number;
	total_pages: number;
	items: T[];
}

export interface Product {
	id: string;
	category_id: string;
	sku: string;
	name: string;
	description: string;
	price: string;
	stock: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface User {
	id: string;
	full_name: string;
	username: string;
	email: string;
	phone: string | null;
	is_verified: boolean;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface Order {
	id: string;
	user_id: string;
	shipping_address_id: string;
	order_number: string;
	status: string;
	total_amount: number;
	ordered_at: string;
	created_at: string;
	updated_at: string;
	// Joined fields from OrderListResponse
	user_full_name?: string;
	username?: string;
	user_email?: string;
	phone?: string;
	address_line?: string;
	city?: string;
	province?: string;
	postal_code?: string;
	country?: string;
}
