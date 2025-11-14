import { useState } from 'react'
import { HiOutlinePlusSmall } from 'react-icons/hi2'
import { TbLayoutGrid, TbList, TbFilter } from 'react-icons/tb'

import { authClient } from '@kan/auth/client'

import Button from '~/components/Button'
import Modal from '~/components/modal'
import { PageHead } from '~/components/PageHead'
import Select from '~/components/Select'
import { useModal } from '~/providers/modal'
import { useWorkspace } from '~/providers/workspace'
import { api } from '~/utils/api'
import { HabitsList } from './components/HabitsList'
import { NewHabitForm } from './components/NewHabitForm'

export default function HabitsView() {
	const { openModal, modalContentType, isOpen } = useModal()
	const { workspace } = useWorkspace()
	const { data: session } = authClient.useSession()
	const [viewMode, setViewMode] = useState<'detail' | 'list'>('detail')
	const [filters, setFilters] = useState({
		status: undefined as string | undefined,
		category: undefined as string | undefined,
	})

	const { data: habits, isLoading } = api.habit.getAllByWorkspace.useQuery({
		workspacePublicId: workspace.publicId,
		...filters,
	})

	return (
		<>
			<PageHead title={`Habits | ${workspace.name ?? 'Workspace'}`} />
			<div className="h-full w-full bg-light-50 dark:bg-dark-50">
				{/* Header Section */}
				<div className="border-b border-light-300 bg-white px-8 py-6 dark:border-dark-400 dark:bg-dark-100">
					<div>
						<h1 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
							Habits
						</h1>
						<p className="text-sm text-neutral-600 dark:text-dark-700">
							Build and track your daily habits
						</p>
					</div>
				</div>

				{/* Main Content */}
				<div className="mx-auto max-w-[1600px] p-8">
					{/* Filters */}
					<div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-lg border border-light-300 bg-white p-4 dark:border-dark-400 dark:bg-dark-100">
						<div className="flex flex-wrap items-end gap-4">
							<div className="w-auto">
								<Select
									value={filters.status || ''}
									onChange={(e) =>
										setFilters({ ...filters, status: e.target.value || undefined })
									}
									label="Status"
									icon={<TbFilter />}
									className="w-auto min-w-[180px]"
								>
									<option value="">All Statuses</option>
									<option value="active">Active</option>
									<option value="paused">Paused</option>
									<option value="completed">Completed</option>
									<option value="archived">Archived</option>
								</Select>
							</div>

							<div className="w-auto">
								<Select
									value={filters.category || ''}
									onChange={(e) =>
										setFilters({
											...filters,
											category: e.target.value || undefined,
										})
									}
									label="Category"
									icon={<TbFilter />}
									className="w-auto min-w-[180px]"
								>
									<option value="">All Categories</option>
									<option value="physical_mastery">Physical Mastery</option>
									<option value="mental_mastery">Mental Mastery</option>
									<option value="financial_mastery">Financial Mastery</option>
									<option value="social_mastery">Social Mastery</option>
									<option value="spiritual_mastery">Spiritual Mastery</option>
									<option value="other">Other</option>
								</Select>
							</div>

							<button
								onClick={() => openModal('NEW_HABIT')}
								className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
							>
								<HiOutlinePlusSmall className="h-5 w-5" />
								<span>New Habit</span>
							</button>
						</div>

						{/* View Toggle */}
						<div className="flex gap-1 rounded-lg border border-light-300 p-1 dark:border-dark-400">
							<button
								onClick={() => setViewMode('detail')}
								className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
									viewMode === 'detail'
										? 'bg-blue-500 text-white dark:bg-blue-600'
										: 'text-neutral-600 hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-200'
								}`}
							>
								<TbLayoutGrid className="h-4 w-4" />
							</button>
							<button
								onClick={() => setViewMode('list')}
								className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
									viewMode === 'list'
										? 'bg-blue-500 text-white dark:bg-blue-600'
										: 'text-neutral-600 hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-200'
								}`}
							>
								<TbList className="h-4 w-4" />
							</button>
						</div>
					</div>

					{/* Habits List */}
					<HabitsList habits={habits} isLoading={isLoading} viewMode={viewMode} />
				</div>

				{/* Modals */}
				{isOpen && modalContentType === 'NEW_HABIT' && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
						<div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-dark-100">
							<NewHabitForm />
						</div>
					</div>
				)}
			</div>
		</>
	)
}
