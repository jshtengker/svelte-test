import { fetchGin } from '#lib/server/api';
import type { Order, Paginated } from '#lib/types/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Number(url.searchParams.get('page_size') || '10');

	const orders = await fetchGin<Paginated<Order>>(
		`/api/v1/orders?page=${page}&page_size=${pageSize}`,
		fetch
	);

	return {
		orders,
		currentPage: page,
		pageSize
	};
};
