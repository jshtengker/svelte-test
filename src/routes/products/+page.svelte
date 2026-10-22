<script lang="ts">
	import { createQuery, keepPreviousData } from '@tanstack/svelte-query';
	import { fetchProductsClient } from '#lib/queries/api';
	import type { PageProps } from './$types';
	import type { Product } from '#lib/types/api';

	let { data }: PageProps = $props();

	// TanStack Query with SSR initialData and background revalidation
	const productsQuery = createQuery(() => ({
		queryKey: ['products', data.currentPage, data.pageSize],
		queryFn: () => fetchProductsClient(data.currentPage, data.pageSize),
		initialData: data.products,
		placeholderData: keepPreviousData
	}));

	let products = $derived(productsQuery.data ?? data.products);

	let searchQuery = $state('');
	let viewMode = $state<'table' | 'grid'>('table');

	// Format price in IDR format
	function formatPrice(priceStr: string | number) {
		const num = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr;
		if (isNaN(num)) return priceStr;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num);
	}

	// Filter loaded items by search term in client for snappy UX
	let filteredItems = $derived(
		products.items.filter(
			(item: Product) =>
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.description.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>Products - SvelteKit + Gin</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<div class="flex items-center gap-2.5">
				<h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">Products</h1>
				<span
					class="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400"
				>
					{products.total} Total
				</span>
				{#if productsQuery.isFetching}
					<span
						class="inline-flex animate-pulse items-center gap-1 text-[11px] font-medium text-indigo-400"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
						Syncing...
					</span>
				{/if}
			</div>
			<p class="mt-1 text-sm text-slate-400">
				Fetched from Go Gin endpoint <code
					class="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-indigo-300"
					>GET /api/v1/products</code
				>
			</p>
		</div>

		<!-- Action bar & Controls -->
		<div class="flex flex-wrap items-center gap-3">
			<!-- Search Input -->
			<div class="relative min-w-60">
				<span
					class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</span>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by name, SKU..."
					class="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-1.5 pr-3 pl-9 text-sm text-white placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
				/>
			</div>

			<!-- View Mode Toggle -->
			<div class="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
				<button
					type="button"
					onclick={() => (viewMode = 'table')}
					class="rounded-md p-1.5 transition {viewMode === 'table'
						? 'bg-indigo-600 text-white shadow-sm'
						: 'text-slate-400 hover:text-white'}"
					title="Table View"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 10h16M4 14h16M4 18h16"
						/>
					</svg>
				</button>
				<button
					type="button"
					onclick={() => (viewMode = 'grid')}
					class="rounded-md p-1.5 transition {viewMode === 'grid'
						? 'bg-indigo-600 text-white shadow-sm'
						: 'text-slate-400 hover:text-white'}"
					title="Grid View"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Content Area -->
	{#if filteredItems.length === 0}
		<div class="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
			<div
				class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-500"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
					/>
				</svg>
			</div>
			<h3 class="mt-4 text-base font-medium text-white">No products found</h3>
			<p class="mt-1 text-sm text-slate-400">
				Try adjusting your search query or reset pagination.
			</p>
		</div>
	{:else if viewMode === 'table'}
		<!-- Table View -->
		<div
			class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm"
		>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm text-slate-300">
					<thead
						class="border-b border-slate-800 bg-slate-900/90 text-xs font-semibold tracking-wider text-slate-400 uppercase"
					>
						<tr>
							<th scope="col" class="py-3.5 pr-3 pl-4 sm:pl-6">SKU / Name</th>
							<th scope="col" class="px-3 py-3.5">Price</th>
							<th scope="col" class="px-3 py-3.5">Stock</th>
							<th scope="col" class="px-3 py-3.5">Status</th>
							<th scope="col" class="relative py-3.5 pr-4 pl-3 text-right sm:pr-6">Action</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800/80">
						{#each filteredItems as product (product.id)}
							<tr class="group transition hover:bg-slate-800/40">
								<td class="py-4 pr-3 pl-4 sm:pl-6">
									<div class="font-medium text-white transition-colors group-hover:text-indigo-300">
										{product.name}
									</div>
									<div class="mt-0.5 flex items-center gap-2 font-mono text-xs text-slate-400">
										<span class="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300"
											>{product.sku}</span
										>
										<span class="max-w-xs truncate">{product.description}</span>
									</div>
								</td>
								<td class="px-3 py-4 font-semibold whitespace-nowrap text-slate-100">
									{formatPrice(product.price)}
								</td>
								<td class="px-3 py-4 whitespace-nowrap">
									<div class="flex items-center gap-1.5">
										<span
											class="inline-block h-2 w-2 rounded-full {product.stock > 15
												? 'bg-emerald-400'
												: product.stock > 0
													? 'bg-amber-400'
													: 'bg-rose-500'}"
										></span>
										<span class="text-xs font-medium text-slate-300">{product.stock} units</span>
									</div>
								</td>
								<td class="px-3 py-4 whitespace-nowrap">
									{#if product.is_active}
										<span
											class="inline-flex items-center rounded-md bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-400/20 ring-inset"
										>
											Active
										</span>
									{:else}
										<span
											class="inline-flex items-center rounded-md bg-slate-400/10 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-slate-400/20 ring-inset"
										>
											Inactive
										</span>
									{/if}
								</td>
								<td class="py-4 pr-4 pl-3 text-right whitespace-nowrap sm:pr-6">
									<a
										href={`/products/${product.id}`}
										class="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-indigo-600 hover:text-white"
									>
										Details
										<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<!-- Grid View -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredItems as product (product.id)}
				<a
					href={`/products/${product.id}`}
					class="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg transition-all hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-indigo-500/5"
				>
					<div>
						<div class="mb-2 flex items-center justify-between text-xs text-slate-400">
							<span class="rounded bg-slate-800 px-2 py-0.5 font-mono text-slate-300"
								>{product.sku}</span
							>
							{#if product.is_active}
								<span class="font-medium text-emerald-400">● Active</span>
							{:else}
								<span class="font-medium text-slate-500">Inactive</span>
							{/if}
						</div>
						<h3
							class="text-base font-semibold text-white transition-colors group-hover:text-indigo-400"
						>
							{product.name}
						</h3>
						<p class="mt-1 line-clamp-2 text-xs text-slate-400">
							{product.description}
						</p>
					</div>

					<div class="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
						<div>
							<div class="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
								Price
							</div>
							<div class="text-base font-bold text-white">{formatPrice(product.price)}</div>
						</div>
						<div class="text-right">
							<div class="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
								Stock
							</div>
							<div class="text-xs font-medium text-slate-300">{product.stock} units</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}

	<!-- Pagination Navigation -->
	{#if products.total_pages > 1}
		<div
			class="flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-400 sm:flex-row"
		>
			<div>
				Showing Page <span class="font-semibold text-white">{products.page}</span> of
				<span class="font-semibold text-white">{products.total_pages}</span> ({products.total} products)
			</div>

			<div class="flex items-center gap-1.5">
				{#if products.page > 1}
					<a
						href={`/products?page=${products.page - 1}&page_size=${products.page_size}`}
						class="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
					>
						Previous
					</a>
				{:else}
					<span
						class="cursor-not-allowed rounded-lg border border-slate-900 bg-slate-950 px-3 py-1.5 text-slate-600"
					>
						Previous
					</span>
				{/if}

				{#each Array.from({ length: products.total_pages }, (_, i) => i + 1) as pageNum (pageNum)}
					<a
						href={`/products?page=${pageNum}&page_size=${products.page_size}`}
						class="min-w-8 rounded-lg px-2.5 py-1.5 text-center font-medium transition {pageNum ===
						products.page
							? 'bg-indigo-600 text-white shadow-sm'
							: 'border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'}"
					>
						{pageNum}
					</a>
				{/each}

				{#if products.page < products.total_pages}
					<a
						href={`/products?page=${products.page + 1}&page_size=${products.page_size}`}
						class="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
					>
						Next
					</a>
				{:else}
					<span
						class="cursor-not-allowed rounded-lg border border-slate-900 bg-slate-950 px-3 py-1.5 text-slate-600"
					>
						Next
					</span>
				{/if}
			</div>
		</div>
	{/if}
</div>
