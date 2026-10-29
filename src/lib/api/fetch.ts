import { error } from '@sveltejs/kit';

// Native fetch resolves on 503; throwing error(503) delegates to the root error boundary while keeping layout and session mounted.
export async function bffFetch<T>(
	fetchFn: typeof fetch,
	endpoint: string,
	options?: RequestInit
): Promise<T> {
	let res: Response;
	try {
		res = await fetchFn(endpoint, options);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Network connection error';
		console.warn(`[bffFetch] Failed to reach ${endpoint}:`, message);
		throw error(503, 'The server is currently offline');
	}

	if (!res.ok) {
		let message = res.statusText;
		try {
			const json = (await res.json()) as { error?: boolean; message?: string };
			if (json?.message) message = json.message;
		} catch {}

		if (res.status === 503 || res.status === 502 || res.status === 504) {
			throw error(503, 'The server is currently offline');
		}

		if (res.status === 404) {
			throw error(404, message || 'Resource not found');
		}

		throw error(res.status, message || `Request failed with status ${res.status}`);
	}

	return (await res.json()) as T;
}
