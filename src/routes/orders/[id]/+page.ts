import { getQueryClient } from '#lib/queries/client';
import type { Order, User } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const qc = getQueryClient();
	const order = await qc.ensureQueryData<Order>({
		queryKey: ['order', params.id],
		queryFn: async () => {
			const res = await fetch(`/api/orders/${params.id}`);
			if (!res.ok) throw new Error('Failed to fetch order');
			return res.json();
		}
	});

	let user: User | null = null;
	if (order.user_id) {
		try {
			user = await qc.ensureQueryData<User>({
				queryKey: ['user', order.user_id],
				queryFn: async () => {
					const res = await fetch(`/api/users/${order.user_id}`);
					if (!res.ok) throw new Error('Failed to fetch user');
					return res.json();
				}
			});
		} catch {
			user = null;
		}
	}

	return { order, user };
};
