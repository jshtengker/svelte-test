import { json } from '@sveltejs/kit';
import { fetchGin } from '#lib/server/api';
import type { Product } from '#lib/types/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, params }) => {
	const data = await fetchGin<Product>(`/api/v1/products/${params.id}`, fetch);
	return json(data);
};
