<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} - Error</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-16 text-center sm:py-24">
	<div
		class="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20"
	>
		<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
			/>
		</svg>
	</div>

	<p class="text-xs font-semibold tracking-widest text-rose-500 uppercase">Error {page.status}</p>
	<h1
		class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
	>
		{page.error?.message || 'Something went wrong'}
	</h1>

	<p class="mt-4 text-sm text-slate-600 dark:text-slate-400">
		{#if page.status === 503}
			The frontend could not reach the Go Gin backend. Please ensure your backend server is running.
		{:else if page.status === 404}
			The requested item or resource could not be found.
		{:else}
			An unexpected error occurred while communicating with the backend.
		{/if}
	</p>

	<div class="mt-8 flex items-center justify-center gap-3">
		<button
			onclick={() => history.back()}
			class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
		>
			Go Back
		</button>
		<a
			href="/products"
			class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
		>
			View Products
		</a>
	</div>
</div>
