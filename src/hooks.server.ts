import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { getGinApiUrl } from '#lib/server/api';
import type { AuthTokens } from '#lib/types/auth';
import type { User } from '#lib/types/api';

export const AUTH_COOKIE_OPTS = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax' as const,
	path: '/'
};

// Server rotates refresh tokens on every call; caching the last pair for 15s absorbs parallel SSR subrequests to prevent replay errors.
interface CachedRefresh {
	tokens: AuthTokens;
	expiresAt: number;
}
const recentRefreshCache = new Map<string, CachedRefresh>();

export type RefreshResult =
	| { type: 'success'; tokens: AuthTokens }
	| { type: 'invalid'; status: number; message: string }
	| { type: 'network_error'; message: string };

// Deduplicates concurrent refresh promises to ensure only a single HTTP exchange reaches the server.
const inFlightRefreshes = new Map<string, Promise<RefreshResult>>();

function isTokenExpiring(token: string, skewSeconds = 30): boolean {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return true;
		const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
		if (!payload.exp) return true;
		return Date.now() >= (payload.exp - skewSeconds) * 1000;
	} catch {
		return true;
	}
}

export async function refreshTokensSingleFlight(
	refreshToken: string,
	eventFetch: typeof fetch
): Promise<RefreshResult> {
	const cached = recentRefreshCache.get(refreshToken);
	if (cached) {
		if (Date.now() < cached.expiresAt) {
			return { type: 'success', tokens: cached.tokens };
		}
		recentRefreshCache.delete(refreshToken);
	}

	if (inFlightRefreshes.has(refreshToken)) {
		return inFlightRefreshes.get(refreshToken)!;
	}

	const promise = (async (): Promise<RefreshResult> => {
		try {
			const baseUrl = getGinApiUrl().replace(/\/+$/, '');
			const res = await eventFetch(`${baseUrl}/api/v1/auth/refresh`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify({ refresh_token: refreshToken })
			});

			let json: { error?: boolean; message?: string; data?: AuthTokens } | null = null;
			try {
				json = (await res.json()) as { error?: boolean; message?: string; data?: AuthTokens };
			} catch {}

			if (res.status === 400 || res.status === 401 || res.status === 403) {
				return {
					type: 'invalid',
					status: res.status,
					message: json?.message || 'Refresh token expired or revoked'
				};
			}

			if (!res.ok) {
				return {
					type: 'network_error',
					message: `Server returned status ${res.status}`
				};
			}

			if (json?.error || !json?.data) {
				return {
					type: 'invalid',
					status: res.status,
					message: json?.message || 'Failed to refresh tokens'
				};
			}

			const tokens = json.data;

			recentRefreshCache.set(refreshToken, {
				tokens,
				expiresAt: Date.now() + 15_000
			});

			return { type: 'success', tokens };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown connection error';
			console.warn('[Auth Refresh] Server unreachable:', message);
			return { type: 'network_error', message };
		} finally {
			inFlightRefreshes.delete(refreshToken);
		}
	})();

	inFlightRefreshes.set(refreshToken, promise);
	return promise;
}

