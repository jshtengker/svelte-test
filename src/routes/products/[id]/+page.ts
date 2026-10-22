import { getQueryClient } from '#lib/queries/client';
import type { Product } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const qc = getQueryClient();
	const product = await qc.ensureQueryData<Product>({
		queryKey: ['product', params.id],
		queryFn: async () => {
			const res = await fetch(`/api/products/${params.id}`);
			if (!res.ok) throw new Error('Failed to fetch product');
			return res.json();
		}
	});

	return { product };
};
