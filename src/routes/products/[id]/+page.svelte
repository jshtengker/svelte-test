<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchProductClient } from '#lib/queries/api';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// TanStack Query with SSR initialData and background revalidation
	const productQuery = createQuery(() => ({
		queryKey: ['product', data.product.id],
		queryFn: () => fetchProductClient(data.product.id),
		initialData: data.product
	}));

	let product = $derived(productQuery.data ?? data.product);

	function formatPrice(priceStr: string | number) {
		const num = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr;
		if (isNaN(num)) return priceStr;
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(num);
	}

	function formatDate(isoStr: string) {
		return new Date(isoStr).toLocaleString('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}
</script>

<svelte:head>
	<title>{product.name} - Product Details</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<!-- Breadcrumbs -->
	<nav class="flex items-center gap-2 text-xs text-slate-400">
		<a href="/products" class="transition-colors hover:text-white">Products</a>
		<span>/</span>
		<span class="font-mono text-slate-200">{product.sku}</span>
	</nav>

	<!-- Main Detail Card -->
	<div
		class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md sm:p-8"
	>
		<div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div class="flex items-center gap-3">
					<span
						class="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 font-mono text-xs font-bold text-indigo-400"
					>
						{product.sku}
					</span>
					{#if product.is_active}
						<span class="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
							<span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
							Active Product
						</span>
					{:else}
						<span class="text-xs font-medium text-slate-500">Inactive</span>
					{/if}
					{#if productQuery.isFetching}
						<span
							class="inline-flex animate-pulse items-center gap-1 text-[11px] font-medium text-indigo-400"
						>
							<span class="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
							Syncing...
						</span>
					{/if}
				</div>

				<h1 class="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
					{product.name}
				</h1>
				<p class="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
					{product.description || 'No description provided.'}
				</p>
			</div>

			<!-- Price Card -->
			<div
				class="min-w-50 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-right sm:p-5"
			>
				<div class="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
					Unit Price
				</div>
				<div class="mt-1 text-2xl font-black text-indigo-400">
					{formatPrice(product.price)}
				</div>
				<div class="mt-2 flex items-center justify-end gap-1.5 text-xs">
					<span
						class="h-2 w-2 rounded-full {product.stock > 10 ? 'bg-emerald-400' : 'bg-amber-400'}"
					></span>
					<span class="font-medium text-slate-300">{product.stock} in stock</span>
				</div>
			</div>
		</div>

		<!-- Specifications Grid -->
		<div
			class="mt-8 grid grid-cols-1 gap-4 border-t border-slate-800/80 pt-6 sm:grid-cols-2 lg:grid-cols-3"
		>
			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Product UUID</div>
				<div class="mt-1 truncate font-mono text-xs text-slate-200 select-all">{product.id}</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Category UUID</div>
				<div class="mt-1 truncate font-mono text-xs text-slate-200 select-all">
					{product.category_id}
				</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Availability</div>
				<div class="mt-1 text-xs font-medium text-emerald-400">
					{product.stock > 0 ? 'Ready to Ship' : 'Out of Stock'}
				</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Created At</div>
				<div class="mt-1 text-xs text-slate-300">{formatDate(product.created_at)}</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Last Updated</div>
				<div class="mt-1 text-xs text-slate-300">{formatDate(product.updated_at)}</div>
			</div>

			<div
				class="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/40 p-4"
			>
				<div>
					<div class="text-xs font-medium text-slate-400">Data Source</div>
					<div class="mt-0.5 font-mono text-xs text-indigo-300">Gin / PostgreSQL</div>
				</div>
				<span
					class="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400"
				>
					Live
				</span>
			</div>
		</div>

		<!-- Action Footer -->
		<div class="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-6">
			<a
				href="/products"
				class="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				Back to Products
			</a>

			<button
				type="button"
				onclick={() => productQuery.refetch()}
				disabled={productQuery.isFetching}
				class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
			>
				<svg
					class="h-4 w-4 {productQuery.isFetching ? 'animate-spin' : ''}"
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
				{productQuery.isFetching ? 'Syncing...' : 'Refresh'}
			</button>
		</div>
	</div>
</div>
