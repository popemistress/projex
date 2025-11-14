import { api } from '~/utils/api'
import LoadingSpinner from '~/components/LoadingSpinner'

interface GoalActivityFeedProps {
	goalPublicId: string
}

export function GoalActivityFeed({ goalPublicId }: GoalActivityFeedProps) {
	const { data: activities, isLoading } = api.goal.getActivities.useQuery({
		goalPublicId,
	})

	if (isLoading) {
		return (
			<div className="flex h-32 items-center justify-center rounded-lg border border-light-300 bg-white dark:border-dark-400 dark:bg-dark-100">
				<LoadingSpinner />
			</div>
		)
	}

	return (
		<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
			<h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-dark-1000">
				Activity
			</h3>
			{activities && activities.length > 0 ? (
				<div className="space-y-3">
					{activities.map((activity: any) => (
						<div
							key={activity.id}
							className="flex gap-3 border-l-2 border-blue-500 pl-3 text-sm"
						>
							<span className="text-xs text-neutral-500 dark:text-dark-600">
								{new Date(activity.createdAt).toLocaleDateString()}
							</span>
							<span className="flex-1 text-neutral-900 dark:text-dark-1000">
								{activity.type
									.replace('goal.', '')
									.replace(/\./g, ' ')
									.replace(/_/g, ' ')}
							</span>
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-neutral-500 dark:text-dark-600">
					No activity yet
				</p>
			)}
		</div>
	)
}
