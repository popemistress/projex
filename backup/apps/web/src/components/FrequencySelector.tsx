import { useState } from 'react'
import { HiX, HiCheck, HiChevronDown } from 'react-icons/hi'

interface FrequencySelectorProps {
	onSelect: (frequency: {
		type: string
		details: any
	}) => void
	onClose: () => void
	initialFrequency?: {
		type: string
		details: any
	}
}

type FrequencyType =
	| 'select_days'
	| 'every_few_days'
	| 'weekly'
	| 'times_per_week'
	| 'times_per_month'
	| 'times_per_year'
	| 'select_dates'
	| 'none'

const frequencyOptions = [
	{ value: 'select_days', label: 'Select Days' },
	{ value: 'every_few_days', label: 'Every few Days' },
	{ value: 'weekly', label: 'Weekly' },
	{ value: 'times_per_week', label: 'Times per Week' },
	{ value: 'times_per_month', label: 'Times per Month' },
	{ value: 'times_per_year', label: 'Times per Year' },
	{ value: 'select_dates', label: 'Select Dates' },
	{ value: 'none', label: 'None' },
]

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function FrequencySelector({
	onSelect,
	onClose,
	initialFrequency,
}: FrequencySelectorProps) {
	const [frequencyType, setFrequencyType] = useState<FrequencyType>(
		(initialFrequency?.type as FrequencyType) || 'select_days',
	)
	const [selectedDays, setSelectedDays] = useState<number[]>(
		initialFrequency?.details?.days || [0, 1, 2, 3, 4, 5, 6],
	)
	const [count, setCount] = useState(initialFrequency?.details?.count || 1)
	const [everyXDays, setEveryXDays] = useState(
		initialFrequency?.details?.everyXDays || 2,
	)
	const [selectedDates, setSelectedDates] = useState<number[]>(
		initialFrequency?.details?.dates || [],
	)
	const [excludedDates, setExcludedDates] = useState<string[]>(
		initialFrequency?.details?.excludedDates || [],
	)

	const toggleDay = (day: number) => {
		if (selectedDays.includes(day)) {
			setSelectedDays(selectedDays.filter((d) => d !== day))
		} else {
			setSelectedDays([...selectedDays, day].sort())
		}
	}

	const toggleDate = (date: number) => {
		if (selectedDates.includes(date)) {
			setSelectedDates(selectedDates.filter((d) => d !== date))
		} else {
			setSelectedDates([...selectedDates, date].sort())
		}
	}

	const handleConfirm = () => {
		let details: any = {}

		switch (frequencyType) {
			case 'select_days':
				details = { days: selectedDays, excludedDates }
				break
			case 'every_few_days':
				details = { everyXDays, excludedDates }
				break
			case 'weekly':
				details = {}
				break
			case 'times_per_week':
				details = { count, excludedDates }
				break
			case 'times_per_month':
				details = { count, excludedDates }
				break
			case 'times_per_year':
				details = { count, excludedDates }
				break
			case 'select_dates':
				details = { dates: selectedDates }
				break
			case 'none':
				details = {}
				break
		}

		onSelect({ type: frequencyType, details })
		onClose()
	}

	const getDescription = () => {
		switch (frequencyType) {
			case 'select_days':
				return 'This habit will be scheduled on the weekdays you have selected.'
			case 'every_few_days':
				return 'This habit will be scheduled once every few days.'
			case 'weekly':
				return 'This habit will be scheduled once a week and will cover the entire week, allowing you to start and complete it on different days.'
			case 'times_per_week':
				return "This habit will be scheduled daily for the entire week until you've completed it the specified times."
			case 'times_per_month':
				return "This habit will be scheduled daily for the entire month until you've completed it the specified times."
			case 'times_per_year':
				return "This habit will be scheduled daily for the entire year until you've completed it the specified times."
			case 'select_dates':
				return 'This habit will be scheduled on the dates you have selected.'
			case 'none':
				return 'This habit will not be scheduled automatically. However, you can manually add sessions from the Home screen.'
			default:
				return ''
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-100">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<button
						onClick={onClose}
						className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-200"
					>
						<HiX className="h-5 w-5" />
					</button>
					<h2 className="text-xl font-semibold text-neutral-900 dark:text-dark-1000">
						How often do you want to complete this habit?
					</h2>
					<button
						onClick={handleConfirm}
						className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-200"
					>
						<HiCheck className="h-5 w-5" />
					</button>
				</div>

				{/* Frequency Type Selector */}
				<div className="relative mb-6">
					<select
						value={frequencyType}
						onChange={(e) => setFrequencyType(e.target.value as FrequencyType)}
						className="w-full appearance-none rounded-xl border border-light-300 bg-white px-4 py-3 pr-10 text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000"
						style={{
							backgroundImage: 'none',
							WebkitAppearance: 'none',
							MozAppearance: 'none',
						}}
					>
						{frequencyOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<HiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
				</div>

				{/* Frequency-specific UI */}
				<div className="mb-6 space-y-4">
					{frequencyType === 'select_days' && (
						<>
							<div className="grid grid-cols-7 gap-2">
								{dayLabels.map((day, index) => (
									<button
										key={index}
										onClick={() => toggleDay(index)}
										className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium transition-all ${
											selectedDays.includes(index)
												? 'bg-blue-500 text-white'
												: 'bg-light-100 text-neutral-600 dark:bg-dark-200 dark:text-dark-700'
										}`}
									>
										{day}
									</button>
								))}
							</div>
							<div className="flex items-center justify-between rounded-xl bg-blue-500 px-4 py-3 text-white">
								<span>Every week</span>
								<button type="button" className="rounded-lg bg-white px-4 py-1 text-sm text-neutral-900 hover:bg-light-50">
									Change
								</button>
							</div>
						</>
					)}

					{frequencyType === 'every_few_days' && (
						<>
							<div className="flex items-center justify-between rounded-xl bg-blue-500 px-4 py-3 text-white">
								<span>Every {everyXDays} days</span>
								<button
									onClick={() =>
										setEveryXDays(everyXDays === 2 ? 3 : everyXDays === 3 ? 4 : 2)
									}
									className="rounded-lg bg-white px-4 py-1 text-sm text-neutral-900"
								>
									Change
								</button>
							</div>
							<div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 dark:bg-dark-50">
								<span className="text-neutral-900 dark:text-dark-1000">
									No dates excluded
								</span>
								<button className="rounded-lg bg-white px-4 py-1 text-sm text-neutral-900 dark:bg-dark-100">
									Change
								</button>
							</div>
						</>
					)}

					{frequencyType === 'weekly' && (
						<div className="flex items-center justify-between rounded-xl bg-blue-500 px-4 py-3 text-white">
							<span>Every week</span>
						</div>
					)}

					{(frequencyType === 'times_per_week' ||
						frequencyType === 'times_per_month' ||
						frequencyType === 'times_per_year') && (
						<>
							<div className="flex items-center justify-between rounded-xl bg-blue-500 px-4 py-3 text-white">
								<span>
									{count} {count === 1 ? 'time' : 'times'}
								</span>
								<button
									onClick={() => setCount(count + 1)}
									className="rounded-lg bg-white px-4 py-1 text-sm text-neutral-900"
								>
									Change
								</button>
							</div>
							<div className="flex items-center justify-between rounded-xl bg-blue-500 px-4 py-3 text-white">
								<span>
									Every{' '}
									{frequencyType === 'times_per_week'
										? 'week'
										: frequencyType === 'times_per_month'
										  ? 'month'
										  : 'year'}
								</span>
								<button className="rounded-lg bg-white px-4 py-1 text-sm text-neutral-900">
									Change
								</button>
							</div>
							<div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 dark:bg-dark-50">
								<span className="text-neutral-900 dark:text-dark-1000">
									No dates excluded
								</span>
								<button className="rounded-lg bg-white px-4 py-1 text-sm text-neutral-900 dark:bg-dark-100">
									Change
								</button>
							</div>
						</>
					)}

					{frequencyType === 'select_dates' && (
						<div className="grid grid-cols-7 gap-2">
							{Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
								<button
									key={date}
									onClick={() => toggleDate(date)}
									className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-medium transition-all ${
										selectedDates.includes(date)
											? 'bg-blue-500 text-white'
											: 'bg-light-100 text-neutral-600 dark:bg-dark-200 dark:text-dark-700'
									}`}
								>
									{date}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Description */}
				<p className="text-center text-sm text-neutral-600 dark:text-dark-700">
					{getDescription()}
				</p>
			</div>
		</div>
	)
}
