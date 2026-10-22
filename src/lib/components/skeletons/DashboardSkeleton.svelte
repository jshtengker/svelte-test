<div class="animate-pulse space-y-8">
	<!-- Hero Banner Skeleton -->
	<div class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
		<div class="h-6 w-36 rounded-full bg-slate-800"></div>
		<div class="mt-4 h-9 w-96 rounded-lg bg-slate-800"></div>
		<div class="mt-3 h-4 w-3/4 rounded bg-slate-800/60"></div>
	</div>

	<!-- Metric Cards Skeleton -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
		{#each [1, 2, 3] as card (card)}
			<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
				<div class="flex items-center justify-between">
					<div class="h-4 w-20 rounded bg-slate-800"></div>
					<div class="h-10 w-10 rounded-lg bg-slate-800"></div>
				</div>
				<div class="mt-4 h-9 w-16 rounded bg-slate-800"></div>
				<div class="mt-2 h-3.5 w-32 rounded bg-slate-800/60"></div>
			</div>
		{/each}
	</div>

	<!-- Two-column Activity Skeleton -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		{#each [1, 2] as col (col)}
			<div class="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
				<div class="mb-4 flex items-center justify-between">
					<div class="h-5 w-32 rounded bg-slate-800"></div>
					<div class="h-4 w-16 rounded bg-slate-800/60"></div>
				</div>
				<div class="divide-y divide-slate-800/60">
					{#each [1, 2, 3, 4] as row (row)}
						<div class="flex items-center justify-between py-3">
							<div class="space-y-1.5">
								<div class="h-4 w-36 rounded bg-slate-800"></div>
								<div class="h-3 w-28 rounded bg-slate-800/60"></div>
							</div>
							<div class="h-4 w-20 rounded bg-slate-800/80"></div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
