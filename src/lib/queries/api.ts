import { browser } from '$app/env';
import { authState } from '#lib/auth/auth.svelte';
import type { Order, Paginated, Product, User } from '#lib/types/api';

async function apiFetch<T>(url: string): Promise<T> {
	const res = await fetch(url);

	// Client-side 401 indicates refresh token is expired or revoked; evicts local auth state and routes to login with return path.
	if (res.status === 401 && browser) {
		authState.setUser(null);
		const currentPath = window.location.pathname;
		if (currentPath !== '/login' && currentPath !== '/register') {
			const redirectParam = encodeURIComponent(currentPath + window.location.search);
			window.location.href = `/login?redirectTo=${redirectParam}&expired=1`;
		}
		throw new Error('Session expired');
	}

	if (!res.ok) {
		throw new Error(`Request failed with status ${res.status}`);
	}

	return (await res.json()) as T;
}

export function fetchProductsClient(page = 1, pageSize = 10): Promise<Paginated<Product>> {
	return apiFetch<Paginated<Product>>(`/api/products?page=${page}&page_size=${pageSize}`);
}

export function fetchProductClient(id: string): Promise<Product> {
	return apiFetch<Product>(`/api/products/${id}`);
}

export function fetchOrdersClient(page = 1, pageSize = 10): Promise<Paginated<Order>> {
	return apiFetch<Paginated<Order>>(`/api/orders?page=${page}&page_size=${pageSize}`);
}

export function fetchOrderClient(id: string): Promise<Order> {
	return apiFetch<Order>(`/api/orders/${id}`);
}

export function fetchUsersClient(page = 1, pageSize = 10): Promise<Paginated<User>> {
	return apiFetch<Paginated<User>>(`/api/users?page=${page}&page_size=${pageSize}`);
}

export function fetchUserClient(id: string): Promise<User> {
	return apiFetch<User>(`/api/users/${id}`);
}
