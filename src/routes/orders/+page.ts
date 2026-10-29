import { getQueryClient } from '#lib/queries/client';
import { bffFetch } from '#lib/api/fetch';
import type { Order, Paginated } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Number(url.searchParams.get('page_size') || '10');

	const qc = getQueryClient();
	const orders = await qc.fetchQuery({
		queryKey: ['orders', page, pageSize],
		queryFn: () =>
			bffFetch<Paginated<Order>>(fetch, `/api/orders?page=${page}&page_size=${pageSize}`)
	});

	return {
		orders,
		currentPage: page,
		pageSize
	};
};
