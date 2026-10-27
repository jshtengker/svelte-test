<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authState } from '#lib/auth/auth.svelte';

	let identifier = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let errorMessage = $state('');
	let isSubmitting = $state(false);

	const redirectTo = $derived(page.url.searchParams.get('redirectTo') || '/');
	const isSessionExpired = $derived(page.url.searchParams.get('expired') === '1');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!identifier.trim() || !password) {
			errorMessage = 'Please provide both your username/email and password.';
			return;
		}

		errorMessage = '';
		isSubmitting = true;

		const result = await authState.login({
			identifier: identifier.trim(),
			password
		});

		isSubmitting = false;

		if (!result.success) {
			errorMessage = result.error || 'Failed to authenticate. Please check your credentials.';
			return;
		}

		// Navigate to intended destination or dashboard
		await goto(redirectTo, { invalidateAll: true });
	}
</script>

<svelte:head>
	<title>Sign In — SvelteKit + Gin</title>
</svelte:head>

<div class="relative flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-8">
	<!-- Ambient Background Glow -->
	<div
		class="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-linear-to-tr from-indigo-600/20 via-cyan-500/15 to-transparent blur-3xl"
	></div>

	<!-- Login Card -->
	<div
		class="w-full max-w-md rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl transition-all sm:p-10"
	>
		<!-- Header -->
		<div class="mb-8 text-center">
			<div
				class="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-300"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
				Authentication Gateway
			</div>
			<h1 class="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
				Welcome back
			</h1>
			<p class="mt-2 text-xs text-slate-400 sm:text-sm">
				Sign in with your username or email to continue
			</p>
		</div>

		<!-- Session Expired Notification -->
		{#if isSessionExpired && !errorMessage}
			<div
				class="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 shadow-sm"
				role="status"
			>
				<svg
					class="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="flex-1 leading-relaxed">
					Your session has expired. Please sign in again to continue.
				</span>
			</div>
		{/if}

		<!-- Error Alert -->
		{#if errorMessage}
			<div
				class="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 shadow-sm"
				role="alert"
			>
				<svg
					class="mt-0.5 h-4 w-4 shrink-0 text-rose-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<span class="flex-1 leading-relaxed">{errorMessage}</span>
			</div>
		{/if}

		<!-- Form -->
		<form onsubmit={handleSubmit} class="space-y-5">
			<!-- Identifier -->
			<div>
				<label for="identifier" class="block text-xs font-semibold tracking-wide text-slate-300">
					Username or Email
				</label>
				<div class="relative mt-2">
					<div
						class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500"
					>
						<svg
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
							/>
						</svg>
					</div>
					<input
						id="identifier"
						type="text"
						bind:value={identifier}
						required
						autocomplete="username"
						placeholder="admin@example.com or username"
						disabled={isSubmitting}
						class="block w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-hidden disabled:opacity-50"
					/>
				</div>
			</div>

			<!-- Password -->
			<div>
				<div class="flex items-center justify-between">
					<label for="password" class="block text-xs font-semibold tracking-wide text-slate-300">
						Password
					</label>
				</div>
				<div class="relative mt-2">
					<div
						class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500"
					>
						<svg
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						required
						autocomplete="current-password"
						placeholder="••••••••"
						disabled={isSubmitting}
						class="block w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2.5 pr-10 pl-10 text-sm text-white placeholder-slate-500 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-hidden disabled:opacity-50"
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 transition-colors hover:text-slate-300"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<!-- Eye Off Icon -->
							<svg
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
								/>
							</svg>
						{:else}
							<!-- Eye Icon -->
							<svg
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<!-- Submit Button -->
			<button
				type="submit"
				disabled={isSubmitting}
				class="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if isSubmitting}
					<!-- Spinner -->
					<svg
						class="h-4 w-4 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span>Authenticating...</span>
				{:else}
					<span>Sign In to Dashboard</span>
					<svg
						class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
					</svg>
				{/if}
			</button>
		</form>

		<!-- Footer Link -->
		<div class="mt-8 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-400">
			Don't have an account yet?{' '}
			<a
				href="/register"
				class="font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
			>
				Create an account
			</a>
		</div>
	</div>
</div>