export const handle: Handle = async ({ event, resolve }) => {
	let accessToken = event.cookies.get('at') ?? null;
	const refreshToken = event.cookies.get('rt') ?? null;
	const pathname = event.url.pathname;

	event.locals.user = null;
	event.locals.accessToken = null;
	event.locals.serverOffline = false;

	// Resolves user identity synchronously from cookie to render user-dependent UI on SSR without introducing a blocking network hop to /auth/me on every page view.
	const usrCookie = event.cookies.get('usr');
	if (usrCookie) {
		try {
			event.locals.user = JSON.parse(usrCookie) as User;
		} catch {}
	}

	if ((!accessToken || isTokenExpiring(accessToken)) && refreshToken) {
		const refreshResult = await refreshTokensSingleFlight(refreshToken, event.fetch);
		if (refreshResult.type === 'success') {
			const refreshed = refreshResult.tokens;
			accessToken = refreshed.access_token;
			event.cookies.set('at', refreshed.access_token, {
				...AUTH_COOKIE_OPTS,
				maxAge: refreshed.expires_in
			});
			event.cookies.set('rt', refreshed.refresh_token, {
				...AUTH_COOKIE_OPTS,
				maxAge: 7 * 24 * 60 * 60
			});
			event.cookies.set('usr', JSON.stringify(refreshed.user), {
				...AUTH_COOKIE_OPTS,
				maxAge: 7 * 24 * 60 * 60
			});
			event.locals.user = refreshed.user;
			event.locals.accessToken = accessToken;
		} else if (refreshResult.type === 'invalid') {
			event.cookies.delete('at', { path: '/' });
			event.cookies.delete('rt', { path: '/' });
			event.cookies.delete('usr', { path: '/' });
			accessToken = null;
			event.locals.user = null;
		} else {
			// Preserves session cookies during server downtime; wiping cookies on network failure would permanently log out all active users during a server restart.
			event.locals.serverOffline = true;
		}
	}

	const isApiRequest = pathname.startsWith('/api/');
	if (accessToken && !event.locals.user && !isApiRequest && !event.locals.serverOffline) {
		try {
			const baseUrl = getGinApiUrl().replace(/\/+$/, '');
			const res = await event.fetch(`${baseUrl}/api/v1/auth/me`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: 'application/json'
				}
			});

			if (res.ok) {
				const json = (await res.json()) as { error?: boolean; data?: User };
				if (!json.error && json.data) {
					event.locals.user = json.data;
					event.cookies.set('usr', JSON.stringify(json.data), {
						...AUTH_COOKIE_OPTS,
						maxAge: 7 * 24 * 60 * 60
					});
				}
			} else if (res.status === 401 && refreshToken) {
				const refreshResult = await refreshTokensSingleFlight(refreshToken, event.fetch);
				if (refreshResult.type === 'success') {
					const refreshed = refreshResult.tokens;
					event.cookies.set('at', refreshed.access_token, {
						...AUTH_COOKIE_OPTS,
						maxAge: refreshed.expires_in
					});
					event.cookies.set('rt', refreshed.refresh_token, {
						...AUTH_COOKIE_OPTS,
						maxAge: 7 * 24 * 60 * 60
					});
					event.cookies.set('usr', JSON.stringify(refreshed.user), {
						...AUTH_COOKIE_OPTS,
						maxAge: 7 * 24 * 60 * 60
					});
					event.locals.user = refreshed.user;
					event.locals.accessToken = refreshed.access_token;
				} else if (refreshResult.type === 'invalid') {
					event.cookies.delete('at', { path: '/' });
					event.cookies.delete('rt', { path: '/' });
					event.cookies.delete('usr', { path: '/' });
					event.locals.user = null;
				} else {
					event.locals.serverOffline = true;
				}
			}
		} catch {
			event.locals.serverOffline = true;
		}
	}

	if (accessToken && event.locals.user) {
		event.locals.accessToken = accessToken;
	}

	const isPublicRoute =
		pathname === '/login' ||
		pathname === '/register' ||
		pathname.startsWith('/api/auth') ||
		pathname.startsWith('/_app') ||
		pathname.startsWith('/favicon') ||
		pathname.endsWith('.svg') ||
		pathname.endsWith('.png') ||
		pathname.endsWith('.ico');

	if ((pathname === '/login' || pathname === '/register') && event.locals.user && !event.locals.serverOffline) {
		throw redirect(303, '/');
	}

	if (!isPublicRoute && !event.locals.user) {
		if (pathname.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: true, message: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const redirectTo =
			pathname === '/' ? '' : `?redirectTo=${encodeURIComponent(pathname + event.url.search)}`;
		throw redirect(303, `/login${redirectTo}`);
	}

	if (event.locals.serverOffline && pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
		return new Response(
			JSON.stringify({
				error: true,
				code: 'SERVER_OFFLINE',
				message:
					'Server is currently offline or unreachable. Please verify the server is running.'
			}),
			{
				status: 503,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	return resolve(event);
};
