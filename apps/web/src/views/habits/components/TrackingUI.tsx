import { useState } from 'react'
import { HiOutlineCheckCircle, HiOutlinePlus, HiOutlineMinus, HiOutlinePlay, HiOutlinePause } from 'react-icons/hi2'

interface TrackingUIProps {
	habitId: string
	trackingType: 'task' | 'count' | 'time'
	currentCount?: number
	targetCount?: number
	unit?: string
	onComplete: (count: number) => void
	isPending: boolean
}

export function TrackingUI({
	habitId,
	trackingType,
	currentCount = 0,
	targetCount = 1,
	unit = 'times',
	onComplete,
	isPending,
}: TrackingUIProps) {
	const [count, setCount] = useState(currentCount)
	const [time, setTime] = useState(0)
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

	// Task-based tracking
	if (trackingType === 'task') {
		return (
			<button
				onClick={() => onComplete(1)}
				disabled={isPending}
				className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 transition-all hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/20 dark:hover:bg-green-900/30"
			>
				<HiOutlineCheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
			</button>
		)
	}

	// Count-based tracking
	if (trackingType === 'count') {
		const progress = targetCount ? (count / targetCount) * 100 : 0

		return (
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<button
						onClick={() => {
							const newCount = Math.max(0, count - 1)
							setCount(newCount)
						}}
						disabled={isPending || count === 0}
						className="flex h-10 w-10 items-center justify-center rounded-full bg-light-100 transition-all hover:bg-light-200 disabled:opacity-50 dark:bg-dark-200 dark:hover:bg-dark-300"
					>
						<HiOutlineMinus className="h-5 w-5 text-neutral-600 dark:text-dark-700" />
					</button>

					<div className="flex min-w-[100px] flex-col items-center">
						<div className="text-2xl font-bold text-neutral-900 dark:text-dark-1000">
							{count}/{targetCount}
						</div>
						<div className="text-xs text-neutral-600 dark:text-dark-700">
							{unit}
						</div>
					</div>

					<button
						onClick={() => {
							const newCount = count + 1
							setCount(newCount)
						}}
						disabled={isPending}
						className="flex h-10 w-10 items-center justify-center rounded-full bg-light-100 transition-all hover:bg-light-200 disabled:opacity-50 dark:bg-dark-200 dark:hover:bg-dark-300"
					>
						<HiOutlinePlus className="h-5 w-5 text-neutral-600 dark:text-dark-700" />
					</button>
				</div>

				{/* Progress Bar */}
				<div className="h-2 w-full overflow-hidden rounded-full bg-light-200 dark:bg-dark-200">
					<div
						className="h-full rounded-full bg-green-500 transition-all duration-300"
						style={{ width: `${Math.min(progress, 100)}%` }}
					/>
				</div>

				{/* Save Button */}
				{count !== currentCount && (
					<button
						onClick={() => onComplete(count)}
						disabled={isPending}
						className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
					>
						{isPending ? 'Saving...' : 'Save Progress'}
					</button>
				)}
			</div>
		)
	}

	// Time-based tracking
	if (trackingType === 'time') {
		const targetMinutes = targetCount || 30
		const minutes = Math.floor(time / 60)
		const seconds = time % 60
		const progress = (time / (targetMinutes * 60)) * 100

		const startTimer = () => {
			setIsTimerRunning(true)
			const interval = setInterval(() => {
				setTime((prev) => prev + 1)
			}, 1000)
			setTimerInterval(interval)
		}

		const stopTimer = () => {
			setIsTimerRunning(false)
			if (timerInterval) {
				clearInterval(timerInterval)
				setTimerInterval(null)
			}
		}

		const resetTimer = () => {
			stopTimer()
			setTime(0)
		}

		return (
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-center gap-4">
					{/* Timer Display */}
					<div className="flex flex-col items-center">
						<div className="text-3xl font-bold text-neutral-900 dark:text-dark-1000">
							{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
						</div>
						<div className="text-xs text-neutral-600 dark:text-dark-700">
							/ {targetMinutes} min
						</div>
					</div>

					{/* Controls */}
					<div className="flex gap-2">
						<button
							onClick={isTimerRunning ? stopTimer : startTimer}
							disabled={isPending}
							className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 transition-all hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
						>
							{isTimerRunning ? (
								<HiOutlinePause className="h-6 w-6 text-white" />
							) : (
								<HiOutlinePlay className="h-6 w-6 text-white" />
							)}
						</button>

						{time > 0 && (
							<button
								onClick={resetTimer}
								disabled={isPending}
								className="rounded-lg bg-light-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-light-200 disabled:opacity-50 dark:bg-dark-200 dark:text-dark-800 dark:hover:bg-dark-300"
							>
								Reset
							</button>
						)}
					</div>
				</div>

				{/* Progress Bar */}
				<div className="h-2 w-full overflow-hidden rounded-full bg-light-200 dark:bg-dark-200">
					<div
						className="h-full rounded-full bg-blue-500 transition-all duration-300"
						style={{ width: `${Math.min(progress, 100)}%` }}
					/>
				</div>

				{/* Save Button */}
				{time > 0 && !isTimerRunning && (
					<button
						onClick={() => {
							onComplete(time)
							resetTimer()
						}}
						disabled={isPending}
						className="w-full rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700"
					>
						{isPending ? 'Saving...' : 'Complete Session'}
					</button>
				)}
			</div>
		)
	}

	return null
}
