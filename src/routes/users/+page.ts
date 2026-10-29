import { getQueryClient } from '#lib/queries/client';
import { bffFetch } from '#lib/api/fetch';
import type { Paginated, User } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Number(url.searchParams.get('page_size') || '10');

	const qc = getQueryClient();
	const users = await qc.fetchQuery({
		queryKey: ['users', page, pageSize],
		queryFn: () =>
			bffFetch<Paginated<User>>(fetch, `/api/users?page=${page}&page_size=${pageSize}`)
	});

	return {
		users,
		currentPage: page,
		pageSize
	};
};
