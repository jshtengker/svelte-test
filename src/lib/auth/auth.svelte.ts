import type { User } from '#lib/types/api';
import type { LoginRequest, RegisterRequest } from '#lib/types/auth';

class AuthState {
	user = $state<User | null>(null);
	isLoading = $state(false);

	get isAuthenticated(): boolean {
		return this.user !== null;
	}

	setUser(user: User | null) {
		this.user = user;
	}

	async login(credentials: LoginRequest): Promise<{ success: boolean; error?: string }> {
		this.isLoading = true;
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credentials)
			});

			const data = await res.json();
			if (!res.ok) {
				return { success: false, error: data.message || 'Login failed' };
			}

			this.user = data.user;
			return { success: true };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Network error during login';
			return { success: false, error: message };
		} finally {
			this.isLoading = false;
		}
	}

	async register(payload: RegisterRequest): Promise<{ success: boolean; error?: string }> {
		this.isLoading = true;
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const data = await res.json();
			if (!res.ok) {
				return { success: false, error: data.message || 'Registration failed' };
			}

			this.user = data.user;
			return { success: true };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Network error during registration';
			return { success: false, error: message };
		} finally {
			this.isLoading = false;
		}
	}

	async logout(): Promise<void> {
		this.isLoading = true;
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
		} catch (err) {
			console.error('Logout error:', err);
		} finally {
			this.user = null;
			this.isLoading = false;
		}
	}
}

export const authState = new AuthState();
