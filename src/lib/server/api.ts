import { error } from '@sveltejs/kit';
import type { ApiResponse } from '#lib/types/api';

const GIN_API_URL = process.env.GIN_API_URL || 'http://localhost:9001';

/**
 * Standard typed server-side fetcher for the Gin backend.
 * Uses SvelteKit's event fetch for SSR cache-inlining and credential propagation.
 */
export async function fetchGin<T>(
	endpoint: string,
	eventFetch: typeof fetch,
	options: RequestInit = {}
): Promise<T> {
	const baseUrl = GIN_API_URL.replace(/\/+$/, '');
	const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	const url = `${baseUrl}${path}`;

	let response: Response;
	try {
		response = await eventFetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				...options.headers
			}
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Unknown network error';
		console.error(`[Gin API] Failed to connect to ${url}:`, message);
		throw error(
			503,
			`Backend service unreachable at ${baseUrl}. Ensure your Go Gin server is running on port 9001.`
		);
	}

	let json: ApiResponse<T>;
	try {
		json = (await response.json()) as ApiResponse<T>;
	} catch {
		throw error(response.status, `Invalid JSON response from backend (${response.statusText})`);
	}

	if (!response.ok || json.error) {
		throw error(
			json.status || response.status,
			json.message || 'Error occurred while contacting backend'
		);
	}

	return json.data;
}
