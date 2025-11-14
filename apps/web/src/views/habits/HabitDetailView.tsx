'use client'

import { useRouter } from 'next/router'
import { useState } from 'react'
import {
	HiOutlineFire,
	HiOutlineCheckCircle,
	HiOutlineClock,
	HiOutlineChartBar,
} from 'react-icons/hi2'
import { TbTrash, TbNote, TbEdit, TbArrowLeft } from 'react-icons/tb'

import { authClient } from '@kan/auth/client'

import Button from '~/components/Button'
import Modal from '~/components/modal'
import { PageHead } from '~/components/PageHead'
import LoadingSpinner from '~/components/LoadingSpinner'
import { useWorkspace } from '~/providers/workspace'
import { api } from '~/utils/api'
import { TrackingUI } from './components/TrackingUI'

export default function HabitDetailView() {
	const router = useRouter()
	const { habitId } = router.query
	const { workspace } = useWorkspace()
	const { data: session } = authClient.useSession()
	const [isNotesModalOpen, setIsNotesModalOpen] = useState(false)
	const [notes, setNotes] = useState('')

	const utils = api.useUtils()

	// Check if habit API is available
	const hasHabitAPI = typeof (api as any).habit !== 'undefined'

	const { data: habit, isLoading } = hasHabitAPI
		? (api as any).habit.getByPublicId.useQuery(
				{ publicId: habitId as string },
				{ enabled: !!habitId },
		  )
		: { data: null, isLoading: false }

	const deleteHabit = hasHabitAPI
		? (api as any).habit.delete.useMutation({
				onSuccess: () => {
					router.push('/habits')
				},
		  })
		: { mutate: () => {}, isPending: false }

	const updateHabit = hasHabitAPI
		? (api as any).habit.update.useMutation({
				onSuccess: () => {
					utils?.habit.getByPublicId.invalidate()
					setIsNotesModalOpen(false)
				},
		  })
		: { mutate: () => {}, isPending: false }

	const recordCompletion = hasHabitAPI
		? (api as any).habit.recordCompletion.useMutation({
				onSuccess: () => {
					utils?.habit.getByPublicId.invalidate()
				},
		  })
		: { mutate: () => {}, isPending: false }

	const handleDelete = () => {
		if (confirm(`Delete habit "${habit?.title}"? This action cannot be undone.`)) {
			deleteHabit.mutate({ publicId: habitId as string })
		}
	}

	const handleSaveNotes = () => {
		updateHabit.mutate({
			publicId: habitId as string,
			description: notes,
		})
	}

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	if (!habit) {
		return (
			<div className="flex h-screen flex-col items-center justify-center">
				<h2 className="text-xl font-semibold text-neutral-900 dark:text-dark-1000">
					Habit not found
				</h2>
				<Button
					variant="secondary"
					size="sm"
					onClick={() => router.push('/habits')}
					className="mt-4"
				>
					<TbArrowLeft className="h-4 w-4" />
					Back to Habits
				</Button>
			</div>
		)
	}

	return (
		<>
			<PageHead title={`${habit.title} | ${workspace.name ?? 'Workspace'}`} />
			<div className="h-full w-full bg-light-50 dark:bg-dark-50">
				{/* Header Section */}
				<div className="border-b border-light-300 bg-white px-8 py-6 dark:border-dark-400 dark:bg-dark-100">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button
								variant="secondary"
								size="sm"
								onClick={() => router.push('/habits')}
							>
								<TbArrowLeft className="h-4 w-4" />
							</Button>
							<div className="flex items-center gap-3">
								{habit.icon && (
									<div
										className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
										style={{
											backgroundColor: habit.color
												? `${habit.color}20`
												: 'rgb(59, 130, 246, 0.1)',
										}}
									>
										{habit.icon}
									</div>
								)}
								<div>
									<h1 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
										{habit.title}
									</h1>
									<p className="text-sm text-neutral-600 dark:text-dark-700">
										{habit.category} • {habit.frequency}
									</p>
								</div>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									setNotes(habit.description || '')
									setIsNotesModalOpen(true)
								}}
							>
								<TbNote className="h-4 w-4" />
								Notes
							</Button>
							<Button
								variant="secondary"
								size="sm"
								onClick={handleDelete}
								disabled={deleteHabit.isPending}
							>
								<TbTrash className="h-4 w-4" />
								Delete
							</Button>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="mx-auto max-w-[1200px] p-8">
					{/* Stats Cards */}
					<div className="mb-8 grid gap-6 md:grid-cols-3">
						{/* Current Streak */}
						<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/20">
									<HiOutlineFire className="h-6 w-6 text-orange-500" />
								</div>
								<div>
									<div className="text-2xl font-bold text-neutral-900 dark:text-dark-1000">
										{habit.streakCount} days
									</div>
									<div className="text-sm text-neutral-600 dark:text-dark-700">
										Current Streak
									</div>
								</div>
							</div>
						</div>

						{/* Longest Streak */}
						<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
									<HiOutlineChartBar className="h-6 w-6 text-blue-500" />
								</div>
								<div>
									<div className="text-2xl font-bold text-neutral-900 dark:text-dark-1000">
										{habit.longestStreak} days
									</div>
									<div className="text-sm text-neutral-600 dark:text-dark-700">
										Best Streak
									</div>
								</div>
							</div>
						</div>

						{/* Total Completions */}
						<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
							<div className="flex items-center gap-3">
								<div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
									<HiOutlineCheckCircle className="h-6 w-6 text-green-500" />
								</div>
								<div>
									<div className="text-2xl font-bold text-neutral-900 dark:text-dark-1000">
										{habit.totalCompletions}
									</div>
									<div className="text-sm text-neutral-600 dark:text-dark-700">
										Total Completions
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Notes Section */}
					<div className="mb-8 rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
								Notes
							</h2>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									setNotes(habit.description || '')
									setIsNotesModalOpen(true)
								}}
							>
								<TbEdit className="h-4 w-4" />
								Edit
							</Button>
						</div>
						{habit.description ? (
							<div className="whitespace-pre-wrap text-neutral-700 dark:text-dark-800">
								{habit.description}
							</div>
						) : (
							<p className="text-neutral-500 dark:text-dark-600">
								No notes yet. Click Edit to add notes about this habit.
							</p>
						)}
					</div>

					{/* Details Section */}
					<div className="mb-8 rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
						<h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-dark-1000">
							Details
						</h2>
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<div className="text-sm font-medium text-neutral-600 dark:text-dark-700">
									Category
								</div>
								<div className="mt-1 text-neutral-900 dark:text-dark-1000">
									{habit.category}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-neutral-600 dark:text-dark-700">
									Frequency
								</div>
								<div className="mt-1 text-neutral-900 dark:text-dark-1000">
									{habit.frequency}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium text-neutral-600 dark:text-dark-700">
									Status
								</div>
								<div className="mt-1 text-neutral-900 dark:text-dark-1000">
									{habit.status}
								</div>
							</div>
							{habit.reminderEnabled && habit.reminderTime && (
								<div>
									<div className="text-sm font-medium text-neutral-600 dark:text-dark-700">
										Reminder
									</div>
									<div className="mt-1 flex items-center gap-1 text-neutral-900 dark:text-dark-1000">
										<HiOutlineClock className="h-4 w-4" />
										{habit.reminderTime}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Tracking UI */}
					<div className="flex justify-center">
						<TrackingUI
							habitId={habitId as string}
							trackingType={(habit as any).trackingType || 'task'}
							currentCount={0}
							targetCount={(habit as any).targetCount || 1}
							unit={(habit as any).unit || 'times'}
							onComplete={(count) =>
								recordCompletion.mutate({
									habitPublicId: habitId as string,
									count,
								})
							}
							isPending={recordCompletion.isPending}
						/>
					</div>
				</div>

				{/* Notes Modal */}
				<Modal
					modalSize="lg"
					isVisible={isNotesModalOpen}
					onClose={() => setIsNotesModalOpen(false)}
				>
					<div className="p-6">
						<h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-dark-1000">
							Edit Notes
						</h2>
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Add notes about this habit..."
							className="mb-4 min-h-[300px] w-full rounded-lg border border-light-300 bg-white p-4 text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000"
						/>
						<div className="flex justify-end gap-2">
							<Button
								variant="secondary"
								onClick={() => setIsNotesModalOpen(false)}
								disabled={updateHabit.isPending}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={handleSaveNotes}
								disabled={updateHabit.isPending}
							>
								{updateHabit.isPending ? 'Saving...' : 'Save Notes'}
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</>
	)
}
