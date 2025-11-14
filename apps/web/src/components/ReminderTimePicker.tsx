import { useState, useRef, useEffect } from 'react'
import { HiX, HiCheck } from 'react-icons/hi'

interface ReminderTimePickerProps {
	onSelect: (time: string) => void
	onClose: () => void
	initialTime?: string | null
}

export function ReminderTimePicker({
	onSelect,
	onClose,
	initialTime = '08:00',
}: ReminderTimePickerProps) {
	const timeStr: string = initialTime || '08:00'
	const [hour, setHour] = useState(() => {
		const h = parseInt(timeStr.split(':')[0])
		return h % 12 || 12
	})
	const [minute, setMinute] = useState(() => {
		return parseInt(timeStr.split(':')[1])
	})
	const [period, setPeriod] = useState<'AM' | 'PM'>(() => {
		return parseInt(timeStr.split(':')[0]) >= 12 ? 'PM' : 'AM'
	})

	const hourRef = useRef<HTMLDivElement>(null)
	const minuteRef = useRef<HTMLDivElement>(null)
	const periodRef = useRef<HTMLDivElement>(null)

	const hours = Array.from({ length: 12 }, (_, i) => i + 1)
	const minutes = Array.from({ length: 60 }, (_, i) => i)
	const periods = ['AM', 'PM']

	useEffect(() => {
		// Scroll to selected values
		if (hourRef.current) {
			const selectedElement = hourRef.current.querySelector(
				'[data-selected="true"]',
			)
			if (selectedElement) {
				selectedElement.scrollIntoView({ block: 'center', behavior: 'auto' })
			}
		}
	}, [])

	const handleConfirm = () => {
		const hour24 = period === 'PM' ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour
		const timeString = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
		onSelect(timeString)
		onClose()
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-100">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<button
						onClick={onClose}
						className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-200"
					>
						<HiX className="h-5 w-5" />
					</button>
					<h2 className="text-xl font-semibold text-neutral-900 dark:text-dark-1000">
						Add Time
					</h2>
					<button
						onClick={handleConfirm}
						className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-200"
					>
						<HiCheck className="h-5 w-5" />
					</button>
				</div>

				{/* Time Picker */}
				<div className="relative mb-6 flex items-center justify-center gap-0">
					{/* Selection indicator background */}
					<div className="pointer-events-none absolute left-0 right-0 top-1/2 z-0 mx-auto h-12 w-[calc(100%-3rem)] -translate-y-1/2 rounded-full border-2 border-yellow-500" />
					
					{/* Hours */}
					<div
						ref={hourRef}
						className="relative h-48 w-24 overflow-y-auto scrollbar-hide"
						style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
					>
						<div className="py-[72px]">
							{hours.map((h) => (
								<button
									key={h}
									data-selected={h === hour}
									onClick={() => setHour(h)}
									className={`flex h-12 w-full items-center justify-center text-2xl font-medium transition-all ${
										h === hour
											? 'bg-blue-500 text-white'
											: 'text-neutral-400 hover:text-neutral-600 dark:text-dark-600 dark:hover:text-dark-800'
									}`}
								>
									{h}
								</button>
							))}
						</div>
					</div>

					{/* Separator */}
					<div className="z-20 flex h-12 items-center text-2xl font-semibold text-neutral-900 dark:text-dark-1000">
						:
					</div>

					{/* Minutes */}
					<div
						ref={minuteRef}
						className="relative h-48 w-24 overflow-y-auto scrollbar-hide"
						style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
					>
						<div className="py-[72px]">
							{minutes.map((m) => (
								<button
									key={m}
									data-selected={m === minute}
									onClick={() => setMinute(m)}
									className={`flex h-12 w-full items-center justify-center text-2xl font-medium transition-all ${
										m === minute
											? 'bg-blue-500 text-white'
											: 'text-neutral-400 hover:text-neutral-600 dark:text-dark-600 dark:hover:text-dark-800'
									}`}
								>
									{m.toString().padStart(2, '0')}
								</button>
							))}
						</div>
					</div>

					{/* Period */}
					<div
						ref={periodRef}
						className="relative h-48 w-24 overflow-y-auto scrollbar-hide"
						style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
					>
						<div className="py-[72px]">
							{periods.map((p) => (
								<button
									key={p}
									data-selected={p === period}
									onClick={() => setPeriod(p as 'AM' | 'PM')}
									className={`flex h-12 w-full items-center justify-center text-2xl font-medium transition-all ${
										p === period
											? 'bg-blue-500 text-white'
											: 'text-neutral-400 hover:text-neutral-600 dark:text-dark-600 dark:hover:text-dark-800'
									}`}
								>
									{p}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
