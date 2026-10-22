import { json } from '@sveltejs/kit';
import { fetchGin } from '#lib/server/api';
import type { Paginated, Product } from '#lib/types/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Number(url.searchParams.get('page_size') || '10');

	const data = await fetchGin<Paginated<Product>>(
		`/api/v1/products?page=${page}&page_size=${pageSize}`,
		fetch
	);

	return json(data);
};
