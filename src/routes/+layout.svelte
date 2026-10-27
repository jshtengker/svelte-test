<script lang="ts">
	import './layout.css';
	import { browser } from '$app/env';
	import { page, navigating } from '$app/state';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { getQueryClient } from '#lib/queries/client';
	import favicon from '#lib/assets/favicon.svg';
	import { authState } from '#lib/auth/auth.svelte';
	import type { LayoutProps } from './$types';

	import ProductsSkeleton from '#lib/components/skeletons/ProductsSkeleton.svelte';
	import OrdersSkeleton from '#lib/components/skeletons/OrdersSkeleton.svelte';
	import UsersSkeleton from '#lib/components/skeletons/UsersSkeleton.svelte';
	import DashboardSkeleton from '#lib/components/skeletons/DashboardSkeleton.svelte';
	import DetailSkeleton from '#lib/components/skeletons/DetailSkeleton.svelte';

	let { data, children }: LayoutProps = $props();

	// Keep client authState in sync with SSR page data
	$effect(() => {
		authState.setUser(data.user);
	});

	const queryClient = getQueryClient();

	const isAuthRoute = $derived(
		page.url.pathname === '/login' || page.url.pathname === '/register'
	);

	async function handleLogout() {
		await authState.logout();
		queryClient.clear();
		window.location.href = '/login';
	}

	function isTargetCached(targetPath: string): boolean {
		if (!browser) return false;
		if (targetPath === '/') {
			return Boolean(
				queryClient.getQueryData(['products', 1, 4]) &&
				queryClient.getQueryData(['orders', 1, 4]) &&
				queryClient.getQueryData(['users', 1, 4])
			);
		}
		if (targetPath === '/products') {
			return Boolean(queryClient.getQueryData(['products', 1, 10]));
		}
		if (targetPath.startsWith('/products/')) {
			const id = targetPath.replace('/products/', '');
			return Boolean(queryClient.getQueryData(['product', id]));
		}
		if (targetPath === '/orders') {
			return Boolean(queryClient.getQueryData(['orders', 1, 10]));
		}
		if (targetPath.startsWith('/orders/')) {
			const id = targetPath.replace('/orders/', '');
			return Boolean(queryClient.getQueryData(['order', id]));
		}
		if (targetPath === '/users') {
			return Boolean(queryClient.getQueryData(['users', 1, 10]));
		}
		if (targetPath.startsWith('/users/')) {
			const id = targetPath.replace('/users/', '');
			return Boolean(queryClient.getQueryData(['user', id]));
		}
		return false;
	}

	const navItems = [
		{ name: 'Overview', href: '/' },
		{ name: 'Products', href: '/products' },
		{ name: 'Orders', href: '/orders' },
		{ name: 'Users', href: '/users' }
	];

	function isActive(href: string) {
		const currentPath = navigating.to ? navigating.to.url.pathname : page.url.pathname;
		if (href === '/') return currentPath === '/';
		return currentPath.startsWith(href);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SvelteKit + Gin Dashboard</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
	<div
		class="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white"
	>
		<!-- Top Navigation -->
		{#if isAuthRoute}
			<header class="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
				<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<a href="/" class="group flex items-center gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105"
						>
							<svg
								class="h-6 w-6 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<div>
							<div class="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
								SvelteKit <span class="font-normal text-slate-500">✕</span> Gin
							</div>
							<div class="text-[11px] font-medium text-slate-400">Security Gateway</div>
						</div>
					</a>
					<a
						href="/"
						class="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
					>
						<span>← Back to Dashboard</span>
					</a>
				</div>
			</header>
		{:else}
			<header class="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
				<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<!-- Logo / Title -->
					<div class="flex items-center gap-8">
						<a href="/" class="group flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105"
							>
								<svg
									class="h-6 w-6 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<div>
								<div class="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
									SvelteKit <span class="font-normal text-slate-500">✕</span> Gin
								</div>
								<div class="text-[11px] font-medium text-slate-400">BFF + TanStack Query</div>
							</div>
						</a>

						<!-- Navigation Links -->
						<nav class="hidden items-center gap-1 md:flex">
							{#each navItems as item (item.href)}
								<a
									href={item.href}
									class="rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors {isActive(
										item.href
									)
										? 'border border-indigo-500/30 bg-indigo-500/15 text-indigo-300'
										: 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}"
								>
									{item.name}
								</a>
							{/each}
						</nav>
					</div>

					<!-- Right Status & Auth Widget -->
					<div class="flex items-center gap-3">
						<div
							class="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 lg:inline-flex"
						>
							<span class="relative flex h-2 w-2">
								<span
									class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
								></span>
								<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
							</span>
							<span>Gin BFF</span>
						</div>

						<!-- Auth State Display -->
						{#if authState.user}
							<div class="flex items-center gap-2.5 border-l border-slate-800 pl-3">
								<div class="flex items-center gap-2">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-white shadow-sm shadow-indigo-500/30"
									>
										{authState.user.full_name?.charAt(0).toUpperCase() ||
											authState.user.username?.charAt(0).toUpperCase() ||
											'U'}
									</div>
									<div class="hidden flex-col text-left sm:flex">
										<span class="text-xs font-semibold leading-tight text-white">
											{authState.user.full_name || authState.user.username}
										</span>
										<span class="text-[10px] text-slate-400">@{authState.user.username}</span>
									</div>
								</div>
								<button
									onclick={handleLogout}
									type="button"
									class="cursor-pointer rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-xs font-medium text-slate-300 transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
								>
									Sign Out
								</button>
							</div>
						{:else}
							<div class="flex items-center gap-2 border-l border-slate-800 pl-3">
								<a
									href="/login"
									class="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
								>
									Sign In
								</a>
								<a
									href="/register"
									class="rounded-lg bg-linear-to-r from-indigo-600 to-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-opacity hover:opacity-95"
								>
									Register
								</a>
							</div>
						{/if}
					</div>
				</div>

				<!-- Mobile Navigation Bar -->
				<div
					class="flex items-center justify-between gap-2 overflow-x-auto border-t border-slate-800/60 px-4 py-2 md:hidden"
				>
					<div class="flex gap-2">
						{#each navItems as item (item.href)}
							<a
								href={item.href}
								class="rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap {isActive(
									item.href
								)
									? 'bg-indigo-500/20 font-semibold text-indigo-300'
									: 'text-slate-400 hover:text-white'}"
							>
								{item.name}
							</a>
						{/each}
					</div>
					<div class="flex items-center gap-2">
						{#if authState.user}
							<button
								onclick={handleLogout}
								type="button"
								class="px-2 py-1 text-xs font-medium text-rose-400 hover:text-rose-300"
							>
								Sign Out
							</button>
						{:else}
							<a
								href="/login"
								class="px-2 py-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
							>
								Sign In
							</a>
						{/if}
					</div>
				</div>
			</header>
		{/if}

		<!-- Main Body with Instant Skeleton Loading (only when destination is not cached) -->
		<main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
			{#if navigating.to && !isTargetCached(navigating.to.url.pathname)}
				{@const targetPath = navigating.to.url.pathname}
				{#if targetPath === '/'}
					<DashboardSkeleton />
				{:else if targetPath === '/products'}
					<ProductsSkeleton />
				{:else if targetPath.startsWith('/products/')}
					<DetailSkeleton />
				{:else if targetPath === '/orders'}
					<OrdersSkeleton />
				{:else if targetPath.startsWith('/orders/')}
					<DetailSkeleton />
				{:else if targetPath === '/users'}
					<UsersSkeleton />
				{:else if targetPath.startsWith('/users/')}
					<DetailSkeleton />
				{:else}
					<ProductsSkeleton />
				{/if}
			{:else}
				{@render children()}
			{/if}
		</main>

		<!-- Minimal Footer -->
		<footer class="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400">
			<div
				class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8"
			>
				<p>Consuming Go (Gin) REST API via SvelteKit BFF + TanStack Query</p>
				<p class="font-mono text-[11px] text-slate-400">Connected via SvelteKit BFF Gateway</p>
			</div>
		</footer>
	</div>
</QueryClientProvider>
