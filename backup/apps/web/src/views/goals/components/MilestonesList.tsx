import { HiOutlineCheckCircle, HiOutlineCalendar } from 'react-icons/hi2'
import { api } from '~/utils/api'

interface Milestone {
	id: number
	publicId: string
	title: string
	description?: string
	targetDate?: string
	completedDate?: string
}

interface MilestonesListProps {
	goalPublicId: string
	milestones?: Milestone[]
}

export function MilestonesList({ goalPublicId, milestones = [] }: MilestonesListProps) {
	const utils = api.useUtils()

	const completeMilestone = api.goal.completeMilestone.useMutation({
		onSuccess: () => {
			utils.goal.getByPublicId.invalidate({ publicId: goalPublicId })
		},
	})

	if (milestones.length === 0) {
		return (
			<p className="text-sm text-neutral-500 dark:text-dark-600">
				No milestones yet
			</p>
		)
	}

	return (
		<div className="space-y-3">
			{milestones.map((milestone) => (
				<div
					key={milestone.id}
					className="flex items-start gap-3 rounded-lg border border-light-200 p-3 dark:border-dark-300"
				>
					<button
						onClick={() => {
							if (!milestone.completedDate) {
								completeMilestone.mutate({
									milestonePublicId: milestone.publicId,
								})
							}
						}}
						className="mt-0.5"
						disabled={!!milestone.completedDate}
					>
						<HiOutlineCheckCircle
							className={`h-5 w-5 ${
								milestone.completedDate
									? 'text-green-500'
									: 'text-neutral-300 hover:text-neutral-500 dark:text-dark-500 dark:hover:text-dark-700'
							}`}
						/>
					</button>
					<div className="flex-1">
						<div
							className={`text-sm font-medium ${
								milestone.completedDate
									? 'text-neutral-500 line-through dark:text-dark-600'
									: 'text-neutral-900 dark:text-dark-1000'
							}`}
						>
							{milestone.title}
						</div>
						{milestone.description && (
							<p className="mt-1 text-xs text-neutral-600 dark:text-dark-700">
								{milestone.description}
							</p>
						)}
						{(milestone.targetDate || milestone.completedDate) && (
							<div className="mt-2 flex items-center gap-1 text-xs text-neutral-500 dark:text-dark-600">
								<HiOutlineCalendar className="h-3 w-3" />
								{milestone.completedDate
									? `Completed ${new Date(milestone.completedDate).toLocaleDateString()}`
									: `Due ${new Date(milestone.targetDate!).toLocaleDateString()}`}
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	)
}
