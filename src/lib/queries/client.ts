import { browser } from '$app/env';
import { QueryClient } from '@tanstack/svelte-query';

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
	if (browser) {
		if (!browserQueryClient) {
			browserQueryClient = new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60,
						gcTime: 1000 * 60 * 30,
						refetchOnWindowFocus: true
					}
				}
			});
		}
		return browserQueryClient;
	}

	// Isolates query caches per SSR request to prevent cross-request state leakage.
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60,
				gcTime: 1000 * 60 * 30
			}
		}
	});
}
