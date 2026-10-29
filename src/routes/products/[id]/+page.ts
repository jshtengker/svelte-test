import { getQueryClient } from '#lib/queries/client';
import { bffFetch } from '#lib/api/fetch';
import type { Product } from '#lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const qc = getQueryClient();
	const product = await qc.fetchQuery({
		queryKey: ['product', params.id],
		queryFn: () => bffFetch<Product>(fetch, `/api/products/${params.id}`)
	});

	return { product };
};
