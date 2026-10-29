<script lang="ts">
	import { goto } from '$app/navigation';
	import { authState } from '#lib/auth/auth.svelte';

	let fullName = $state('');
	let username = $state('');
	let email = $state('');
	let password = $state('');
	let phoneNumber = $state('');
	let showPassword = $state(false);

	let errorMessage = $state('');
	let isSubmitting = $state(false);

	const isPasswordValid = $derived(password.length >= 8);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
			errorMessage = 'Please fill in all required fields.';
			return;
		}

		if (password.length < 8) {
			errorMessage = 'Password must be at least 8 characters long.';
			return;
		}

		errorMessage = '';
		isSubmitting = true;

		const result = await authState.register({
			full_name: fullName.trim(),
			username: username.trim(),
			email: email.trim(),
			password,
			phone_number: phoneNumber.trim() || undefined
		});

		isSubmitting = false;

		if (!result.success) {
			errorMessage = result.error || 'Failed to register account. Please check your information.';
			return;
		}

		await goto('/', { invalidateAll: true });
	}
</script>

<svelte:head>
	<title>Create Account</title>
</svelte:head>

<div class="relative flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-8">
	<div
		class="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-linear-to-tr from-cyan-600/15 via-indigo-600/20 to-transparent blur-3xl"
	></div>

	<div
		class="w-full max-w-lg rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl transition-all sm:p-10"
	>
		<div class="mb-8 text-center">
			<div
				class="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-300"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
				New Account Registration
			</div>
			<h1 class="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
				Create your account
			</h1>
			<p class="mt-2 text-xs text-slate-400 sm:text-sm">
				Join the management platform
			</p>
		</div>

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

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label for="fullName" class="block text-xs font-semibold tracking-wide text-slate-300">
						Full Name <span class="text-rose-400">*</span>
					</label>
					<div class="relative mt-2">
						<input
							id="fullName"
							type="text"
							bind:value={fullName}
							required
							autocomplete="name"
							placeholder="Jane Doe"
							disabled={isSubmitting}
							class="block w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-hidden disabled:opacity-50"
						/>
					</div>
				</div>

				<div>
					<label for="username" class="block text-xs font-semibold tracking-wide text-slate-300">
						Username <span class="text-rose-400">*</span>
					</label>
					<div class="relative mt-2">
						<input
							id="username"
							type="text"
							bind:value={username}
							required
							autocomplete="username"
							placeholder="janedoe"
							disabled={isSubmitting}
							class="block w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-hidden disabled:opacity-50"
						/>
					</div>
				</div>
			</div>

			<div>
				<label for="email" class="block text-xs font-semibold tracking-wide text-slate-300">
					Email Address <span class="text-rose-400">*</span>
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
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						autocomplete="email"
						placeholder="jane@example.com"
						disabled={isSubmitting}
						class="block w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-hidden disabled:opacity-50"
					/>
				</div>
			</div>

			<div>
				<div class="flex items-center justify-between">
					<label for="phone" class="block text-xs font-semibold tracking-wide text-slate-300">
						Phone Number
					</label>
					<span class="text-[11px] text-slate-500">Optional</span>
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
								d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
							/>
						</svg>
					</div>
					<input
						id="phone"
						type="tel"
						bind:value={phoneNumber}
						autocomplete="tel"
						placeholder="+1 (555) 000-0000"
						disabled={isSubmitting}
						class="block w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 focus:outline-hidden disabled:opacity-50"
					/>
				</div>
			</div>

			<div>
				<div class="flex items-center justify-between">
					<label for="password" class="block text-xs font-semibold tracking-wide text-slate-300">
						Password <span class="text-rose-400">*</span>
					</label>
					{#if password.length > 0}
						<span
							class="text-[11px] {isPasswordValid ? 'text-emerald-400 font-medium' : 'text-amber-400'}"
						>
							{password.length}/8 chars {isPasswordValid ? '✓' : '(min 8)'}
						</span>
					{/if}
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
						autocomplete="new-password"
						placeholder="Minimum 8 characters"
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

			<div class="pt-2">
				<button
					type="submit"
					disabled={isSubmitting}
					class="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
				>
					{#if isSubmitting}
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
						<span>Creating Account...</span>
					{:else}
						<span>Create Account</span>
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
			</div>
		</form>

		<div class="mt-8 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-400">
			Already have an account?{' '}
			<a
				href="/login"
				class="font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
			>
				Sign in instead
			</a>
		</div>
	</div>
</div>
