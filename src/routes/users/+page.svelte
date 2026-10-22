<script lang="ts">
	import { createQuery, keepPreviousData } from '@tanstack/svelte-query';
	import { fetchUsersClient } from '#lib/queries/api';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// TanStack Query with SSR initialData and background revalidation
	const usersQuery = createQuery(() => ({
		queryKey: ['users', data.currentPage, data.pageSize],
		queryFn: () => fetchUsersClient(data.currentPage, data.pageSize),
		initialData: data.users,
		placeholderData: keepPreviousData
	}));

	let users = $derived(usersQuery.data ?? data.users);

	function formatDate(isoStr: string) {
		return new Date(isoStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Users - SvelteKit + Gin</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<div class="flex items-center gap-2.5">
				<h1 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">Users</h1>
				<span
					class="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400"
				>
					{users.total} Total
				</span>
				{#if usersQuery.isFetching}
					<span
						class="inline-flex animate-pulse items-center gap-1 text-[11px] font-medium text-emerald-400"
					>
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
						Syncing...
					</span>
				{/if}
			</div>
			<p class="mt-1 text-sm text-slate-400">
				Fetched from Go Gin endpoint <code
					class="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-emerald-300"
					>GET /api/v1/users</code
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
						<th scope="col" class="py-3.5 pr-3 pl-4 sm:pl-6">User</th>
						<th scope="col" class="px-3 py-3.5">Username</th>
						<th scope="col" class="px-3 py-3.5">Phone</th>
						<th scope="col" class="px-3 py-3.5">Verified</th>
						<th scope="col" class="px-3 py-3.5">Status</th>
						<th scope="col" class="px-3 py-3.5">Joined</th>
						<th scope="col" class="relative py-3.5 pr-4 pl-3 text-right sm:pr-6">Action</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-800/80">
					{#each users.items as user (user.id)}
						<tr class="group transition hover:bg-slate-800/40">
							<td class="py-4 pr-3 pl-4 sm:pl-6">
								<div class="flex items-center gap-3">
									<div
										class="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm"
									>
										{user.full_name.charAt(0)}
									</div>
									<div>
										<a
											href={`/users/${user.id}`}
											class="font-medium text-white transition-colors group-hover:text-indigo-300"
										>
											{user.full_name}
										</a>
										<div class="text-xs text-slate-400">{user.email}</div>
									</div>
								</div>
							</td>
							<td class="px-3 py-4 font-mono text-xs text-slate-300">
								@{user.username}
							</td>
							<td class="px-3 py-4 text-xs text-slate-400">
								{user.phone || '—'}
							</td>
							<td class="px-3 py-4">
								{#if user.is_verified}
									<span
										class="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400"
									>
										<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clip-rule="evenodd"
											/>
										</svg>
										Verified
									</span>
								{:else}
									<span class="text-xs text-slate-500">Unverified</span>
								{/if}
							</td>
							<td class="px-3 py-4">
								{#if user.is_active}
									<span
										class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400"
									>
										<span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
										Active
									</span>
								{:else}
									<span class="text-xs text-slate-500">Inactive</span>
								{/if}
							</td>
							<td class="px-3 py-4 text-xs text-slate-400">
								{formatDate(user.created_at)}
							</td>
							<td class="py-4 pr-4 pl-3 text-right whitespace-nowrap sm:pr-6">
								<a
									href={`/users/${user.id}`}
									class="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-indigo-600 hover:text-white"
								>
									Profile
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
	{#if users.total_pages > 1}
		<div
			class="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-400"
		>
			<div>
				Page <span class="font-semibold text-white">{users.page}</span> of
				<span class="font-semibold text-white">{users.total_pages}</span>
			</div>
			<div class="flex items-center gap-2">
				{#if users.page > 1}
					<a
						href={`/users?page=${users.page - 1}`}
						class="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
					>
						Previous
					</a>
				{/if}
				{#if users.page < users.total_pages}
					<a
						href={`/users?page=${users.page + 1}`}
						class="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
					>
						Next
					</a>
				{/if}
			</div>
		</div>
	{/if}
</div>
