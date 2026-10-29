import type { User } from '#lib/types/api';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			accessToken: string | null;
			serverOffline?: boolean;
		}
	}
}

export {};
