import { getQueryClient } from '#lib/queries/client';
import type { Order, Paginated, Product, User } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const qc = getQueryClient();

	const [productsRes, ordersRes, usersRes] = await Promise.all([
		qc.ensureQueryData<Paginated<Product>>({
			queryKey: ['products', 1, 4],
			queryFn: async () => {
				const res = await fetch('/api/products?page=1&page_size=4');
				if (!res.ok) throw new Error('Failed to fetch products');
				return res.json();
			}
		}),
		qc.ensureQueryData<Paginated<Order>>({
			queryKey: ['orders', 1, 4],
			queryFn: async () => {
				const res = await fetch('/api/orders?page=1&page_size=4');
				if (!res.ok) throw new Error('Failed to fetch orders');
				return res.json();
			}
		}),
		qc.ensureQueryData<Paginated<User>>({
			queryKey: ['users', 1, 4],
			queryFn: async () => {
				const res = await fetch('/api/users?page=1&page_size=4');
				if (!res.ok) throw new Error('Failed to fetch users');
				return res.json();
			}
		})
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
