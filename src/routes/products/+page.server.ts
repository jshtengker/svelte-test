import { fetchGin } from '#lib/server/api';
import type { Paginated, Product } from '#lib/types/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Number(url.searchParams.get('page_size') || '10');

	const products = await fetchGin<Paginated<Product>>(
		`/api/v1/products?page=${page}&page_size=${pageSize}`,
		fetch
	);

	return {
		products,
		currentPage: page,
		pageSize
	};
};
