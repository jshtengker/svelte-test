import { fetchGin } from '#lib/server/api';
import type { Product } from '#lib/types/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const product = await fetchGin<Product>(`/api/v1/products/${params.id}`, fetch);

	return {
		product
	};
};
