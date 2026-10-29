import { getQueryClient } from '#lib/queries/client';
import { bffFetch } from '#lib/api/fetch';
import type { Order, Paginated, Product, User } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const qc = getQueryClient();

	// Uses Promise.allSettled so an offline server or partial failure does not crash the entire dashboard overview during SSR.
	const [productsRes, ordersRes, usersRes] = await Promise.allSettled([
		qc.fetchQuery({
			queryKey: ['products', 1, 4],
			queryFn: () => bffFetch<Paginated<Product>>(fetch, '/api/products?page=1&page_size=4')
		}),
		qc.fetchQuery({
			queryKey: ['orders', 1, 4],
			queryFn: () => bffFetch<Paginated<Order>>(fetch, '/api/orders?page=1&page_size=4')
		}),
		qc.fetchQuery({
			queryKey: ['users', 1, 4],
			queryFn: () => bffFetch<Paginated<User>>(fetch, '/api/users?page=1&page_size=4')
		})
	]);

	const serverOffline =
		productsRes.status === 'rejected' ||
		ordersRes.status === 'rejected' ||
		usersRes.status === 'rejected';

	const products = productsRes.status === 'fulfilled' ? productsRes.value : null;
	const orders = ordersRes.status === 'fulfilled' ? ordersRes.value : null;
	const users = usersRes.status === 'fulfilled' ? usersRes.value : null;

	return {
		productsCount: products?.total ?? 0,
		recentProducts: products?.items ?? [],
		ordersCount: orders?.total ?? 0,
		recentOrders: orders?.items ?? [],
		usersCount: users?.total ?? 0,
		recentUsers: users?.items ?? [],
		serverOffline
	};
};
