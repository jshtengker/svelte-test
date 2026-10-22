import { browser } from '$app/env';
import { QueryClient } from '@tanstack/svelte-query';

let browserQueryClient: QueryClient | undefined;

/**
 * Returns a shared QueryClient instance in the browser,
 * and a fresh QueryClient instance on the server during SSR.
 */
export function getQueryClient(): QueryClient {
	if (browser) {
		if (!browserQueryClient) {
			browserQueryClient = new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60, // Data remains fresh for 60 seconds
						gcTime: 1000 * 60 * 30, // Cached in memory for 30 minutes
						refetchOnWindowFocus: true
					}
				}
			});
		}
		return browserQueryClient;
	}

	// On SSR server requests, return an isolated instance
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60,
				gcTime: 1000 * 60 * 30
			}
		}
	});
}
