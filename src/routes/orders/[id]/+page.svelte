<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchOrderClient } from '#lib/queries/api';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const orderQuery = createQuery(() => ({
		queryKey: ['order', data.order.id],
		queryFn: () => fetchOrderClient(data.order.id),
		initialData: data.order
	}));

	let order = $derived(orderQuery.data ?? data.order);
	let user = $derived(data.user);

	function formatPrice(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(isoStr: string) {
		return new Date(isoStr).toLocaleString('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short'
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
	<title>{order.order_number} - Order Details</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<nav class="flex items-center gap-2 text-xs text-slate-400">
		<a href="/orders" class="transition-colors hover:text-white">Orders</a>
		<span>/</span>
		<span class="font-mono text-slate-200">{order.order_number}</span>
	</nav>

	<div
		class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md sm:p-8"
	>
		<div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div class="flex items-center gap-3">
					<span
						class="rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 font-mono text-xs font-bold text-cyan-400"
					>
						{order.order_number}
					</span>
					<span
						class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold {getStatusClass(
							order.status
						)}"
					>
						{order.status}
					</span>
					{#if orderQuery.isFetching}
						<span
							class="inline-flex animate-pulse items-center gap-1 text-[11px] font-medium text-cyan-400"
						>
							<span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
							Syncing...
						</span>
					{/if}
				</div>

				<h1 class="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
					Order Summary
				</h1>
				<p class="mt-1 text-sm text-slate-400">
					Placed on {formatDate(order.ordered_at)}
				</p>
			</div>

			<div
				class="min-w-50 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-right sm:p-5"
			>
				<div class="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
					Total Amount
				</div>
				<div class="mt-1 text-2xl font-black text-cyan-400">
					{formatPrice(order.total_amount)}
				</div>
				<div class="mt-2 text-xs text-slate-400">
					Status: <span class="font-medium text-slate-200">{order.status}</span>
				</div>
			</div>
		</div>

		{#if user}
			<div class="mt-8 rounded-xl border border-slate-800/80 bg-slate-950/50 p-5">
				<div class="flex items-center justify-between">
					<div class="text-xs font-semibold tracking-wider text-slate-400 uppercase">
						Customer Details
					</div>
					<a
						href={`/users/${user.id}`}
						class="text-xs font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
					>
						View Customer Profile →
					</a>
				</div>
				<div class="mt-3 flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-sm"
					>
						{user.full_name.charAt(0)}
					</div>
					<div>
						<div class="font-medium text-white">{user.full_name}</div>
						<div class="text-xs text-slate-400">
							@{user.username} • {user.email}
							{#if user.phone}
								• {user.phone}
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}

		<div
			class="mt-8 grid grid-cols-1 gap-4 border-t border-slate-800/80 pt-6 sm:grid-cols-2 lg:grid-cols-3"
		>
			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Order UUID</div>
				<div class="mt-1 truncate font-mono text-xs text-slate-200 select-all">{order.id}</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">User UUID</div>
				<div class="mt-1 truncate font-mono text-xs text-slate-200 select-all">{order.user_id}</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Shipping Address UUID</div>
				<div class="mt-1 truncate font-mono text-xs text-slate-200 select-all">
					{order.shipping_address_id}
				</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Ordered At</div>
				<div class="mt-1 text-xs text-slate-300">{formatDate(order.ordered_at)}</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Created Record</div>
				<div class="mt-1 text-xs text-slate-300">{formatDate(order.created_at)}</div>
			</div>

			<div
				class="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/40 p-4"
			>
				<div>
					<div class="text-xs font-medium text-slate-400">Data Source</div>
					<div class="mt-0.5 font-mono text-xs text-cyan-400">Server API</div>
				</div>
				<span
					class="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400"
				>
					Live
				</span>
			</div>
		</div>

		<div class="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-6">
			<a
				href="/orders"
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
				Back to Orders
			</a>

			<button
				type="button"
				onclick={() => orderQuery.refetch()}
				disabled={orderQuery.isFetching}
				class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
			>
				<svg
					class="h-4 w-4 {orderQuery.isFetching ? 'animate-spin' : ''}"
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
				{orderQuery.isFetching ? 'Syncing...' : 'Refresh'}
			</button>
		</div>
	</div>
</div>
