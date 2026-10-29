import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AUTH_COOKIE_OPTS, refreshTokensSingleFlight } from '#lib/../hooks.server';

export const POST: RequestHandler = async ({ fetch, cookies }) => {
	const refreshToken = cookies.get('rt');
	if (!refreshToken) {
		throw error(401, 'No refresh token available');
	}

	const refreshResult = await refreshTokensSingleFlight(refreshToken, fetch);
	if (refreshResult.type === 'network_error') {
		throw error(503, refreshResult.message || 'Server authentication service unreachable');
	}

	if (refreshResult.type === 'invalid') {
		cookies.delete('at', { path: '/' });
		cookies.delete('rt', { path: '/' });
		cookies.delete('usr', { path: '/' });
		throw error(401, refreshResult.message || 'Session expired or refresh token revoked');
	}

	const refreshed = refreshResult.tokens;
	cookies.set('at', refreshed.access_token, {
		...AUTH_COOKIE_OPTS,
		maxAge: refreshed.expires_in
	});
	cookies.set('rt', refreshed.refresh_token, {
		...AUTH_COOKIE_OPTS,
		maxAge: 7 * 24 * 60 * 60
	});
	cookies.set('usr', JSON.stringify(refreshed.user), {
		...AUTH_COOKIE_OPTS,
		maxAge: 7 * 24 * 60 * 60
	});

	return json({
		error: false,
		status: 200,
		message: 'Session refreshed successfully',
		user: refreshed.user
	});
};
