interface GoalsFiltersProps {
	filters: {
		status?: string
		goalType?: string
		includeArchived: boolean
	}
	onFiltersChange: (filters: any) => void
}

export function GoalsFilters({ filters, onFiltersChange }: GoalsFiltersProps) {
	return (
		<div className="mb-6 flex flex-wrap gap-4 rounded-lg border border-light-300 bg-white p-4 dark:border-dark-400 dark:bg-dark-100">
			<div>
				<label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-dark-800">
					Status
				</label>
				<select
					value={filters.status || ''}
					onChange={(e) =>
						onFiltersChange({ ...filters, status: e.target.value || undefined })
					}
					className="rounded-lg border border-light-300 bg-white px-3 py-1.5 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000"
				>
					<option value="">All Statuses</option>
					<option value="not_started">Not Started</option>
					<option value="in_progress">In Progress</option>
					<option value="completed">Completed</option>
					<option value="on_hold">On Hold</option>
					<option value="abandoned">Abandoned</option>
				</select>
			</div>

			<div>
				<label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-dark-800">
					Type
				</label>
				<select
					value={filters.goalType || ''}
					onChange={(e) =>
						onFiltersChange({
							...filters,
							goalType: e.target.value || undefined,
						})
					}
					className="rounded-lg border border-light-300 bg-white px-3 py-1.5 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000"
				>
					<option value="">All Types</option>
					<option value="personal">Personal</option>
					<option value="professional">Professional</option>
					<option value="health">Health</option>
					<option value="finance">Finance</option>
					<option value="learning">Learning</option>
					<option value="relationships">Relationships</option>
					<option value="creativity">Creativity</option>
					<option value="other">Other</option>
				</select>
			</div>

			<div className="flex items-end">
				<label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-dark-800">
					<input
						type="checkbox"
						checked={filters.includeArchived}
						onChange={(e) =>
							onFiltersChange({
								...filters,
								includeArchived: e.target.checked,
							})
						}
						className="h-4 w-4 rounded border-light-300 text-blue-600 focus:ring-blue-500 dark:border-dark-400"
					/>
					Include Archived
				</label>
			</div>
		</div>
	)
}
