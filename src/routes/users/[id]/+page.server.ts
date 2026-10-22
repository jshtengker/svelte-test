import { fetchGin } from '#lib/server/api';
import type { User } from '#lib/types/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const user = await fetchGin<User>(`/api/v1/users/${params.id}`, fetch);

	return {
		user
	};
};
