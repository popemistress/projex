'use client'

import { useState } from 'react'
import {
	HiOutlineChartBar,
	HiOutlineCheckCircle,
	HiOutlineClock,
	HiOutlineSquare3Stack3D,
	HiOutlineUsers,
	HiOutlineFire,
	HiOutlineArrowTrendingUp,
} from 'react-icons/hi2'
import { TbTarget } from 'react-icons/tb'

import { authClient } from '@kan/auth/client'

import { PageHead } from '~/components/PageHead'
import LoadingSpinner from '~/components/LoadingSpinner'
import { useWorkspace } from '~/providers/workspace'
import { api } from '~/utils/api'

export default function DashboardView() {
	const { workspace } = useWorkspace()
	const { data: session } = authClient.useSession()
	const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')

	// Check if APIs are available
	const hasGoalAPI = typeof (api as any).goal !== 'undefined'
	const hasHabitAPI = typeof (api as any).habit !== 'undefined'

	// Fetch all data
	const { data: goals, isLoading: goalsLoading } = hasGoalAPI
		? (api as any).goal.getAllByWorkspace.useQuery({
				workspacePublicId: workspace.publicId,
		  })
		: { data: null, isLoading: false }

	const { data: habits, isLoading: habitsLoading } = hasHabitAPI
		? (api as any).habit.getAllByWorkspace.useQuery({
				workspacePublicId: workspace.publicId,
		  })
		: { data: null, isLoading: false }

	const { data: boards, isLoading: boardsLoading } = api.board.all.useQuery({
		workspacePublicId: workspace.publicId,
	})

	const { data: workspaceData, isLoading: workspaceLoading } = api.workspace.byId.useQuery({
		workspacePublicId: workspace.publicId,
	})

	const isLoading = goalsLoading || habitsLoading || boardsLoading || workspaceLoading

	// Calculate statistics
	const goalsStats = {
		total: goals?.length || 0,
		active: goals?.filter((g: any) => g.status === 'in_progress').length || 0,
		completed: goals?.filter((g: any) => g.status === 'completed').length || 0,
		avgProgress: goals?.length
			? Math.round(goals.reduce((sum: number, g: any) => sum + g.progress, 0) / goals.length)
			: 0,
	}

	const habitsStats = {
		total: habits?.length || 0,
		active: habits?.filter((h: any) => h.status === 'active').length || 0,
		avgStreak: habits?.length
			? Math.round(habits.reduce((sum: number, h: any) => sum + h.streakCount, 0) / habits.length)
			: 0,
		totalCompletions: habits?.reduce((sum: number, h: any) => sum + h.totalCompletions, 0) || 0,
	}

	const boardsStats = {
		total: boards?.length || 0,
		totalLists: boards?.reduce((sum: number, b: any) => sum + (b.lists?.length || 0), 0) || 0,
		totalCards: boards?.reduce(
			(sum: number, b: any) =>
				sum + (b.lists?.reduce((s: number, l: any) => s + (l.cards?.length || 0), 0) || 0),
			0,
		) || 0,
	}

	const workspaceStats = {
		members: workspaceData?.members?.length || 0,
		name: workspace.name,
	}

	const statCards = [
		{
			title: 'Goals',
			value: goalsStats.total,
			subtitle: `${goalsStats.active} active`,
			icon: TbTarget,
			color: 'text-blue-600 dark:text-blue-400',
			bgColor: 'bg-blue-100 dark:bg-blue-900/20',
			trend: `${goalsStats.avgProgress}% avg progress`,
		},
		{
			title: 'Habits',
			value: habitsStats.total,
			subtitle: `${habitsStats.active} active`,
			icon: HiOutlineCheckCircle,
			color: 'text-green-600 dark:text-green-400',
			bgColor: 'bg-green-100 dark:bg-green-900/20',
			trend: `${habitsStats.avgStreak} day avg streak`,
		},
		{
			title: 'Boards',
			value: boardsStats.total,
			subtitle: `${boardsStats.totalCards} cards`,
			icon: HiOutlineSquare3Stack3D,
			color: 'text-purple-600 dark:text-purple-400',
			bgColor: 'bg-purple-100 dark:bg-purple-900/20',
			trend: `${boardsStats.totalLists} lists`,
		},
		{
			title: 'Team',
			value: workspaceStats.members,
			subtitle: 'members',
			icon: HiOutlineUsers,
			color: 'text-orange-600 dark:text-orange-400',
			bgColor: 'bg-orange-100 dark:bg-orange-900/20',
			trend: workspaceStats.name,
		},
	]

	return (
		<>
			<PageHead title={`Dashboard | ${workspace.name ?? 'Workspace'}`} />
			<div className="h-full w-full overflow-auto bg-light-50 dark:bg-dark-50">
				{/* Header */}
				<div className="border-b border-light-300 bg-white px-8 py-6 dark:border-dark-400 dark:bg-dark-100">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-neutral-900 dark:text-dark-1000">
								Dashboard
							</h1>
							<p className="mt-1 text-sm text-neutral-600 dark:text-dark-700">
								Overview of your workspace, goals, habits, and progress
							</p>
						</div>
						<div className="flex gap-2">
							<button
								onClick={() => setTimeRange('week')}
								className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
									timeRange === 'week'
										? 'bg-blue-500 text-white'
										: 'bg-light-200 text-neutral-700 hover:bg-light-300 dark:bg-dark-200 dark:text-dark-900 dark:hover:bg-dark-300'
								}`}
							>
								Week
							</button>
							<button
								onClick={() => setTimeRange('month')}
								className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
									timeRange === 'month'
										? 'bg-blue-500 text-white'
										: 'bg-light-200 text-neutral-700 hover:bg-light-300 dark:bg-dark-200 dark:text-dark-900 dark:hover:bg-dark-300'
								}`}
							>
								Month
							</button>
							<button
								onClick={() => setTimeRange('year')}
								className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
									timeRange === 'year'
										? 'bg-blue-500 text-white'
										: 'bg-light-200 text-neutral-700 hover:bg-light-300 dark:bg-dark-200 dark:text-dark-900 dark:hover:bg-dark-300'
								}`}
							>
								Year
							</button>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="mx-auto max-w-[1600px] p-8">
					{isLoading ? (
						<div className="flex h-64 items-center justify-center">
							<LoadingSpinner />
						</div>
					) : (
						<>
							{/* Stats Grid */}
							<div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
								{statCards.map((stat) => (
									<div
										key={stat.title}
										className="rounded-lg border border-light-300 bg-white p-6 transition-all hover:shadow-md dark:border-dark-400 dark:bg-dark-100"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<p className="text-sm font-medium text-neutral-600 dark:text-dark-700">
													{stat.title}
												</p>
												<p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-dark-1000">
													{stat.value}
												</p>
												<p className="mt-1 text-sm text-neutral-500 dark:text-dark-600">
													{stat.subtitle}
												</p>
												<div className="mt-3 flex items-center gap-1 text-xs text-neutral-600 dark:text-dark-700">
													<HiOutlineArrowTrendingUp className="h-3 w-3" />
													{stat.trend}
												</div>
											</div>
											<div className={`rounded-lg p-3 ${stat.bgColor}`}>
												<stat.icon className={`h-6 w-6 ${stat.color}`} />
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Goals Overview */}
							<div className="mb-8 rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
								<div className="mb-4 flex items-center justify-between">
									<h2 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
										Goals Overview
									</h2>
									<a
										href="/goals"
										className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
									>
										View all →
									</a>
								</div>
								<div className="grid gap-4 sm:grid-cols-3">
									<div className="rounded-lg bg-light-50 p-4 dark:bg-dark-50">
										<p className="text-sm text-neutral-600 dark:text-dark-700">
											Total Goals
										</p>
										<p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-dark-1000">
											{goalsStats.total}
										</p>
									</div>
									<div className="rounded-lg bg-light-50 p-4 dark:bg-dark-50">
										<p className="text-sm text-neutral-600 dark:text-dark-700">
											In Progress
										</p>
										<p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
											{goalsStats.active}
										</p>
									</div>
									<div className="rounded-lg bg-light-50 p-4 dark:bg-dark-50">
										<p className="text-sm text-neutral-600 dark:text-dark-700">
											Completed
										</p>
										<p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
											{goalsStats.completed}
										</p>
									</div>
								</div>
								{goals && goals.length > 0 && (
									<div className="mt-4">
										<p className="mb-2 text-sm font-medium text-neutral-700 dark:text-dark-800">
											Recent Goals
										</p>
										<div className="space-y-2">
											{goals.slice(0, 3).map((goal: any) => (
												<a
													key={goal.publicId}
													href={`/goals/${goal.publicId}`}
													className="flex items-center justify-between rounded-lg border border-light-300 p-3 transition-colors hover:bg-light-50 dark:border-dark-400 dark:hover:bg-dark-50"
												>
													<div className="flex-1">
														<p className="font-medium text-neutral-900 dark:text-dark-1000">
															{goal.title}
														</p>
														<p className="text-xs text-neutral-600 dark:text-dark-700">
															{goal.goalType} • {goal.status}
														</p>
													</div>
													<div className="ml-4 flex items-center gap-2">
														<div className="h-2 w-24 overflow-hidden rounded-full bg-light-300 dark:bg-dark-400">
															<div
																className="h-full bg-blue-500"
																style={{ width: `${goal.progress}%` }}
															/>
														</div>
														<span className="text-sm font-medium text-neutral-700 dark:text-dark-800">
															{goal.progress}%
														</span>
													</div>
												</a>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Habits Overview */}
							<div className="mb-8 rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
								<div className="mb-4 flex items-center justify-between">
									<h2 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
										Habits Overview
									</h2>
									<a
										href="/habits"
										className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
									>
										View all →
									</a>
								</div>
								<div className="grid gap-4 sm:grid-cols-3">
									<div className="rounded-lg bg-light-50 p-4 dark:bg-dark-50">
										<p className="text-sm text-neutral-600 dark:text-dark-700">
											Active Habits
										</p>
										<p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-dark-1000">
											{habitsStats.active}
										</p>
									</div>
									<div className="rounded-lg bg-light-50 p-4 dark:bg-dark-50">
										<p className="text-sm text-neutral-600 dark:text-dark-700">
											Avg Streak
										</p>
										<p className="mt-1 flex items-center gap-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
											<HiOutlineFire className="h-6 w-6" />
											{habitsStats.avgStreak}
										</p>
									</div>
									<div className="rounded-lg bg-light-50 p-4 dark:bg-dark-50">
										<p className="text-sm text-neutral-600 dark:text-dark-700">
											Total Completions
										</p>
										<p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
											{habitsStats.totalCompletions}
										</p>
									</div>
								</div>
								{habits && habits.length > 0 && (
									<div className="mt-4">
										<p className="mb-2 text-sm font-medium text-neutral-700 dark:text-dark-800">
											Top Habits
										</p>
										<div className="space-y-2">
											{habits
												.sort((a: any, b: any) => b.streakCount - a.streakCount)
												.slice(0, 3)
												.map((habit: any) => (
													<a
														key={habit.publicId}
														href={`/habits/${habit.publicId}`}
														className="flex items-center justify-between rounded-lg border border-light-300 p-3 transition-colors hover:bg-light-50 dark:border-dark-400 dark:hover:bg-dark-50"
													>
														<div className="flex items-center gap-3">
															{habit.icon && (
																<span className="text-2xl">{habit.icon}</span>
															)}
															<div>
																<p className="font-medium text-neutral-900 dark:text-dark-1000">
																	{habit.title}
																</p>
																<p className="text-xs text-neutral-600 dark:text-dark-700">
																	{habit.category} • {habit.frequency}
																</p>
															</div>
														</div>
														<div className="flex items-center gap-2">
															<HiOutlineFire className="h-5 w-5 text-orange-500" />
															<span className="text-lg font-bold text-neutral-900 dark:text-dark-1000">
																{habit.streakCount}
															</span>
														</div>
													</a>
												))}
										</div>
									</div>
								)}
							</div>

							{/* Boards Overview */}
							<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
								<div className="mb-4 flex items-center justify-between">
									<h2 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
										Boards Overview
									</h2>
									<a
										href="/boards/list"
										className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
									>
										View all →
									</a>
								</div>
								<div className="grid gap-4 sm:grid-cols-3">
									<div className="rounded-lg bg-light-50 p-4 dark:bg-dark-50">
										<p className="text-sm text-neutral-600 dark:text-dark-700">
											Total Boards
										</p>
										<p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-dark-1000">
											{boardsStats.total}
										</p>
									</div>
									<div className="rounded-lg bg-light-50 p-4 dark:bg-dark-50">
										<p className="text-sm text-neutral-600 dark:text-dark-700">
											Total Lists
										</p>
										<p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
											{boardsStats.totalLists}
										</p>
									</div>
									<div className="rounded-lg bg-light-50 p-4 dark:bg-dark-50">
										<p className="text-sm text-neutral-600 dark:text-dark-700">
											Total Cards
										</p>
										<p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
											{boardsStats.totalCards}
										</p>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	)
}
