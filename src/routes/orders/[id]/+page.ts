import { getQueryClient } from '#lib/queries/client';
import { bffFetch } from '#lib/api/fetch';
import type { Order, User } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const qc = getQueryClient();

	const order = await qc.fetchQuery({
		queryKey: ['order', params.id],
		queryFn: () => bffFetch<Order>(fetch, `/api/orders/${params.id}`)
	});

	let user: User | null = null;
	if (order.user_id) {
		try {
			user = await qc.fetchQuery({
				queryKey: ['user', order.user_id],
				queryFn: () => bffFetch<User>(fetch, `/api/users/${order.user_id}`)
			});
		} catch {
			user = null;
		}
	}

	return { order, user };
};
