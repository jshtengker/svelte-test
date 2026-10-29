import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGinApiUrl } from '#lib/server/api';

export const POST: RequestHandler = async ({ fetch, cookies, locals }) => {
	const refreshToken = cookies.get('rt');
	const accessToken = cookies.get('at') || locals.accessToken;

	if (refreshToken) {
		try {
			const baseUrl = getGinApiUrl().replace(/\/+$/, '');
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			};
			if (accessToken) {
				headers['Authorization'] = `Bearer ${accessToken}`;
			}

			await fetch(`${baseUrl}/api/v1/auth/logout`, {
				method: 'POST',
				headers,
				body: JSON.stringify({ refresh_token: refreshToken })
			});
		} catch (err) {
			console.error('[Auth Logout] Server logout notification error:', err);
		}
	}

	// Ensures local session state and cookies are revoked even if the upstream auth server is unreachable.
	cookies.delete('at', { path: '/' });
	cookies.delete('rt', { path: '/' });
	cookies.delete('usr', { path: '/' });
	locals.user = null;
	locals.accessToken = null;

	return json({
		error: false,
		status: 200,
		message: 'Logged out successfully'
	});
};
