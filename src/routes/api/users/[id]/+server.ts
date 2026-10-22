import { json } from '@sveltejs/kit';
import { fetchGin } from '#lib/server/api';
import type { User } from '#lib/types/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, params }) => {
	const data = await fetchGin<User>(`/api/v1/users/${params.id}`, fetch);
	return json(data);
};
