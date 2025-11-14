import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import Button from '~/components/Button'
import Input from '~/components/Input'
import Select from '~/components/Select'
import { useModal } from '~/providers/modal'
import { useWorkspace } from '~/providers/workspace'
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
	startDate: z.string().optional(),
	targetDate: z.string().optional(),
	tags: z.array(z.string()).optional(),
})

type GoalFormData = z.infer<typeof goalSchema>

export function NewGoalForm() {
	const { closeModal } = useModal()
	const { workspace } = useWorkspace()
	const utils = api.useUtils()
	const [tags, setTags] = useState<string[]>([])
	const [tagInput, setTagInput] = useState('')

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<GoalFormData>({
		resolver: zodResolver(goalSchema),
		defaultValues: {
			goalType: 'personal',
			timeframe: 'monthly',
			priority: 'medium',
		},
	})

	const createGoal = api.goal.create.useMutation({
		onSuccess: () => {
			toast.success('Goal created successfully')
			utils.goal.getAllByWorkspace.invalidate()
			closeModal()
		},
		onError: (error) => {
			toast.error(error.message || 'Failed to create goal')
		},
	})

	const onSubmit = (data: GoalFormData) => {
		createGoal.mutate({
			workspacePublicId: workspace.publicId,
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
				Create New Goal
			</h2>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				{/* Title */}
				<div>
					<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
						Title *
					</label>
					<Input {...register('title')} placeholder="Enter goal title" />
					{errors.title && (
						<p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
					)}
				</div>

				{/* Description */}
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

				{/* Goal Type & Timeframe */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Select
							{...register('goalType')}
							label="Type *"
							error={errors.goalType?.message}
						>
							<option value="outcome">Outcome</option>
							<option value="process">Process</option>
							<option value="performance">Performance</option>
						</Select>
					</div>

					<div>
						<Select
							{...register('timeframe')}
							label="Timeframe *"
							error={errors.timeframe?.message}
						>
							<option value="short_term">Short Term (0-3 months)</option>
							<option value="medium_term">Medium Term (3-12 months)</option>
							<option value="long_term">Long Term (1+ years)</option>
						</Select>
					</div>
				</div>

				{/* Priority */}
				<div>
					<Select
						{...register('priority')}
						label="Priority *"
						error={errors.priority?.message}
					>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</Select>
				</div>

				{/* Dates */}
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

				{/* Tags */}
				<div>
					<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
						Tags
					</label>
					<div className="flex gap-2">
						<Input
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
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

				{/* Actions */}
				<div className="flex justify-end gap-2 pt-4">
					<Button
						type="button"
						variant="secondary"
						onClick={closeModal}
						disabled={createGoal.isPending}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="primary"
						disabled={createGoal.isPending}
					>
						{createGoal.isPending ? 'Creating...' : 'Create Goal'}
					</Button>
				</div>
			</form>
		</div>
	)
}
