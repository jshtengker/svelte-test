import { error } from '@sveltejs/kit';
import type { ApiResponse } from '#lib/types/api';

export function getGinApiUrl(): string {
	const url = process.env.GIN_API_URL;
	if (!url) {
		throw new Error('FATAL: GIN_API_URL environment variable is not defined in .env');
	}
	return url;
}

export async function fetchGin<T>(
	endpoint: string,
	eventFetch: typeof fetch,
	options: RequestInit = {},
	accessToken?: string | null
): Promise<T> {
	const baseUrl = getGinApiUrl().replace(/\/+$/, '');
	const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	const url = `${baseUrl}${path}`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		...(options.headers as Record<string, string>)
	};

	// Forwards the caller's JWT to server middleware for endpoint-level authorization.
	if (accessToken) {
		headers['Authorization'] = `Bearer ${accessToken}`;
	}

	let response: Response;
	try {
		response = await eventFetch(url, {
			...options,
			headers
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Unknown network error';
		console.error(`[Server API] Failed to connect to ${url}:`, message);
		throw error(
			503,
			`Server unreachable at ${baseUrl}. Please ensure the server is running.`
		);
	}

	let json: ApiResponse<T>;
	try {
		json = (await response.json()) as ApiResponse<T>;
	} catch {
		throw error(response.status, `Invalid JSON response from server (${response.statusText})`);
	}

	if (!response.ok || json.error) {
		throw error(
			json.status || response.status,
			json.message || 'Error occurred while contacting server'
		);
	}

	return json.data;
}
