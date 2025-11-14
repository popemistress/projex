import { useState, useEffect } from 'react'
import { HiOutlinePlay, HiOutlineStop, HiOutlineClock } from 'react-icons/hi2'
import Button from './Button'
import { useWorkspace } from '~/providers/workspace'
import { api } from '~/utils/api'

export function TimeTracker() {
	const { workspace } = useWorkspace()
	const [elapsedSeconds, setElapsedSeconds] = useState(0)

	const { data: activeEntry } = api.timeTracking.getActiveTimeEntry.useQuery(
		{ workspacePublicId: workspace.publicId },
		{ refetchInterval: 1000 },
	)

	const startTimer = api.timeTracking.startTimeEntry.useMutation({
		onSuccess: () => {
			utils.timeTracking.getActiveTimeEntry.invalidate()
		},
	})

	const stopTimer = api.timeTracking.stopTimeEntry.useMutation({
		onSuccess: () => {
			utils.timeTracking.getActiveTimeEntry.invalidate()
			setElapsedSeconds(0)
		},
	})

	const utils = api.useUtils()

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

	return (
		<div className="fixed bottom-4 right-4 z-50 rounded-lg border border-light-300 bg-white p-4 shadow-lg dark:border-dark-400 dark:bg-dark-100">
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<HiOutlineClock className="h-5 w-5 text-neutral-600 dark:text-dark-700" />
					<span className="text-2xl font-mono font-bold text-neutral-900 dark:text-dark-1000">
						{formatTime(elapsedSeconds)}
					</span>
				</div>
				{activeEntry ? (
					<Button
						variant="danger"
						size="sm"
						onClick={() => stopTimer.mutate({ publicId: activeEntry.publicId })}
						disabled={stopTimer.isPending}
					>
						<HiOutlineStop className="h-4 w-4" />
						Stop
					</Button>
				) : (
					<Button
						variant="primary"
						size="sm"
						onClick={() =>
							startTimer.mutate({
								workspacePublicId: workspace.publicId,
								type: 'other',
							})
						}
						disabled={startTimer.isPending}
					>
						<HiOutlinePlay className="h-4 w-4" />
						Start
					</Button>
				)}
			</div>
			{activeEntry?.description && (
				<p className="mt-2 text-xs text-neutral-600 dark:text-dark-700">
					{activeEntry.description}
				</p>
			)}
		</div>
	)
}
