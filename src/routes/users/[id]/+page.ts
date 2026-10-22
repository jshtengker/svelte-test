import { getQueryClient } from '#lib/queries/client';
import type { User } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const qc = getQueryClient();
	const user = await qc.ensureQueryData<User>({
		queryKey: ['user', params.id],
		queryFn: async () => {
			const res = await fetch(`/api/users/${params.id}`);
			if (!res.ok) throw new Error('Failed to fetch user');
			return res.json();
		}
	});

	return { user };
};
