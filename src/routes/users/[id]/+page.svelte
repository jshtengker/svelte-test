<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchUserClient } from '#lib/queries/api';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const userQuery = createQuery(() => ({
		queryKey: ['user', data.user.id],
		queryFn: () => fetchUserClient(data.user.id),
		initialData: data.user
	}));

	let user = $derived(userQuery.data ?? data.user);

	function formatDate(isoStr: string) {
		return new Date(isoStr).toLocaleString('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}
</script>

<svelte:head>
	<title>{user.full_name} - User Profile</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<nav class="flex items-center gap-2 text-xs text-slate-400">
		<a href="/users" class="transition-colors hover:text-white">Users</a>
		<span>/</span>
		<span class="font-mono text-slate-200">@{user.username}</span>
	</nav>

	<div
		class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-md sm:p-8"
	>
		<div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
			<div class="flex items-start gap-4">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600 text-2xl font-black text-white shadow-lg shadow-indigo-500/20"
				>
					{user.full_name.charAt(0)}
				</div>
				<div>
					<div class="flex flex-wrap items-center gap-2.5">
						<h1 class="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
							{user.full_name}
						</h1>
						{#if user.is_verified}
							<span
								class="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400"
							>
								<svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
								Verified
							</span>
						{/if}
						{#if user.is_active}
							<span class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
								<span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
								Active Account
							</span>
						{:else}
							<span class="text-xs font-medium text-slate-500">Inactive</span>
						{/if}
						{#if userQuery.isFetching}
							<span
								class="inline-flex animate-pulse items-center gap-1 text-[11px] font-medium text-emerald-400"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
								Syncing...
							</span>
						{/if}
					</div>
					<p class="mt-1 font-mono text-sm text-indigo-400">@{user.username}</p>
					<p class="mt-2 text-sm text-slate-300">{user.email}</p>
				</div>
			</div>

			<div class="min-w-44 rounded-xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
				<div class="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
					Account Status
				</div>
				<div class="mt-1 text-base font-bold text-white">
					{user.is_active ? 'Active & Ready' : 'Suspended'}
				</div>
				<div class="mt-2 text-xs text-slate-400">
					Phone: <span class="text-slate-200">{user.phone || 'Not provided'}</span>
				</div>
			</div>
		</div>

		<div
			class="mt-8 grid grid-cols-1 gap-4 border-t border-slate-800/80 pt-6 sm:grid-cols-2 lg:grid-cols-3"
		>
			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">User UUID</div>
				<div class="mt-1 truncate font-mono text-xs text-slate-200 select-all">{user.id}</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Username</div>
				<div class="mt-1 font-mono text-xs text-slate-200">@{user.username}</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Email Address</div>
				<div class="mt-1 truncate text-xs text-slate-200">{user.email}</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Member Since</div>
				<div class="mt-1 text-xs text-slate-300">{formatDate(user.created_at)}</div>
			</div>

			<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
				<div class="text-xs font-medium text-slate-400">Last Profile Update</div>
				<div class="mt-1 text-xs text-slate-300">{formatDate(user.updated_at)}</div>
			</div>

			<div
				class="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/40 p-4"
			>
				<div>
					<div class="text-xs font-medium text-slate-400">Data Source</div>
					<div class="mt-0.5 font-mono text-xs text-emerald-400">Server API</div>
				</div>
				<span
					class="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400"
				>
					Live
				</span>
			</div>
		</div>

		<div class="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-6">
			<a
				href="/users"
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
				Back to Users
			</a>

			<button
				type="button"
				onclick={() => userQuery.refetch()}
				disabled={userQuery.isFetching}
				class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
			>
				<svg
					class="h-4 w-4 {userQuery.isFetching ? 'animate-spin' : ''}"
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
				{userQuery.isFetching ? 'Syncing...' : 'Refresh'}
			</button>
		</div>
	</div>
</div>
