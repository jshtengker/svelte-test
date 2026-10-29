import type { User } from './api';

export interface AuthTokens {
	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_in: number;
	user: User;
}

export interface LoginRequest {
	identifier: string;
	password: string;
}

export interface RegisterRequest {
	full_name: string;
	username: string;
	email: string;
	password: string;
	phone_number?: string;
}

export interface AuthSuccessResponse {
	user: User;
	message: string;
}
