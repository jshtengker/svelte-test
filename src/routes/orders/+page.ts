import { getQueryClient } from '#lib/queries/client';
import type { Order, Paginated } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Number(url.searchParams.get('page_size') || '10');

	const qc = getQueryClient();
	const queryKey = ['orders', page, pageSize];

	const orders = await qc.ensureQueryData<Paginated<Order>>({
		queryKey,
		queryFn: async () => {
			const res = await fetch(`/api/orders?page=${page}&page_size=${pageSize}`);
			if (!res.ok) throw new Error('Failed to fetch orders');
			return res.json();
		}
	});

	return {
		orders,
		currentPage: page,
		pageSize
	};
};
