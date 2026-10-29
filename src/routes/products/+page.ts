import { getQueryClient } from '#lib/queries/client';
import { bffFetch } from '#lib/api/fetch';
import type { Paginated, Product } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Number(url.searchParams.get('page_size') || '10');

	const qc = getQueryClient();
	const products = await qc.fetchQuery({
		queryKey: ['products', page, pageSize],
		queryFn: () =>
			bffFetch<Paginated<Product>>(fetch, `/api/products?page=${page}&page_size=${pageSize}`)
	});

	return {
		products,
		currentPage: page,
		pageSize
	};
};
