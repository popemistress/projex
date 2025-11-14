import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Button from '~/components/Button'
import Input from '~/components/Input'
import Select from '~/components/Select'
import { useModal } from '~/providers/modal'
import { api } from '~/utils/api'

const goalSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255),
	description: z.string().max(10000).optional(),
	goalType: z.enum([
		'personal',
		'professional',
		'health',
		'finance',
		'learning',
		'relationships',
		'creativity',
		'other',
	]),
	timeframe: z.enum([
		'daily',
		'weekly',
		'monthly',
		'quarterly',
		'yearly',
		'long_term',
	]),
	priority: z.enum(['critical', 'high', 'medium', 'low']),
	status: z.enum([
		'not_started',
		'in_progress',
		'completed',
		'on_hold',
		'abandoned',
	]),
	progress: z.number().min(0).max(100),
	startDate: z.string().optional(),
	targetDate: z.string().optional(),
	tags: z.array(z.string()).optional(),
})

type GoalFormData = z.infer<typeof goalSchema>

interface EditGoalFormProps {
	goal: any
}

export function EditGoalForm({ goal }: EditGoalFormProps) {
	const { closeModal } = useModal()
	const utils = api.useUtils()
	const [tags, setTags] = useState<string[]>(goal.tags || [])
	const [tagInput, setTagInput] = useState('')

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<GoalFormData>({
		resolver: zodResolver(goalSchema),
		defaultValues: {
			title: goal.title,
			description: goal.description || '',
			goalType: goal.goalType,
			timeframe: goal.timeframe,
			priority: goal.priority,
			status: goal.status,
			progress: goal.progress,
			startDate: goal.startDate
				? new Date(goal.startDate).toISOString().split('T')[0]
				: '',
			targetDate: goal.targetDate
				? new Date(goal.targetDate).toISOString().split('T')[0]
				: '',
		},
	})

	const updateGoal = api.goal.update.useMutation({
		onSuccess: () => {
			utils.goal.getByPublicId.invalidate({ publicId: goal.publicId })
			utils.goal.getAllByWorkspace.invalidate()
			closeModal()
		},
	})

	const onSubmit = (data: GoalFormData) => {
		updateGoal.mutate({
			publicId: goal.publicId,
			...data,
			tags,
		})
	}

	const addTag = () => {
		if (tagInput.trim() && !tags.includes(tagInput.trim())) {
			setTags([...tags, tagInput.trim()])
			setTagInput('')
		}
	}

	const removeTag = (tag: string) => {
		setTags(tags.filter((t) => t !== tag))
	}

	return (
		<div className="p-6">
			<h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-dark-1000">
				Edit Goal
			</h2>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div>
					<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
						Title *
					</label>
					<Input {...register('title')} placeholder="Enter goal title" />
					{errors.title && (
						<p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
					)}
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
						Description
					</label>
					<textarea
						{...register('description')}
						rows={3}
						className="w-full rounded-lg border border-light-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000 dark:placeholder-dark-600"
						placeholder="Describe your goal..."
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Select
						{...register('goalType')}
						label="Type *"
						error={errors.goalType?.message}
					>
						<option value="personal">Personal</option>
						<option value="professional">Professional</option>
						<option value="health">Health</option>
						<option value="finance">Finance</option>
						<option value="learning">Learning</option>
						<option value="relationships">Relationships</option>
						<option value="creativity">Creativity</option>
						<option value="other">Other</option>
					</Select>

					<Select
						{...register('timeframe')}
						label="Timeframe *"
						error={errors.timeframe?.message}
					>
						<option value="daily">Daily</option>
						<option value="weekly">Weekly</option>
						<option value="monthly">Monthly</option>
						<option value="quarterly">Quarterly</option>
						<option value="yearly">Yearly</option>
						<option value="long_term">Long Term</option>
					</Select>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Select
						{...register('priority')}
						label="Priority *"
						error={errors.priority?.message}
					>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
						<option value="critical">Critical</option>
					</Select>

					<Select
						{...register('status')}
						label="Status *"
						error={errors.status?.message}
					>
						<option value="not_started">Not Started</option>
						<option value="in_progress">In Progress</option>
						<option value="completed">Completed</option>
						<option value="on_hold">On Hold</option>
						<option value="abandoned">Abandoned</option>
					</Select>
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
						Progress (0-100)
					</label>
					<Input
						{...register('progress', { valueAsNumber: true })}
						type="number"
						min="0"
						max="100"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
							Start Date
						</label>
						<Input {...register('startDate')} type="date" />
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
							Target Date
						</label>
						<Input {...register('targetDate')} type="date" />
					</div>
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
						Tags
					</label>
					<div className="flex gap-2">
						<Input
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							onKeyPress={(e) =>
								e.key === 'Enter' && (e.preventDefault(), addTag())
							}
							placeholder="Add a tag..."
						/>
						<Button type="button" variant="secondary" onClick={addTag}>
							Add
						</Button>
					</div>
					{tags.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-2">
							{tags.map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
								>
									{tag}
									<button
										type="button"
										onClick={() => removeTag(tag)}
										className="hover:text-blue-900 dark:hover:text-blue-300"
									>
										×
									</button>
								</span>
							))}
						</div>
					)}
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<Button
						type="button"
						variant="secondary"
						onClick={closeModal}
						disabled={updateGoal.isPending}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="primary"
						disabled={updateGoal.isPending}
					>
						{updateGoal.isPending ? 'Updating...' : 'Update Goal'}
					</Button>
				</div>
			</form>
		</div>
	)
}
