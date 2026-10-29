import { getQueryClient } from '#lib/queries/client';
import { bffFetch } from '#lib/api/fetch';
import type { User } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const qc = getQueryClient();
	const user = await qc.fetchQuery({
		queryKey: ['user', params.id],
		queryFn: () => bffFetch<User>(fetch, `/api/users/${params.id}`)
	});

	return { user };
};
