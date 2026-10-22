import { json } from '@sveltejs/kit';
import { fetchGin } from '#lib/server/api';
import type { Order } from '#lib/types/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, params }) => {
	const data = await fetchGin<Order>(`/api/v1/orders/${params.id}`, fetch);
	return json(data);
};
