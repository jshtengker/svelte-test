import { json } from '@sveltejs/kit';
import { fetchGin } from '#lib/server/api';
import type { User } from '#lib/types/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, params, locals }) => {
	const data = await fetchGin<User>(`/api/v1/users/${params.id}`, fetch, {}, locals.accessToken);
	return json(data);
};
