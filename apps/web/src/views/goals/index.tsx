import { useState } from 'react'
import { HiOutlinePlusSmall, HiOutlineChartBar } from 'react-icons/hi2'

import { authClient } from '@kan/auth/client'

import Button from '~/components/Button'
import Modal from '~/components/modal'
import { PageHead } from '~/components/PageHead'
import { useModal } from '~/providers/modal'
import { useWorkspace } from '~/providers/workspace'
import { api } from '~/utils/api'
import { GoalsList } from './components/GoalsList'
import { NewGoalForm } from './components/NewGoalForm'
import { GoalsStats } from './components/GoalsStats'
import { GoalsFilters } from './components/GoalsFilters'

export default function GoalsView() {
	const { openModal, modalContentType, isOpen } = useModal()
	const { workspace } = useWorkspace()
	const { data: session } = authClient.useSession()
	const [filters, setFilters] = useState({
		status: undefined as string | undefined,
		goalType: undefined as string | undefined,
		includeArchived: false,
	})

	const { data: goals, isLoading } = api.goal.getAllByWorkspace.useQuery({
		workspacePublicId: workspace.publicId,
		...filters,
	})

	return (
		<>
			<PageHead title={`Goals | ${workspace.name ?? 'Workspace'}`} />
			<div className="h-full w-full bg-light-50 dark:bg-dark-50">
				{/* Header Section */}
				<div className="border-b border-light-300 bg-white px-8 py-6 dark:border-dark-400 dark:bg-dark-100">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
								Goals
							</h1>
							<p className="text-sm text-neutral-600 dark:text-dark-700">
								Track and achieve your personal and professional goals
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="secondary"
								size="sm"
								onClick={() => openModal('GOALS_ANALYTICS')}
							>
								<HiOutlineChartBar className="h-4 w-4" />
								Analytics
							</Button>
							<Button
								variant="primary"
								size="sm"
								onClick={() => openModal('NEW_GOAL')}
							>
								<HiOutlinePlusSmall className="h-5 w-5" />
								New Goal
							</Button>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="mx-auto max-w-[1600px] p-8">
					{/* Stats Overview */}
					<GoalsStats goals={goals} />

					{/* Filters */}
					<GoalsFilters filters={filters} onFiltersChange={setFilters} />

					{/* Goals List */}
					<GoalsList goals={goals} isLoading={isLoading} />
				</div>

				{/* Modals */}
				<Modal
					modalSize="md"
					isVisible={isOpen && modalContentType === 'NEW_GOAL'}
				>
					<NewGoalForm />
				</Modal>
			</div>
		</>
	)
}
