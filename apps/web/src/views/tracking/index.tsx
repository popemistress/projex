'use client'

import { useState, useEffect } from 'react'
import {
	HiOutlinePlay,
	HiOutlineStop,
	HiOutlineClock,
	HiOutlineCalendar,
	HiOutlineChartBar,
} from 'react-icons/hi2'

import { authClient } from '@kan/auth/client'

import Button from '~/components/Button'
import { PageHead } from '~/components/PageHead'
import LoadingSpinner from '~/components/LoadingSpinner'
import { useWorkspace } from '~/providers/workspace'
import { api } from '~/utils/api'

export default function TrackingView() {
	const { workspace } = useWorkspace()
	const { data: session } = authClient.useSession()
	const [elapsedSeconds, setElapsedSeconds] = useState(0)
	const [description, setDescription] = useState('')
	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split('T')[0],
	)

	// Check if timeTracking API is available
	const hasTimeTrackingAPI = typeof (api as any).timeTracking !== 'undefined'

	const utils = hasTimeTrackingAPI ? api.useUtils() : null

	const { data: activeEntry, isLoading: activeLoading } = hasTimeTrackingAPI
		? (api as any).timeTracking.getActiveTimeEntry.useQuery(
				{ workspacePublicId: workspace.publicId },
				{ refetchInterval: 1000 },
		  )
		: { data: null, isLoading: false }

	const { data: timeEntries, isLoading: entriesLoading } = hasTimeTrackingAPI
		? (api as any).timeTracking.getTimeEntriesByDateRange.useQuery({
				workspacePublicId: workspace.publicId,
				startDate: new Date(selectedDate || new Date().toISOString().split('T')[0]!),
				endDate: new Date(
					new Date(selectedDate || new Date().toISOString().split('T')[0]!).getTime() +
						24 * 60 * 60 * 1000,
				),
		  })
		: { data: null, isLoading: false }

	const startTimer = hasTimeTrackingAPI
		? (api as any).timeTracking.startTimeEntry.useMutation({
				onSuccess: () => {
					utils?.timeTracking.getActiveTimeEntry.invalidate()
					setDescription('')
				},
		  })
		: { mutate: () => {}, isPending: false }

	const stopTimer = hasTimeTrackingAPI
		? (api as any).timeTracking.stopTimeEntry.useMutation({
				onSuccess: () => {
					utils?.timeTracking.getActiveTimeEntry.invalidate()
					utils?.timeTracking.getTimeEntriesByDateRange.invalidate()
					setElapsedSeconds(0)
				},
		  })
		: { mutate: () => {}, isPending: false }

	const deleteEntry = hasTimeTrackingAPI
		? (api as any).timeTracking.deleteTimeEntry.useMutation({
				onSuccess: () => {
					utils?.timeTracking.getTimeEntriesByDateRange.invalidate()
				},
		  })
		: { mutate: () => {}, isPending: false }

	useEffect(() => {
		if (activeEntry) {
			const startTime = new Date(activeEntry.startTime).getTime()
			const updateElapsed = () => {
				const now = Date.now()
				setElapsedSeconds(Math.floor((now - startTime) / 1000))
			}
			updateElapsed()
			const interval = setInterval(updateElapsed, 1000)
			return () => clearInterval(interval)
		} else {
			setElapsedSeconds(0)
		}
	}, [activeEntry])

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const secs = seconds % 60
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}

	const formatDuration = (startTime: string, endTime?: string) => {
		const start = new Date(startTime).getTime()
		const end = endTime ? new Date(endTime).getTime() : Date.now()
		const seconds = Math.floor((end - start) / 1000)
		return formatTime(seconds)
	}

	const totalTimeToday =
		timeEntries?.reduce((sum: number, entry: any) => {
			const start = new Date(entry.startTime).getTime()
			const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
			return sum + Math.floor((end - start) / 1000)
		}, 0) || 0

	return (
		<>
			<PageHead title={`Time Tracking | ${workspace.name ?? 'Workspace'}`} />
			<div className="h-full w-full overflow-auto bg-light-50 dark:bg-dark-50">
				{/* Header */}
				<div className="border-b border-light-300 bg-white px-8 py-6 dark:border-dark-400 dark:bg-dark-100">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-neutral-900 dark:text-dark-1000">
								Time Tracking
							</h1>
							<p className="mt-1 text-sm text-neutral-600 dark:text-dark-700">
								Track your time and manage your productivity
							</p>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="mx-auto max-w-[1200px] p-8">
					{/* Timer Widget */}
					<div className="mb-8 rounded-lg border border-light-300 bg-white p-8 dark:border-dark-400 dark:bg-dark-100">
						<div className="flex flex-col items-center gap-6">
							<div className="flex items-center gap-3">
								<HiOutlineClock className="h-8 w-8 text-neutral-600 dark:text-dark-700" />
								<span className="font-mono text-6xl font-bold text-neutral-900 dark:text-dark-1000">
									{formatTime(elapsedSeconds)}
								</span>
							</div>

							{activeEntry ? (
								<>
									<p className="text-sm text-neutral-600 dark:text-dark-700">
										{activeEntry.description || 'No description'}
									</p>
									<Button
										variant="danger"
										size="lg"
										onClick={() =>
											stopTimer.mutate({ publicId: activeEntry.publicId })
										}
										disabled={stopTimer.isPending}
									>
										<HiOutlineStop className="mr-2 h-5 w-5" />
										Stop Timer
									</Button>
								</>
							) : (
								<>
									<input
										type="text"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="What are you working on?"
										className="w-full max-w-md rounded-lg border border-light-300 bg-white px-4 py-2 text-center text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000 dark:placeholder-dark-600"
									/>
									<Button
										variant="primary"
										size="lg"
										onClick={() =>
											startTimer.mutate({
												workspacePublicId: workspace.publicId,
												type: 'other',
												description: description || undefined,
											})
										}
										disabled={startTimer.isPending}
									>
										<HiOutlinePlay className="mr-2 h-5 w-5" />
										Start Timer
									</Button>
								</>
							)}
						</div>
					</div>

					{/* Stats */}
					<div className="mb-8 grid gap-4 sm:grid-cols-3">
						<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
							<p className="text-sm font-medium text-neutral-600 dark:text-dark-700">
								Today's Total
							</p>
							<p className="mt-2 font-mono text-3xl font-bold text-neutral-900 dark:text-dark-1000">
								{formatTime(totalTimeToday)}
							</p>
						</div>
						<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
							<p className="text-sm font-medium text-neutral-600 dark:text-dark-700">
								Entries Today
							</p>
							<p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-dark-1000">
								{timeEntries?.length || 0}
							</p>
						</div>
						<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
							<p className="text-sm font-medium text-neutral-600 dark:text-dark-700">
								Status
							</p>
							<p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-dark-1000">
								{activeEntry ? (
									<span className="text-green-600 dark:text-green-400">
										Active
									</span>
								) : (
									<span className="text-neutral-400 dark:text-dark-600">
										Idle
									</span>
								)}
							</p>
						</div>
					</div>

					{/* Date Selector */}
					<div className="mb-4 flex items-center gap-4">
						<HiOutlineCalendar className="h-5 w-5 text-neutral-600 dark:text-dark-700" />
						<input
							type="date"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							className="rounded-lg border border-light-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000"
						/>
					</div>

					{/* Time Entries List */}
					<div className="rounded-lg border border-light-300 bg-white dark:border-dark-400 dark:bg-dark-100">
						<div className="border-b border-light-300 px-6 py-4 dark:border-dark-400">
							<h2 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
								Time Entries
							</h2>
						</div>
						<div className="p-6">
							{entriesLoading ? (
								<div className="flex h-32 items-center justify-center">
									<LoadingSpinner />
								</div>
							) : timeEntries && timeEntries.length > 0 ? (
								<div className="space-y-3">
									{timeEntries.map((entry: any) => (
										<div
											key={entry.publicId}
											className="flex items-center justify-between rounded-lg border border-light-300 p-4 dark:border-dark-400"
										>
											<div className="flex-1">
												<p className="font-medium text-neutral-900 dark:text-dark-1000">
													{entry.description || 'No description'}
												</p>
												<p className="text-sm text-neutral-600 dark:text-dark-700">
													{new Date(entry.startTime).toLocaleTimeString()} -{' '}
													{entry.endTime
														? new Date(entry.endTime).toLocaleTimeString()
														: 'In progress'}
												</p>
											</div>
											<div className="flex items-center gap-4">
												<span className="font-mono text-lg font-bold text-neutral-900 dark:text-dark-1000">
													{formatDuration(entry.startTime, entry.endTime)}
												</span>
												<button
													onClick={() =>
														deleteEntry.mutate({ publicId: entry.publicId })
													}
													disabled={deleteEntry.isPending}
													className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
												>
													Delete
												</button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="flex h-32 flex-col items-center justify-center text-neutral-500 dark:text-dark-600">
									<HiOutlineClock className="mb-2 h-12 w-12" />
									<p>No time entries for this date</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
