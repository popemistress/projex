import { useRouter } from 'next/router'
import { useState } from 'react'
import {
	HiOutlineArrowLeft,
	HiOutlinePencil,
	HiOutlineTrash,
	HiOutlineArchiveBox,
	HiOutlinePlusSmall,
} from 'react-icons/hi2'
import { toast } from 'sonner'

import Button from '~/components/Button'
import LoadingSpinner from '~/components/LoadingSpinner'
import Modal from '~/components/modal'
import { PageHead } from '~/components/PageHead'
import { useModal } from '~/providers/modal'
import { useWorkspace } from '~/providers/workspace'
import { api } from '~/utils/api'
import { GoalProgress } from './components/GoalProgress'
import { MilestonesList } from './components/MilestonesList'
import { CheckInForm } from './components/CheckInForm'
import { GoalActivityFeed } from './components/GoalActivityFeed'
import { LinkCardsModal } from './components/LinkCardsModal'
import { EditGoalForm } from './components/EditGoalForm'
import { NewMilestoneForm } from './components/NewMilestoneForm'

export default function GoalDetailView() {
	const router = useRouter()
	const { goalId } = router.query
	const { workspace } = useWorkspace()
	const { openModal, modalContentType, isOpen } = useModal()
	const utils = api.useUtils()

	const { data: goal, isLoading } = api.goal.getByPublicId.useQuery(
		{ publicId: goalId as string },
		{ enabled: !!goalId },
	)

	const archiveGoal = api.goal.archive.useMutation({
		onSuccess: () => {
			toast.success('Goal archived')
			utils.goal.getAllByWorkspace.invalidate()
			router.push('/goals')
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to archive goal')
		},
	})

	const deleteGoal = api.goal.delete.useMutation({
		onSuccess: () => {
			toast.success('Goal deleted')
			utils.goal.getAllByWorkspace.invalidate()
			router.push('/goals')
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to delete goal')
		},
	})

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	if (!goal) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-neutral-900 dark:text-dark-1000">
						Goal not found
					</h2>
					<Button
						variant="primary"
						className="mt-4"
						onClick={() => router.push('/goals')}
					>
						Back to Goals
					</Button>
				</div>
			</div>
		)
	}

	return (
		<>
			<PageHead title={`${goal.title} | Goals`} />
			<div className="h-full w-full bg-light-50 dark:bg-dark-50">
				{/* Header */}
				<div className="border-b border-light-300 bg-white px-8 py-6 dark:border-dark-400 dark:bg-dark-100">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Button
								variant="secondary"
								size="sm"
								onClick={() => router.push('/goals')}
							>
								<HiOutlineArrowLeft className="h-4 w-4" />
								Back
							</Button>
							<div>
								<h1 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
									{goal.title}
								</h1>
								<p className="text-sm text-neutral-600 dark:text-dark-700">
									{goal.goalType} • {goal.timeframe}
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								variant="secondary"
								size="sm"
								onClick={() => openModal('EDIT_GOAL')}
							>
								<HiOutlinePencil className="h-4 w-4" />
								Edit
							</Button>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => archiveGoal.mutate({ publicId: goal.publicId })}
								disabled={archiveGoal.isPending}
							>
								<HiOutlineArchiveBox className="h-4 w-4" />
								Archive
							</Button>
							<Button
								variant="danger"
								size="sm"
								onClick={() => {
									if (
										confirm('Are you sure you want to delete this goal?')
									) {
										deleteGoal.mutate({ publicId: goal.publicId })
									}
								}}
								disabled={deleteGoal.isPending}
							>
								<HiOutlineTrash className="h-4 w-4" />
								Delete
							</Button>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="mx-auto max-w-[1600px] p-8">
					<div className="grid gap-6 lg:grid-cols-3">
						{/* Left Column - Main Content */}
						<div className="lg:col-span-2 space-y-6">
							{/* Progress Section */}
							<GoalProgress goal={goal} />

							{/* Description */}
							{goal.description && (
								<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
									<h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-dark-1000">
										Description
									</h3>
									<p className="text-sm text-neutral-600 dark:text-dark-700 whitespace-pre-wrap">
										{goal.description}
									</p>
								</div>
							)}

							{/* Milestones */}
							<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
								<div className="mb-4 flex items-center justify-between">
									<h3 className="text-sm font-semibold text-neutral-900 dark:text-dark-1000">
										Milestones
									</h3>
									<Button
										variant="secondary"
										size="sm"
										onClick={() => openModal('NEW_MILESTONE')}
									>
										<HiOutlinePlusSmall className="h-4 w-4" />
										Add Milestone
									</Button>
								</div>
								<MilestonesList
									goalPublicId={goal.publicId}
									milestones={goal.milestones}
								/>
							</div>

							{/* Linked Cards */}
							<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
								<div className="mb-4 flex items-center justify-between">
									<h3 className="text-sm font-semibold text-neutral-900 dark:text-dark-1000">
										Linked Cards ({goal.cards?.length || 0})
									</h3>
									<Button
										variant="secondary"
										size="sm"
										onClick={() => openModal('LINK_CARDS')}
									>
										<HiOutlinePlusSmall className="h-4 w-4" />
										Link Cards
									</Button>
								</div>
								{goal.cards && goal.cards.length > 0 ? (
									<div className="space-y-2">
										{goal.cards.map((link) => (
											<div
												key={link.card.id}
												className="flex items-center justify-between rounded-lg border border-light-200 p-3 dark:border-dark-300"
											>
												<span className="text-sm text-neutral-900 dark:text-dark-1000">
													{link.card.title}
												</span>
											</div>
										))}
									</div>
								) : (
									<p className="text-sm text-neutral-500 dark:text-dark-600">
										No cards linked yet
									</p>
								)}
							</div>

							{/* Activity Feed */}
							<GoalActivityFeed goalPublicId={goal.publicId} />
						</div>

						{/* Right Column - Sidebar */}
						<div className="space-y-6">
							{/* Check-in Form */}
							<CheckInForm goalPublicId={goal.publicId} />

							{/* Sub-goals */}
							{goal.subGoals && goal.subGoals.length > 0 && (
								<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
									<h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-dark-1000">
										Sub-goals
									</h3>
									<div className="space-y-3">
										{goal.subGoals.map((subGoal) => (
											<div
												key={subGoal.publicId}
												onClick={() =>
													router.push(`/goals/${subGoal.publicId}`)
												}
												className="cursor-pointer rounded-lg border border-light-200 p-3 transition-colors hover:bg-light-50 dark:border-dark-300 dark:hover:bg-dark-50"
											>
												<div className="mb-2 text-sm font-medium text-neutral-900 dark:text-dark-1000">
													{subGoal.title}
												</div>
												<div className="flex items-center justify-between text-xs text-neutral-600 dark:text-dark-700">
													<span>{subGoal.status.replace('_', ' ')}</span>
													<span>{subGoal.progress}%</span>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Tags */}
							{goal.tags && goal.tags.length > 0 && (
								<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
									<h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-dark-1000">
										Tags
									</h3>
									<div className="flex flex-wrap gap-2">
										{goal.tags.map((tag) => (
											<span
												key={tag}
												className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Modals */}
				<Modal
					modalSize="md"
					isVisible={isOpen && modalContentType === 'EDIT_GOAL'}
				>
					<EditGoalForm goal={goal} />
				</Modal>

				<Modal
					modalSize="sm"
					isVisible={isOpen && modalContentType === 'NEW_MILESTONE'}
				>
					<NewMilestoneForm goalPublicId={goal.publicId} />
				</Modal>

				<Modal
					modalSize="lg"
					isVisible={isOpen && modalContentType === 'LINK_CARDS'}
				>
					<LinkCardsModal goalPublicId={goal.publicId} />
				</Modal>
			</div>
		</>
	)
}
