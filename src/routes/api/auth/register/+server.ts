import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGinApiUrl } from '#lib/server/api';
import { AUTH_COOKIE_OPTS } from '#lib/../hooks.server';
import type { ApiResponse } from '#lib/types/api';
import type { AuthTokens, RegisterRequest } from '#lib/types/auth';

export const POST: RequestHandler = async ({ request, fetch, cookies }) => {
	let body: RegisterRequest;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	if (!body.full_name?.trim() || !body.username?.trim() || !body.email?.trim() || !body.password) {
		throw error(400, 'Full name, username, email, and password are required');
	}

	if (body.password.length < 8) {
		throw error(400, 'Password must be at least 8 characters long');
	}

	const baseUrl = getGinApiUrl().replace(/\/+$/, '');
	let res: Response;
	try {
		res = await fetch(`${baseUrl}/api/v1/auth/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify({
				full_name: body.full_name.trim(),
				username: body.username.trim(),
				email: body.email.trim(),
				password: body.password,
				phone_number: body.phone_number?.trim() || undefined
			})
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown network error';
		console.error('[Auth Register] Failed to connect to server:', message);
		throw error(503, 'Server authentication service unreachable');
	}

	let resJson: ApiResponse<AuthTokens>;
	try {
		resJson = (await res.json()) as ApiResponse<AuthTokens>;
	} catch {
		throw error(res.status, 'Invalid JSON response from server');
	}

	if (!res.ok || resJson.error || !resJson.data) {
		throw error(resJson.status || res.status, resJson.message || 'Registration failed');
	}

	const tokens = resJson.data;

	cookies.set('at', tokens.access_token, {
		...AUTH_COOKIE_OPTS,
		maxAge: tokens.expires_in
	});
	cookies.set('rt', tokens.refresh_token, {
		...AUTH_COOKIE_OPTS,
		maxAge: 7 * 24 * 60 * 60
	});
	cookies.set('usr', JSON.stringify(tokens.user), {
		...AUTH_COOKIE_OPTS,
		maxAge: 7 * 24 * 60 * 60
	});

	return json(
		{
			error: false,
			status: 201,
			message: 'Registration successful',
			user: tokens.user
		},
		{ status: 201 }
	);
};
