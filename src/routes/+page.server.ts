import { fetchGin } from '#lib/server/api';
import type { Order, Paginated, Product, User } from '#lib/types/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	// Parallel fetch from all Gin endpoints on initial page load
	const [productsRes, ordersRes, usersRes] = await Promise.all([
		fetchGin<Paginated<Product>>('/api/v1/products?page=1&page_size=4', fetch),
		fetchGin<Paginated<Order>>('/api/v1/orders?page=1&page_size=4', fetch),
		fetchGin<Paginated<User>>('/api/v1/users?page=1&page_size=4', fetch)
	]);

	return {
		productsCount: productsRes.total,
		recentProducts: productsRes.items,
		ordersCount: ordersRes.total,
		recentOrders: ordersRes.items,
		usersCount: usersRes.total,
		recentUsers: usersRes.items
	};
};
