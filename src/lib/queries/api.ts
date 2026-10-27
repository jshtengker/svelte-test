import { browser } from '$app/env';
import { authState } from '#lib/auth/auth.svelte';
import type { Order, Paginated, Product, User } from '#lib/types/api';

/**
 * Client-side fetch helper with reactive 401 expiration handling.
 * Calls SvelteKit's BFF endpoints (/api/...).
 * When the refresh token is expired or revoked (401), automatically
 * resets authState and transitions the browser to /login?expired=1.
 */
async function apiFetch<T>(url: string): Promise<T> {
	const res = await fetch(url);

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
