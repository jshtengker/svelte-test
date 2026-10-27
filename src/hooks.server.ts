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

// Short-lived grace cache: caches rotated tokens for 15s to serve concurrent requests in 0.00ms
interface CachedRefresh {
	tokens: AuthTokens;
	expiresAt: number;
}
const recentRefreshCache = new Map<string, CachedRefresh>();

// In-flight refresh promises map keyed by refreshToken to deduplicate concurrent refresh requests
const inFlightRefreshes = new Map<string, Promise<AuthTokens | null>>();

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
): Promise<AuthTokens | null> {
	// 1. Instant return from short-lived grace cache (0ms, zero network calls)
	const cached = recentRefreshCache.get(refreshToken);
	if (cached) {
		if (Date.now() < cached.expiresAt) {
			return cached.tokens;
		}
		recentRefreshCache.delete(refreshToken);
	}

	// 2. Deduplicate in-flight promises
	if (inFlightRefreshes.has(refreshToken)) {
		return inFlightRefreshes.get(refreshToken)!;
	}

	const promise = (async () => {
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

			if (!res.ok) return null;
			const json = (await res.json()) as { error?: boolean; data?: AuthTokens };
			if (json.error || !json.data) return null;

			const tokens = json.data;

			// Cache this token rotation for 15 seconds to absorb concurrent subrequests
			recentRefreshCache.set(refreshToken, {
				tokens,
				expiresAt: Date.now() + 15_000
			});

			return tokens;
		} catch {
			return null;
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

	// Fast 0ms user profile resolution from 'usr' cookie
	const usrCookie = event.cookies.get('usr');
	if (usrCookie) {
		try {
			event.locals.user = JSON.parse(usrCookie) as User;
		} catch {
			// Stale or invalid JSON
		}
	}

	// 1. If accessToken is missing or expiring soon, but we have a refreshToken:
	if ((!accessToken || isTokenExpiring(accessToken)) && refreshToken) {
		const refreshed = await refreshTokensSingleFlight(refreshToken, event.fetch);
		if (refreshed) {
			accessToken = refreshed.access_token;
			event.cookies.set('at', refreshed.access_token, {
				...AUTH_COOKIE_OPTS,
				maxAge: refreshed.expires_in
			});
			event.cookies.set('rt', refreshed.refresh_token, {
				...AUTH_COOKIE_OPTS,
				maxAge: 7 * 24 * 60 * 60 // 7 days
			});
			event.cookies.set('usr', JSON.stringify(refreshed.user), {
				...AUTH_COOKIE_OPTS,
				httpOnly: false,
				maxAge: 7 * 24 * 60 * 60
			});
			event.locals.user = refreshed.user;
			event.locals.accessToken = accessToken;
		} else {
			// Token revoked or expired past grace period -> clear stale cookies
			event.cookies.delete('at', { path: '/' });
			event.cookies.delete('rt', { path: '/' });
			event.cookies.delete('usr', { path: '/' });
			accessToken = null;
			event.locals.user = null;
		}
	}

	// 2. Fallback profile fetch: Only on full page HTML navigations if user is still missing
	const isApiRequest = pathname.startsWith('/api/');
	if (accessToken && !event.locals.user && !isApiRequest) {
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
						httpOnly: false,
						maxAge: 7 * 24 * 60 * 60
					});
				}
			} else if (res.status === 401 && refreshToken) {
				const refreshed = await refreshTokensSingleFlight(refreshToken, event.fetch);
				if (refreshed) {
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
						httpOnly: false,
						maxAge: 7 * 24 * 60 * 60
					});
					event.locals.user = refreshed.user;
					event.locals.accessToken = refreshed.access_token;
				} else {
					event.cookies.delete('at', { path: '/' });
					event.cookies.delete('rt', { path: '/' });
					event.cookies.delete('usr', { path: '/' });
				}
			}
		} catch {
			// Backend unreachable or transient failure
		}
	}

	if (accessToken && event.locals.user) {
		event.locals.accessToken = accessToken;
	}

	// Route Guard: Enforce strict private dashboard protection
	const isPublicRoute =
		pathname === '/login' ||
		pathname === '/register' ||
		pathname.startsWith('/api/auth') ||
		pathname.startsWith('/_app') ||
		pathname.startsWith('/favicon') ||
		pathname.endsWith('.svg') ||
		pathname.endsWith('.png') ||
		pathname.endsWith('.ico');

	// 1. If user is already authenticated, visiting /login or /register redirects to dashboard
	if ((pathname === '/login' || pathname === '/register') && event.locals.user) {
		throw redirect(303, '/');
	}

	// 2. If user is NOT authenticated, accessing any non-public page or API redirects to /login
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

	return resolve(event);
};
