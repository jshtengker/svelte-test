import { getQueryClient } from '#lib/queries/client';
import type { Paginated, User } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page') || '1');
	const pageSize = Number(url.searchParams.get('page_size') || '10');

	const qc = getQueryClient();
	const queryKey = ['users', page, pageSize];

	const users = await qc.ensureQueryData<Paginated<User>>({
		queryKey,
		queryFn: async () => {
			const res = await fetch(`/api/users?page=${page}&page_size=${pageSize}`);
			if (!res.ok) throw new Error('Failed to fetch users');
			return res.json();
		}
	});

	return {
		users,
		currentPage: page,
		pageSize
	};
};
