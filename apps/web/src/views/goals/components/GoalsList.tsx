import { useRouter } from 'next/router'
import { HiOutlineFlag, HiOutlineCalendar, HiOutlineChartBar } from 'react-icons/hi2'
import LoadingSpinner from '~/components/LoadingSpinner'

interface Goal {
	publicId: string
	title: string
	description?: string
	goalType: string
	timeframe: string
	status: string
	priority: string
	progress: number
	targetDate?: string
	createdAt: string
	subGoals?: Array<{
		publicId: string
		title: string
		status: string
		progress: number
	}>
	milestones?: Array<{
		id: number
		title: string
		completedDate?: string
	}>
}

interface GoalsListProps {
	goals?: Goal[]
	isLoading: boolean
}

const priorityColors = {
	critical: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
	high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
	medium:
		'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
	low: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
}

const statusColors = {
	not_started: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
	in_progress:
		'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
	completed:
		'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
	on_hold:
		'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
	abandoned: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

export function GoalsList({ goals, isLoading }: GoalsListProps) {
	const router = useRouter()

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	if (!goals || goals.length === 0) {
		return (
			<div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-light-300 dark:border-dark-400">
				<HiOutlineFlag className="mb-4 h-12 w-12 text-neutral-400" />
				<h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-dark-1000">
					No goals yet
				</h3>
				<p className="text-sm text-neutral-600 dark:text-dark-700">
					Create your first goal to start tracking your progress
				</p>
			</div>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{goals.map((goal) => (
				<div
					key={goal.publicId}
					onClick={() => router.push(`/goals/${goal.publicId}`)}
					className="cursor-pointer rounded-lg border border-light-300 bg-white p-6 transition-all hover:shadow-md dark:border-dark-400 dark:bg-dark-100 dark:hover:border-dark-500"
				>
					{/* Header */}
					<div className="mb-4">
						<div className="mb-2 flex items-start justify-between">
							<h3 className="flex-1 text-lg font-semibold text-neutral-900 dark:text-dark-1000">
								{goal.title}
							</h3>
							<span
								className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
									priorityColors[goal.priority as keyof typeof priorityColors]
								}`}
							>
								{goal.priority}
							</span>
						</div>
						{goal.description && (
							<p className="line-clamp-2 text-sm text-neutral-600 dark:text-dark-700">
								{goal.description}
							</p>
						)}
					</div>

					{/* Progress Bar */}
					<div className="mb-4">
						<div className="mb-1 flex items-center justify-between text-xs">
							<span className="text-neutral-600 dark:text-dark-700">
								Progress
							</span>
							<span className="font-medium text-neutral-900 dark:text-dark-1000">
								{goal.progress}%
							</span>
						</div>
						<div className="h-2 w-full overflow-hidden rounded-full bg-light-200 dark:bg-dark-300">
							<div
								className="h-full rounded-full bg-blue-500 transition-all"
								style={{ width: `${goal.progress}%` }}
							/>
						</div>
					</div>

					{/* Meta Information */}
					<div className="space-y-2">
						<div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-dark-700">
							<span
								className={`rounded-full px-2 py-1 ${
									statusColors[goal.status as keyof typeof statusColors]
								}`}
							>
								{goal.status.replace('_', ' ')}
							</span>
							<span className="capitalize">{goal.goalType}</span>
							<span className="capitalize">{goal.timeframe}</span>
						</div>

						{goal.targetDate && (
							<div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-dark-700">
								<HiOutlineCalendar className="h-4 w-4" />
								<span>
									Due {new Date(goal.targetDate).toLocaleDateString()}
								</span>
							</div>
						)}

						{goal.subGoals && goal.subGoals.length > 0 && (
							<div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-dark-700">
								<HiOutlineChartBar className="h-4 w-4" />
								<span>{goal.subGoals.length} sub-goals</span>
							</div>
						)}

						{goal.milestones && goal.milestones.length > 0 && (
							<div className="text-xs text-neutral-600 dark:text-dark-700">
								{goal.milestones.filter((m) => m.completedDate).length}/
								{goal.milestones.length} milestones completed
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	)
}
