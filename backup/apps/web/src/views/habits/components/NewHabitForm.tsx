import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TbTarget, TbPlus, TbTrash } from 'react-icons/tb'

import Button from '~/components/Button'
import Input from '~/components/Input'
import Select from '~/components/Select'
import { IconPicker } from '~/components/IconPicker'
import { ColorPicker } from '~/components/ColorPicker'
import { FrequencySelector } from '~/components/FrequencySelector'
import { ReminderTimePicker } from '~/components/ReminderTimePicker'
import { useModal } from '~/providers/modal'
import { useWorkspace } from '~/providers/workspace'
import { api } from '~/utils/api'

const habitSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255),
	category: z.enum([
		'physical_mastery',
		'mental_mastery',
		'financial_mastery',
		'social_mastery',
		'spiritual_mastery',
		'other',
	]),
})

type HabitFormData = z.infer<typeof habitSchema>

export function NewHabitForm() {
	const { closeModal } = useModal()
	const { workspace } = useWorkspace()
	const utils = api.useUtils()
	
	// Modal states
	const [showIconPicker, setShowIconPicker] = useState(false)
	const [showColorPicker, setShowColorPicker] = useState(false)
	const [showFrequencySelector, setShowFrequencySelector] = useState(false)
	const [showReminderPicker, setShowReminderPicker] = useState(false)
	
	// Form data states
	const [selectedIcon, setSelectedIcon] = useState('TbTarget')
	const [selectedColor, setSelectedColor] = useState('#3B82F6')
	const [habitType, setHabitType] = useState<'build' | 'remove'>('build')
	const [trackingType, setTrackingType] = useState<'task' | 'count' | 'time'>('task')
	const [countValue, setCountValue] = useState(3)
	const [timeValue, setTimeValue] = useState('00:01:00')
	const [showCountInput, setShowCountInput] = useState(false)
	const [showTimeInput, setShowTimeInput] = useState(false)
	const [frequency, setFrequency] = useState({ type: 'select_days', details: { days: [0, 1, 2, 3, 4, 5, 6] } })
	const [reminders, setReminders] = useState<Array<{ time: string; enabled: boolean }>>([])
	const [scheduleStart, setScheduleStart] = useState(new Date().toISOString().split('T')[0])
	const [scheduleEnd, setScheduleEnd] = useState('')

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<HabitFormData>({
		resolver: zodResolver(habitSchema),
		defaultValues: {
			category: 'other',
		},
	})

	const createHabit = (api as any).habit.create.useMutation({
		onSuccess: () => {
			utils?.habit.getAllByWorkspace.invalidate()
			closeModal()
		},
	})

	const onSubmit = (data: HabitFormData) => {
		createHabit.mutate({
			workspacePublicId: workspace.publicId,
			...data,
			icon: selectedIcon,
			color: selectedColor,
			habitType,
			trackingType,
			frequency: frequency.type,
			frequencyDetails: frequency.details,
			reminders,
			scheduleStart,
			scheduleEnd: scheduleEnd || null,
		})
	}

	const addReminder = (time: string) => {
		setReminders([...reminders, { time, enabled: true }])
		setShowReminderPicker(false)
	}

	const removeReminder = (index: number) => {
		setReminders(reminders.filter((_, i) => i !== index))
	}

	const getFrequencyLabel = () => {
		switch (frequency.type) {
			case 'select_days':
				return 'Select Days'
			case 'every_few_days':
				return `Every ${(frequency.details as any).everyXDays || 2} days`
			case 'weekly':
				return 'Weekly'
			case 'times_per_week':
				return `${(frequency.details as any).count || 1} times per week`
			case 'times_per_month':
				return `${(frequency.details as any).count || 1} times per month`
			case 'times_per_year':
				return `${(frequency.details as any).count || 1} times per year`
			case 'select_dates':
				return 'Select Dates'
			case 'none':
				return 'None'
			default:
				return 'Select Frequency'
		}
	}

	return (
		<>
			<div className="max-h-[80vh] overflow-y-auto p-6">
				<h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-dark-1000">
					Create New Habit
				</h2>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Title */}
					<div>
						<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
							Title *
						</label>
						<Input {...register('title')} placeholder="Enter habit title" />
						{errors.title && (
							<p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
						)}
					</div>

					{/* Category */}
					<Select
						{...register('category')}
						label="Category *"
						error={errors.category?.message}
					>
						<option value="physical_mastery">Physical Mastery</option>
						<option value="mental_mastery">Mental Mastery</option>
						<option value="financial_mastery">Financial Mastery</option>
						<option value="social_mastery">Social Mastery</option>
						<option value="spiritual_mastery">Spiritual Mastery</option>
						<option value="other">Other</option>
					</Select>

					{/* Icon & Color */}
					<div className="grid grid-cols-2 gap-4">
						<button
							type="button"
							onClick={() => setShowIconPicker(true)}
							className="flex items-center gap-3 rounded-xl border border-light-300 bg-white p-4 transition-colors hover:bg-light-50 dark:border-dark-400 dark:bg-dark-100 dark:hover:bg-dark-50"
						>
							<div
								className="flex h-12 w-12 items-center justify-center rounded-xl"
								style={{ backgroundColor: `${selectedColor}40` }}
							>
								<TbTarget className="h-6 w-6" />
							</div>
							<span className="text-sm font-medium text-neutral-900 dark:text-dark-1000">
								Icon
							</span>
						</button>

						<button
							type="button"
							onClick={() => setShowColorPicker(true)}
							className="flex items-center gap-3 rounded-xl border border-light-300 bg-white p-4 transition-colors hover:bg-light-50 dark:border-dark-400 dark:bg-dark-100 dark:hover:bg-dark-50"
						>
							<div
								className="h-12 w-12 rounded-xl"
								style={{ backgroundColor: selectedColor }}
							/>
							<span className="text-sm font-medium text-neutral-900 dark:text-dark-1000">
								Color
							</span>
						</button>
					</div>

					{/* Habit Type */}
					<div>
						<label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-dark-800">
							Habit Type
						</label>
						<div className="grid grid-cols-2 gap-4">
							<button
								type="button"
								onClick={() => setHabitType('build')}
								className={`rounded-xl px-6 py-3 text-sm font-medium transition-all ${
									habitType === 'build'
										? 'bg-blue-500 text-white'
										: 'bg-white text-neutral-600 dark:bg-dark-100 dark:text-dark-700'
								}`}
							>
								Build
							</button>
							<button
								type="button"
								onClick={() => setHabitType('remove')}
								className={`rounded-xl px-6 py-3 text-sm font-medium transition-all ${
									habitType === 'remove'
										? 'bg-blue-500 text-white'
										: 'bg-white text-neutral-600 dark:bg-dark-100 dark:text-dark-700'
								}`}
							>
								Remove
							</button>
						</div>
						<p className="mt-2 text-xs text-neutral-600 dark:text-dark-700">
							{habitType === 'build'
								? 'Build a good habit, like exercising or reading a book.'
								: 'Get rid of a bad habit, like smoking or unhealthy eating.'}
						</p>
					</div>

					{/* Tracking Type */}
					<div>
						<label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-dark-800">
							Tracking Type
						</label>
						
						{/* Tracking Type Buttons */}
						<div className="mb-4 flex gap-3 rounded-2xl bg-light-100 p-2 dark:bg-dark-200">
							<button
								type="button"
								onClick={() => setTrackingType('task')}
								className={`flex-1 rounded-xl px-6 py-3 text-sm font-medium transition-all ${
									trackingType === 'task'
										? 'bg-blue-500 text-white shadow-md'
										: 'bg-transparent text-neutral-600 hover:bg-white/50 dark:text-dark-700'
								}`}
							>
								Task
							</button>
							<button
								type="button"
								onClick={() => setTrackingType('count')}
								className={`flex-1 rounded-xl px-6 py-3 text-sm font-medium transition-all ${
									trackingType === 'count'
										? 'bg-blue-500 text-white shadow-md'
										: 'bg-transparent text-neutral-600 hover:bg-white/50 dark:text-dark-700'
								}`}
							>
								Count
							</button>
							<button
								type="button"
								onClick={() => setTrackingType('time')}
								className={`flex-1 rounded-xl px-6 py-3 text-sm font-medium transition-all ${
									trackingType === 'time'
										? 'bg-blue-500 text-white shadow-md'
										: 'bg-transparent text-neutral-600 hover:bg-white/50 dark:text-dark-700'
								}`}
							>
								Time
							</button>
						</div>

						{/* Tracking Type Details */}
						{trackingType === 'task' && (
							<div className="rounded-xl bg-light-50 p-4 dark:bg-dark-200">
								<p className="text-sm text-neutral-600 dark:text-dark-700">
									A simple task that needs to be started or avoided.
								</p>
							</div>
						)}

						{trackingType === 'count' && (
							<div className="space-y-3">
								{showCountInput ? (
									<div className="flex items-center gap-3">
										<Input
											type="number"
											value={countValue.toString()}
											onChange={(e) => setCountValue(parseInt(e.target.value) || 1)}
											min={1}
											className="flex-1"
										/>
										<Button
											type="button"
											variant="primary"
											size="sm"
											onClick={() => setShowCountInput(false)}
										>
											Save
										</Button>
									</div>
								) : (
									<div className="flex items-center gap-3">
										<div className="flex-1 rounded-xl bg-blue-500 px-6 py-3 text-center text-sm font-medium text-white">
											{countValue} times
										</div>
										<button
											type="button"
											onClick={() => setShowCountInput(true)}
											className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-neutral-900 shadow-sm hover:bg-light-50 dark:bg-dark-100 dark:text-dark-1000"
										>
											Change
										</button>
									</div>
								)}
								<p className="text-sm text-neutral-600 dark:text-dark-700">
									Limit that needs counting, like max sweets per day.
								</p>
							</div>
						)}

						{trackingType === 'time' && (
							<div className="space-y-3">
								{showTimeInput ? (
									<div className="flex items-center gap-3">
										<Input
											type="time"
											value={timeValue}
											onChange={(e) => setTimeValue(e.target.value)}
											className="flex-1"
										/>
										<Button
											type="button"
											variant="primary"
											size="sm"
											onClick={() => setShowTimeInput(false)}
										>
											Save
										</Button>
									</div>
								) : (
									<div className="flex items-center gap-3">
										<div className="flex-1 rounded-xl bg-blue-500 px-6 py-3 text-center text-sm font-medium text-white">
											{timeValue}
										</div>
										<button
											type="button"
											onClick={() => setShowTimeInput(true)}
											className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-neutral-900 shadow-sm hover:bg-light-50 dark:bg-dark-100 dark:text-dark-1000"
										>
											Change
										</button>
									</div>
								)}
								<p className="text-sm text-neutral-600 dark:text-dark-700">
									Limit that is time-based, like max hours per day for social media.
								</p>
							</div>
						)}
					</div>

					{/* Frequency */}
					<div>
						<label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-dark-800">
							Frequency
						</label>
						<button
							type="button"
							onClick={() => setShowFrequencySelector(true)}
							className="w-full rounded-xl border border-light-300 bg-white px-4 py-3 text-left text-sm text-neutral-900 transition-colors hover:bg-light-50 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000 dark:hover:bg-dark-50"
						>
							{getFrequencyLabel()}
						</button>
					</div>

					{/* Reminders */}
					<div>
						<h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-dark-1000">
							Add reminders to ensure you never miss it
						</h3>
						<button
							type="button"
							onClick={() => setShowReminderPicker(true)}
							className="flex w-full items-center gap-2 rounded-xl border border-light-300 bg-white px-4 py-3 text-sm text-neutral-600 transition-colors hover:bg-light-50 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-700 dark:hover:bg-dark-50"
						>
							<TbPlus className="h-5 w-5" />
							Add reminder
						</button>
						{reminders.length > 0 && (
							<div className="mt-3 space-y-2">
								{reminders.map((reminder, index) => (
									<div
										key={index}
										className="flex items-center justify-between rounded-lg border border-light-300 bg-white px-4 py-2 dark:border-dark-400 dark:bg-dark-100"
									>
										<span className="text-sm text-neutral-900 dark:text-dark-1000">
											{reminder.time}
										</span>
										<button
											type="button"
											onClick={() => removeReminder(index)}
											className="text-red-600 hover:text-red-700"
										>
											<TbTrash className="h-4 w-4" />
										</button>
									</div>
								))}
							</div>
						)}
						<p className="mt-2 text-xs text-neutral-600 dark:text-dark-700">
							Remembering is a big part of doing.
						</p>
					</div>

					{/* Schedule */}
					<div>
						<h3 className="mb-3 text-sm font-medium text-neutral-700 dark:text-dark-800">
							Schedule
						</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between rounded-xl border border-light-300 bg-white px-4 py-3 dark:border-dark-400 dark:bg-dark-100">
								<span className="text-sm text-neutral-700 dark:text-dark-800">
									Start
								</span>
								<input
									type="date"
									value={scheduleStart}
									onChange={(e) => setScheduleStart(e.target.value)}
									className="text-sm text-neutral-600 dark:text-dark-700"
								/>
							</div>
							<div className="flex items-center justify-between rounded-xl border border-light-300 bg-white px-4 py-3 dark:border-dark-400 dark:bg-dark-100">
								<span className="text-sm text-neutral-700 dark:text-dark-800">
									End
								</span>
								<input
									type="date"
									value={scheduleEnd}
									onChange={(e) => setScheduleEnd(e.target.value)}
									placeholder="Never"
									className="text-sm text-neutral-600 dark:text-dark-700"
								/>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="secondary"
							onClick={closeModal}
							disabled={createHabit.isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="primary"
							disabled={createHabit.isPending}
						>
							{createHabit.isPending ? 'Creating...' : 'Create Habit'}
						</Button>
					</div>
				</form>
			</div>

			{/* Modals */}
			{showIconPicker && (
				<IconPicker
					selectedIcon={selectedIcon}
					selectedColor={selectedColor}
					onSelect={(icon) => {
						setSelectedIcon(icon)
						setShowIconPicker(false)
					}}
					onClose={() => setShowIconPicker(false)}
				/>
			)}

			{showColorPicker && (
				<ColorPicker
					selectedColor={selectedColor}
					selectedIcon={selectedIcon}
					onSelect={(color) => {
						setSelectedColor(color)
						setShowColorPicker(false)
					}}
					onClose={() => setShowColorPicker(false)}
				/>
			)}

			{showFrequencySelector && (
				<FrequencySelector
					initialFrequency={frequency}
					onSelect={(freq) => {
						setFrequency(freq)
						setShowFrequencySelector(false)
					}}
					onClose={() => setShowFrequencySelector(false)}
				/>
			)}

			{showReminderPicker && (
				<ReminderTimePicker
					onSelect={addReminder}
					onClose={() => setShowReminderPicker(false)}
				/>
			)}
		</>
	)
}
