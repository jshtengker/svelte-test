<div class="mx-auto max-w-4xl animate-pulse space-y-6">
	<div class="flex items-center gap-2">
		<div class="h-3.5 w-16 rounded bg-slate-800"></div>
		<span class="text-slate-600">/</span>
		<div class="h-3.5 w-24 rounded bg-slate-800/60"></div>
	</div>

	<div class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
		<div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
			<div class="space-y-3">
				<div class="flex items-center gap-3">
					<div class="h-6 w-20 rounded-md bg-slate-800"></div>
					<div class="h-4 w-24 rounded bg-slate-800/60"></div>
				</div>
				<div class="h-8 w-72 rounded-lg bg-slate-800"></div>
				<div class="h-4 w-96 rounded bg-slate-800/60"></div>
			</div>

			<div class="min-w-50 rounded-xl border border-slate-800 bg-slate-950/80 p-5">
				<div class="h-3 w-16 rounded bg-slate-800"></div>
				<div class="mt-2 h-7 w-28 rounded bg-slate-800"></div>
				<div class="mt-2 h-3.5 w-20 rounded bg-slate-800/60"></div>
			</div>
		</div>

		<div
			class="mt-8 grid grid-cols-1 gap-4 border-t border-slate-800/80 pt-6 sm:grid-cols-2 lg:grid-cols-3"
		>
			{#each [1, 2, 3, 4, 5, 6] as item (item)}
				<div class="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
					<div class="h-3 w-20 rounded bg-slate-800"></div>
					<div class="mt-2 h-4 w-36 rounded bg-slate-800/60"></div>
				</div>
			{/each}
		</div>

		<div class="mt-8 border-t border-slate-800/80 pt-6">
			<div class="h-9 w-32 rounded-lg bg-slate-800"></div>
		</div>
	</div>
</div>
