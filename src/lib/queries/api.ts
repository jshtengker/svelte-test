import type { Order, Paginated, Product, User } from '#lib/types/api';

/**
 * Client-side fetch helpers that call SvelteKit's own BFF endpoints (/api/...).
 * These endpoints forward requests server-side to the Gin backend with zero CORS issues.
 */

export async function fetchProductsClient(page = 1, pageSize = 10): Promise<Paginated<Product>> {
	const res = await fetch(`/api/products?page=${page}&page_size=${pageSize}`);
	if (!res.ok) throw new Error('Failed to fetch products');
	return res.json();
}

export async function fetchProductClient(id: string): Promise<Product> {
	const res = await fetch(`/api/products/${id}`);
	if (!res.ok) throw new Error('Failed to fetch product details');
	return res.json();
}

export async function fetchOrdersClient(page = 1, pageSize = 10): Promise<Paginated<Order>> {
	const res = await fetch(`/api/orders?page=${page}&page_size=${pageSize}`);
	if (!res.ok) throw new Error('Failed to fetch orders');
	return res.json();
}

export async function fetchOrderClient(id: string): Promise<Order> {
	const res = await fetch(`/api/orders/${id}`);
	if (!res.ok) throw new Error('Failed to fetch order details');
	return res.json();
}

export async function fetchUsersClient(page = 1, pageSize = 10): Promise<Paginated<User>> {
	const res = await fetch(`/api/users?page=${page}&page_size=${pageSize}`);
	if (!res.ok) throw new Error('Failed to fetch users');
	return res.json();
}

export async function fetchUserClient(id: string): Promise<User> {
	const res = await fetch(`/api/users/${id}`);
	if (!res.ok) throw new Error('Failed to fetch user details');
	return res.json();
}
