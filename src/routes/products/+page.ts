import { getQueryClient } from '#lib/queries/client';
import type { Paginated, Product } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Number(url.searchParams.get('page_size') || '10');

	const qc = getQueryClient();
	const queryKey = ['products', page, pageSize];

	const products = await qc.ensureQueryData<Paginated<Product>>({
		queryKey,
		queryFn: async () => {
			const res = await fetch(`/api/products?page=${page}&page_size=${pageSize}`);
			if (!res.ok) throw new Error('Failed to fetch products');
			return res.json();
		}
	});

	return {
		products,
		currentPage: page,
		pageSize
	};
};
