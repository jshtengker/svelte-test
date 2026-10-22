<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchProductsClient, fetchOrdersClient, fetchUsersClient } from '#lib/queries/api';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// TanStack Queries with SSR initialData for live background revalidation
	const productsQuery = createQuery(() => ({
		queryKey: ['products', 1, 4],
		queryFn: () => fetchProductsClient(1, 4),
		initialData: {
			items: data.recentProducts,
			total: data.productsCount,
			page: 1,
			page_size: 4,
			total_pages: 1
		}
	}));

	const ordersQuery = createQuery(() => ({
		queryKey: ['orders', 1, 4],
		queryFn: () => fetchOrdersClient(1, 4),
		initialData: {
			items: data.recentOrders,
			total: data.ordersCount,
			page: 1,
			page_size: 4,
			total_pages: 1
		}
	}));

	const usersQuery = createQuery(() => ({
		queryKey: ['users', 1, 4],
		queryFn: () => fetchUsersClient(1, 4),
		initialData: {
			items: data.recentUsers,
			total: data.usersCount,
			page: 1,
			page_size: 4,
			total_pages: 1
		}
	}));

	let productsCount = $derived(productsQuery.data?.total ?? data.productsCount);
	let recentProducts = $derived(productsQuery.data?.items ?? data.recentProducts);

	let ordersCount = $derived(ordersQuery.data?.total ?? data.ordersCount);
	let recentOrders = $derived(ordersQuery.data?.items ?? data.recentOrders);

	let usersCount = $derived(usersQuery.data?.total ?? data.usersCount);

	let isSyncing = $derived(
		productsQuery.isFetching || ordersQuery.isFetching || usersQuery.isFetching
	);

	function refetchAll() {
		productsQuery.refetch();
		ordersQuery.refetch();
		usersQuery.refetch();
	}

	function formatPrice(priceStr: string | number) {
		const num = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr;
		if (isNaN(num)) return priceStr;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num);
	}
</script>

<svelte:head>
	<title>Dashboard Overview - SvelteKit + Gin BFF</title>
</svelte:head>

<div class="space-y-8">
	<!-- Hero / Welcome Banner -->
	<div
		class="relative overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-r from-indigo-950/70 via-slate-900 to-slate-950 p-6 shadow-2xl sm:p-8"
	>
		<div class="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="max-w-2xl">
				<div class="flex items-center gap-2">
					<span
						class="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
						BFF + TanStack Query Active
					</span>
					{#if isSyncing}
						<span
							class="inline-flex animate-pulse items-center gap-1 text-xs font-medium text-cyan-400"
						>
							<span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
							Syncing...
						</span>
					{/if}
				</div>
				<h1 class="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
					SvelteKit 5 <span class="text-indigo-400">✕</span> Go Gin Backend
				</h1>
				<p class="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
					Consuming REST API on <code
						class="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs text-cyan-300"
						>http://localhost:9001</code
					> via SvelteKit BFF + TanStack Query memory caching.
				</p>
			</div>

			<button
				type="button"
				onclick={refetchAll}
				disabled={isSyncing}
				class="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20 hover:text-white disabled:opacity-50 sm:self-center"
			>
				<svg
					class="h-4 w-4 {isSyncing ? 'animate-spin' : ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
				{isSyncing ? 'Refreshing...' : 'Refresh All'}
			</button>
		</div>

		<!-- Subtle Background Decoration -->
		<div class="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl"></div>
		<div class="absolute right-32 -bottom-12 h-64 w-64 rounded-full bg-cyan-600/10 blur-3xl"></div>
	</div>

	<!-- Metric Cards Grid -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
		<!-- Products Metric Card -->
		<a
			href="/products"
			class="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg transition-all hover:border-indigo-500/50 hover:bg-slate-900"
		>
			<div class="flex items-center justify-between">
				<div class="text-xs font-semibold tracking-wider text-slate-400 uppercase">Products</div>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-500 group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
						/>
					</svg>
				</div>
			</div>
			<div class="mt-4 text-3xl font-extrabold text-white">{productsCount}</div>
			<p class="mt-1 flex items-center justify-between text-xs text-slate-400">
				<span>Catalog & Inventory</span>
				<span class="text-indigo-400 transition-transform group-hover:translate-x-0.5"
					>Explore →</span
				>
			</p>
		</a>

		<!-- Orders Metric Card -->
		<a
			href="/orders"
			class="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg transition-all hover:border-cyan-500/50 hover:bg-slate-900"
		>
			<div class="flex items-center justify-between">
				<div class="text-xs font-semibold tracking-wider text-slate-400 uppercase">Orders</div>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-500 group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
						/>
					</svg>
				</div>
			</div>
			<div class="mt-4 text-3xl font-extrabold text-white">{ordersCount}</div>
			<p class="mt-1 flex items-center justify-between text-xs text-slate-400">
				<span>Transactions & Shipments</span>
				<span class="text-cyan-400 transition-transform group-hover:translate-x-0.5">Explore →</span
				>
			</p>
		</a>

		<!-- Users Metric Card -->
		<a
			href="/users"
			class="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg transition-all hover:border-emerald-500/50 hover:bg-slate-900"
		>
			<div class="flex items-center justify-between">
				<div class="text-xs font-semibold tracking-wider text-slate-400 uppercase">Users</div>
				<div
					class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
				</div>
			</div>
			<div class="mt-4 text-3xl font-extrabold text-white">{usersCount}</div>
			<p class="mt-1 flex items-center justify-between text-xs text-slate-400">
				<span>Accounts & Customers</span>
				<span class="text-emerald-400 transition-transform group-hover:translate-x-0.5"
					>Explore →</span
				>
			</p>
		</a>
	</div>

	<!-- Two-column Section: Recent Products & Recent Orders -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Recent Products Preview -->
		<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="flex items-center gap-2 text-base font-bold text-white">
					<span class="h-2 w-2 rounded-full bg-indigo-500"></span>
					Recent Products
				</h2>
				<a href="/products" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
					>View All →</a
				>
			</div>
			<div class="divide-y divide-slate-800/80">
				{#each recentProducts as product (product.id)}
					<div class="flex items-center justify-between gap-3 py-3">
						<div>
							<a
								href={`/products/${product.id}`}
								class="text-sm font-medium text-white transition-colors hover:text-indigo-400"
							>
								{product.name}
							</a>
							<div class="mt-0.5 font-mono text-xs text-slate-500">
								{product.sku} • {product.stock} in stock
							</div>
						</div>
						<div class="text-sm font-semibold text-slate-200">
							{formatPrice(product.price)}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Recent Orders Preview -->
		<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="flex items-center gap-2 text-base font-bold text-white">
					<span class="h-2 w-2 rounded-full bg-cyan-500"></span>
					Recent Orders
				</h2>
				<a href="/orders" class="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
					>View All →</a
				>
			</div>
			<div class="divide-y divide-slate-800/80">
				{#each recentOrders as order (order.id)}
					<div class="flex items-center justify-between gap-3 py-3">
						<div>
							<div class="font-mono text-sm font-medium text-white">{order.order_number}</div>
							<div class="mt-0.5 text-xs text-slate-500">{order.user_full_name} • {order.city}</div>
						</div>
						<div class="text-right">
							<div class="text-xs font-semibold text-cyan-400">{order.status}</div>
							<div class="mt-0.5 text-xs font-medium text-slate-400">
								{formatPrice(order.total_amount)}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
