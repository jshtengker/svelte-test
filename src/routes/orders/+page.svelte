<script lang="ts">
	import { createQuery, keepPreviousData } from '@tanstack/svelte-query';
	import { fetchOrdersClient } from '#lib/queries/api';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// TanStack Query with SSR initialData and background revalidation
	const ordersQuery = createQuery(() => ({
		queryKey: ['orders', data.currentPage, data.pageSize],
		queryFn: () => fetchOrdersClient(data.currentPage, data.pageSize),
		initialData: data.orders,
		placeholderData: keepPreviousData
	}));

	let orders = $derived(ordersQuery.data ?? data.orders);

	function formatPrice(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(isoStr: string) {
		return new Date(isoStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getStatusClass(status: string) {
		switch (status.toUpperCase()) {
			case 'PAID':
				return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
			case 'SHIPPED':
				return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
			case 'DELIVERED':
				return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
			case 'PENDING':
				return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
			case 'CANCELLED':
				return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
			default:
				return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
		}
	}
</script>

<svelte:head>
	<title>Orders - SvelteKit + Gin</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<div class="flex items-center gap-2.5">
				<h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">Orders</h1>
				<span
					class="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400"
				>
					{orders.total} Total
				</span>
				{#if ordersQuery.isFetching}
					<span
						class="inline-flex animate-pulse items-center gap-1 text-[11px] font-medium text-cyan-400"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
						Syncing...
					</span>
				{/if}
			</div>
			<p class="mt-1 text-sm text-slate-400">
				Fetched from Go Gin endpoint <code
					class="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-cyan-300"
					>GET /api/v1/orders</code
				>
			</p>
		</div>
	</div>

	<!-- Table -->
	<div
		class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm"
	>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-slate-300">
				<thead
					class="border-b border-slate-800 bg-slate-900/90 text-xs font-semibold tracking-wider text-slate-400 uppercase"
				>
					<tr>
						<th scope="col" class="py-3.5 pr-3 pl-4 sm:pl-6">Order Number</th>
						<th scope="col" class="px-3 py-3.5">Customer</th>
						<th scope="col" class="px-3 py-3.5">Destination</th>
						<th scope="col" class="px-3 py-3.5">Status</th>
						<th scope="col" class="px-3 py-3.5">Amount</th>
						<th scope="col" class="px-3 py-3.5">Date</th>
						<th scope="col" class="relative py-3.5 pr-4 pl-3 text-right sm:pr-6">Action</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/80">
					{#each orders.items as order (order.id)}
						<tr class="group transition hover:bg-slate-800/40">
							<td class="py-4 pr-3 pl-4 font-mono font-medium text-white sm:pl-6">
								<a href={`/orders/${order.id}`} class="transition-colors group-hover:text-cyan-300">
									{order.order_number}
								</a>
							</td>
							<td class="px-3 py-4">
								<div class="font-medium text-slate-200">{order.user_full_name}</div>
								<div class="text-xs text-slate-400">{order.user_email}</div>
							</td>
							<td class="px-3 py-4 text-xs">
								<div class="text-slate-300">{order.city}, {order.province}</div>
								<div class="text-slate-400">{order.country}</div>
							</td>
							<td class="px-3 py-4">
								<span
									class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold {getStatusClass(
										order.status
									)}"
								>
									{order.status}
								</span>
							</td>
							<td class="px-3 py-4 font-semibold text-slate-100">
								{formatPrice(order.total_amount)}
							</td>
							<td class="px-3 py-4 text-xs text-slate-400">
								{formatDate(order.ordered_at)}
							</td>
							<td class="py-4 pr-4 pl-3 text-right whitespace-nowrap sm:pr-6">
								<a
									href={`/orders/${order.id}`}
									class="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-cyan-600 hover:text-white"
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

	<!-- Pagination -->
	{#if orders.total_pages > 1}
		<div
			class="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-400"
		>
			<div>
				Page <span class="font-semibold text-white">{orders.page}</span> of
				<span class="font-semibold text-white">{orders.total_pages}</span>
			</div>
			<div class="flex items-center gap-2">
				{#if orders.page > 1}
					<a
						href={`/orders?page=${orders.page - 1}`}
						class="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
					>
						Previous
					</a>
				{/if}
				{#if orders.page < orders.total_pages}
					<a
						href={`/orders?page=${orders.page + 1}`}
						class="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
					>
						Next
					</a>
				{/if}
			</div>
		</div>
	{/if}
</div>
