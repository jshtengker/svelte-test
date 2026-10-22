<div class="animate-pulse space-y-6">
	<!-- Page Header Skeleton -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<div class="flex items-center gap-2.5">
				<div class="h-8 w-36 rounded-lg bg-slate-800"></div>
				<div class="h-5 w-16 rounded-full bg-slate-800/80"></div>
			</div>
			<div class="mt-2 h-4 w-64 rounded bg-slate-800/60"></div>
		</div>

		<!-- Action bar & Controls Skeleton -->
		<div class="flex items-center gap-3">
			<div class="h-9 w-60 rounded-lg bg-slate-800/80"></div>
			<div class="h-9 w-20 rounded-lg bg-slate-800/60"></div>
		</div>
	</div>

	<!-- Table Skeleton -->
	<div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
		<div class="border-b border-slate-800 bg-slate-900/90 px-6 py-4">
			<div class="grid grid-cols-5 gap-4">
				<div class="h-4 w-28 rounded bg-slate-800"></div>
				<div class="h-4 w-20 rounded bg-slate-800"></div>
				<div class="h-4 w-20 rounded bg-slate-800"></div>
				<div class="h-4 w-16 rounded bg-slate-800"></div>
				<div class="h-4 w-16 justify-self-end rounded bg-slate-800"></div>
			</div>
		</div>

		<div class="divide-y divide-slate-800/60">
			{#each [1, 2, 3, 4, 5, 6, 7, 8] as row (row)}
				<div class="grid grid-cols-5 items-center gap-4 px-6 py-4">
					<div class="space-y-2">
						<div class="h-4 w-40 rounded bg-slate-800"></div>
						<div class="h-3 w-24 rounded bg-slate-800/60"></div>
					</div>
					<div class="h-4 w-24 rounded bg-slate-800/80"></div>
					<div class="flex items-center gap-2">
						<div class="h-2 w-2 rounded-full bg-slate-700"></div>
						<div class="h-3 w-16 rounded bg-slate-800/60"></div>
					</div>
					<div class="h-5 w-16 rounded-md bg-slate-800/80"></div>
					<div class="h-7 w-16 justify-self-end rounded-md bg-slate-800"></div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Pagination Skeleton -->
	<div class="flex items-center justify-between border-t border-slate-800/80 pt-4">
		<div class="h-4 w-48 rounded bg-slate-800/60"></div>
		<div class="flex items-center gap-2">
			<div class="h-8 w-20 rounded-lg bg-slate-800"></div>
			<div class="h-8 w-8 rounded-lg bg-slate-800"></div>
			<div class="h-8 w-8 rounded-lg bg-slate-800"></div>
			<div class="h-8 w-20 rounded-lg bg-slate-800"></div>
		</div>
	</div>
</div>
