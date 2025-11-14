import { useRouter } from 'next/router'
import { HiOutlineFire, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi2'
import { TbTrash, TbNote } from 'react-icons/tb'
import LoadingSpinner from '~/components/LoadingSpinner'
import { api } from '~/utils/api'
import { TrackingUI } from './TrackingUI'

interface Habit {
	publicId: string
	title: string
	description?: string
	category: string
	habitType?: 'build' | 'remove'
	trackingType?: 'task' | 'count' | 'time'
	frequency: string
	status: string
	streakCount: number
	longestStreak: number
	totalCompletions: number
	targetCount?: number
	unit?: string
	color?: string
	icon?: string
	reminderTime?: string
	reminderEnabled: boolean
}

interface HabitsListProps {
	habits?: Habit[]
	isLoading: boolean
	viewMode?: 'detail' | 'list'
}

const categoryColors = {
	physical_mastery: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
	mental_mastery: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
	financial_mastery: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
	social_mastery: 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
	spiritual_mastery: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
	other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
}

export function HabitsList({ habits, isLoading, viewMode = 'detail' }: HabitsListProps) {
	const router = useRouter()
	const utils = api.useUtils()

	// Check if habit API is available
	const hasHabitAPI = typeof (api as any).habit !== 'undefined'

	const recordCompletion = hasHabitAPI
		? (api as any).habit.recordCompletion.useMutation({
				onSuccess: () => {
					utils?.habit.getAllByWorkspace.invalidate()
				},
		  })
		: { mutate: () => {}, isPending: false }

	const deleteHabit = hasHabitAPI
		? (api as any).habit.delete.useMutation({
				onSuccess: () => {
					utils?.habit.getAllByWorkspace.invalidate()
				},
		  })
		: { mutate: () => {}, isPending: false }

	const isCompletedToday = hasHabitAPI
		? (api as any).habit.isCompletedToday.useQuery
		: null

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	if (!habits || habits.length === 0) {
		return (
			<div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-light-300 dark:border-dark-400">
				<HiOutlineCheckCircle className="mb-4 h-12 w-12 text-neutral-400" />
				<h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-dark-1000">
					No habits yet
				</h3>
				<p className="text-sm text-neutral-600 dark:text-dark-700">
					Create your first habit to start building consistency
				</p>
			</div>
		)
	}

	// List View
	if (viewMode === 'list') {
		return (
			<div className="space-y-2">
				{habits.map((habit) => (
					<div
						key={habit.publicId}
						className="flex items-center justify-between rounded-lg border border-light-300 bg-white p-4 transition-all hover:shadow-sm dark:border-dark-400 dark:bg-dark-100 dark:hover:border-dark-500"
					>
						{/* Left: Icon, Color, and Name */}
						<div className="flex items-center gap-3">
							{/* Icon with Color Background */}
							<div
								className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
								style={{
									backgroundColor: habit.color
										? `${habit.color}20`
										: 'rgb(59, 130, 246, 0.1)',
								}}
							>
								{habit.icon || '📋'}
							</div>

							{/* Habit Name */}
							<div>
								<h3
									className="cursor-pointer font-semibold text-neutral-900 dark:text-dark-1000"
									onClick={() => router.push(`/habits/${habit.publicId}`)}
								>
									{habit.title}
								</h3>
								<p className="text-sm text-neutral-600 dark:text-dark-700">
									{habit.frequency}
								</p>
							</div>
						</div>

						{/* Right: Status (Progress) and Actions */}
						<div className="flex items-center gap-3">
							{/* Progress Text */}
							<div className="text-right">
								<div className="font-medium text-green-600 dark:text-green-400">
									{habit.streakCount}/{habit.totalCompletions} glasses
								</div>
								<div className="text-xs text-neutral-600 dark:text-dark-700">
									Current streak: {habit.streakCount} days
								</div>
							</div>

							{/* Checkmark Icon */}
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
								<HiOutlineCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>

							{/* Action Icons */}
							<div className="flex items-center gap-2">
								<button
									onClick={(e) => {
										e.stopPropagation()
										// TODO: Open note modal
										console.log('Add note for habit:', habit.publicId)
									}}
									className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:text-dark-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
									title="Add note"
								>
									<TbNote className="h-5 w-5" />
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation()
										if (
											confirm(
												`Delete habit "${habit.title}"? This action cannot be undone.`,
											)
										) {
											deleteHabit.mutate({ publicId: habit.publicId })
										}
									}}
									className="rounded p-1.5 text-neutral-600 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-dark-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
									title="Delete habit"
									disabled={deleteHabit.isPending}
								>
									<TbTrash className="h-5 w-5" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>
		)
	}

	// Detail View (Original Grid)
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{habits.map((habit) => (
				<div
					key={habit.publicId}
					className="rounded-lg border border-light-300 bg-white p-6 transition-all hover:shadow-md dark:border-dark-400 dark:bg-dark-100 dark:hover:border-dark-500"
				>
					{/* Header */}
					<div className="mb-4">
						<div className="mb-2 flex items-start justify-between">
							<div className="flex-1">
								<h3
									className="mb-1 cursor-pointer text-lg font-semibold text-neutral-900 dark:text-dark-1000"
									onClick={() => router.push(`/habits/${habit.publicId}`)}
								>
									{habit.title}
								</h3>
								{habit.description && (
									<p className="line-clamp-2 text-sm text-neutral-600 dark:text-dark-700">
										{habit.description}
									</p>
								)}
							</div>
							{habit.icon && (
								<span className="ml-2 text-2xl">{habit.icon}</span>
							)}
						</div>
						
						{/* Action Icons */}
						<div className="flex items-center gap-2">
							<button
								onClick={(e) => {
									e.stopPropagation()
									// TODO: Open note modal
									console.log('Add note for habit:', habit.publicId)
								}}
								className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:text-dark-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
								title="Add note"
							>
								<TbNote className="h-4 w-4" />
								<span>Note</span>
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation()
									if (
										confirm(
											`Delete habit "${habit.title}"? This action cannot be undone.`,
										)
									) {
										deleteHabit.mutate({ publicId: habit.publicId })
									}
								}}
								className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-dark-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
								title="Delete habit"
								disabled={deleteHabit.isPending}
							>
								<TbTrash className="h-4 w-4" />
								<span>Delete</span>
							</button>
						</div>
					</div>

					{/* Streak Display */}
					<div className="mb-4 flex items-center justify-between rounded-lg bg-light-50 p-3 dark:bg-dark-50">
						<div className="flex items-center gap-2">
							<HiOutlineFire className="h-5 w-5 text-orange-500" />
							<div>
								<div className="text-lg font-bold text-neutral-900 dark:text-dark-1000">
									{habit.streakCount} days
								</div>
								<div className="text-xs text-neutral-600 dark:text-dark-700">
									Current Streak
								</div>
							</div>
						</div>
						<div className="text-right">
							<div className="text-sm font-medium text-neutral-900 dark:text-dark-1000">
								{habit.longestStreak}
							</div>
							<div className="text-xs text-neutral-600 dark:text-dark-700">
								Best
							</div>
						</div>
					</div>

					{/* Meta Information */}
					<div className="mb-4 space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span
								className={`rounded-full px-2 py-1 text-xs font-medium ${
									categoryColors[habit.category as keyof typeof categoryColors]
								}`}
							>
								{habit.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
							</span>
							<span className="text-neutral-600 dark:text-dark-700">
								{habit.frequency}
							</span>
						</div>
						<div className="flex items-center justify-between text-sm text-neutral-600 dark:text-dark-700">
							<span>{habit.totalCompletions} completions</span>
							{habit.reminderEnabled && habit.reminderTime && (
								<div className="flex items-center gap-1">
									<HiOutlineClock className="h-4 w-4" />
									<span>{habit.reminderTime}</span>
								</div>
							)}
						</div>
					</div>

					{/* Tracking UI */}
					<div className="flex justify-center">
						<TrackingUI
							habitId={habit.publicId}
							trackingType={habit.trackingType || 'task'}
							currentCount={0}
							targetCount={habit.targetCount || 1}
							unit={habit.unit || 'times'}
							onComplete={(count) =>
								recordCompletion.mutate({
									habitPublicId: habit.publicId,
									count,
								})
							}
							isPending={recordCompletion.isPending}
						/>
					</div>
				</div>
			))}
		</div>
	)
}
