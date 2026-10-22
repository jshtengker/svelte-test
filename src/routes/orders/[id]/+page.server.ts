import { fetchGin } from '#lib/server/api';
import type { Order, User } from '#lib/types/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const order = await fetchGin<Order>(`/api/v1/orders/${params.id}`, fetch);

	// Try fetching the associated user profile for rich detail
	let user: User | null = null;
	if (order.user_id) {
		try {
			user = await fetchGin<User>(`/api/v1/users/${order.user_id}`, fetch);
		} catch {
			user = null;
		}
	}

	return {
		order,
		user
	};
};
