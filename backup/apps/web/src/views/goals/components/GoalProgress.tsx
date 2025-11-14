interface GoalProgressProps {
	goal: {
		progress: number
		status: string
		priority: string
		startDate?: string
		targetDate?: string
		completedDate?: string
	}
}

const statusColors = {
	not_started: 'bg-gray-500',
	in_progress: 'bg-blue-500',
	completed: 'bg-green-500',
	on_hold: 'bg-yellow-500',
	abandoned: 'bg-red-500',
}

const priorityColors = {
	critical: 'text-red-600 dark:text-red-400',
	high: 'text-orange-600 dark:text-orange-400',
	medium: 'text-yellow-600 dark:text-yellow-400',
	low: 'text-green-600 dark:text-green-400',
}

export function GoalProgress({ goal }: GoalProgressProps) {
	return (
		<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
			<h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-dark-1000">
				Progress
			</h3>

			{/* Progress Bar */}
			<div className="mb-6">
				<div className="mb-2 flex items-center justify-between">
					<span className="text-sm text-neutral-600 dark:text-dark-700">
						Overall Progress
					</span>
					<span className="text-lg font-bold text-neutral-900 dark:text-dark-1000">
						{goal.progress}%
					</span>
				</div>
				<div className="h-4 w-full overflow-hidden rounded-full bg-light-200 dark:bg-dark-300">
					<div
						className={`h-full rounded-full transition-all ${
							statusColors[goal.status as keyof typeof statusColors]
						}`}
						style={{ width: `${goal.progress}%` }}
					/>
				</div>
			</div>

			{/* Meta Information */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<div className="text-xs text-neutral-500 dark:text-dark-600">
						Status
					</div>
					<div className="mt-1 text-sm font-medium capitalize text-neutral-900 dark:text-dark-1000">
						{goal.status.replace('_', ' ')}
					</div>
				</div>
				<div>
					<div className="text-xs text-neutral-500 dark:text-dark-600">
						Priority
					</div>
					<div
						className={`mt-1 text-sm font-medium capitalize ${
							priorityColors[goal.priority as keyof typeof priorityColors]
						}`}
					>
						{goal.priority}
					</div>
				</div>
				{goal.startDate && (
					<div>
						<div className="text-xs text-neutral-500 dark:text-dark-600">
							Start Date
						</div>
						<div className="mt-1 text-sm font-medium text-neutral-900 dark:text-dark-1000">
							{new Date(goal.startDate).toLocaleDateString()}
						</div>
					</div>
				)}
				{goal.targetDate && (
					<div>
						<div className="text-xs text-neutral-500 dark:text-dark-600">
							Target Date
						</div>
						<div className="mt-1 text-sm font-medium text-neutral-900 dark:text-dark-1000">
							{new Date(goal.targetDate).toLocaleDateString()}
						</div>
					</div>
				)}
				{goal.completedDate && (
					<div className="col-span-2">
						<div className="text-xs text-neutral-500 dark:text-dark-600">
							Completed On
						</div>
						<div className="mt-1 text-sm font-medium text-green-600 dark:text-green-400">
							{new Date(goal.completedDate).toLocaleDateString()}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
