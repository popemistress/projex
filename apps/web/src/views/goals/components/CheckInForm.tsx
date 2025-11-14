import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '~/components/Button'
import Input from '~/components/Input'
import { api } from '~/utils/api'

interface CheckInFormProps {
	goalPublicId: string
}

export function CheckInForm({ goalPublicId }: CheckInFormProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const utils = api.useUtils()

	const { register, handleSubmit, reset } = useForm({
		defaultValues: {
			progress: 0,
			notes: '',
			mood: '',
			blockers: '',
			wins: '',
			nextSteps: '',
		},
	})

	const createCheckIn = api.goal.createCheckIn.useMutation({
		onSuccess: () => {
			utils.goal.getByPublicId.invalidate({ publicId: goalPublicId })
			reset()
			setIsExpanded(false)
		},
	})

	const onSubmit = (data: any) => {
		createCheckIn.mutate({
			goalPublicId,
			...data,
		})
	}

	return (
		<div className="rounded-lg border border-light-300 bg-white p-6 dark:border-dark-400 dark:bg-dark-100">
			<h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-dark-1000">
				Progress Check-in
			</h3>

			{!isExpanded ? (
				<Button
					variant="primary"
					size="sm"
					onClick={() => setIsExpanded(true)}
					className="w-full"
				>
					Record Progress
				</Button>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-dark-800">
							Progress (0-100)
						</label>
						<Input
							{...register('progress', { valueAsNumber: true })}
							type="number"
							min="0"
							max="100"
							placeholder="50"
						/>
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-dark-800">
							Notes
						</label>
						<textarea
							{...register('notes')}
							rows={3}
							className="w-full rounded-lg border border-light-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000 dark:placeholder-dark-600"
							placeholder="What progress have you made?"
						/>
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-dark-800">
							Mood
						</label>
						<select
							{...register('mood')}
							className="w-full rounded-lg border border-light-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000"
						>
							<option value="">Select mood</option>
							<option value="positive">Positive</option>
							<option value="neutral">Neutral</option>
							<option value="challenging">Challenging</option>
						</select>
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-dark-800">
							Blockers
						</label>
						<textarea
							{...register('blockers')}
							rows={2}
							className="w-full rounded-lg border border-light-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000 dark:placeholder-dark-600"
							placeholder="What's blocking you?"
						/>
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-dark-800">
							Wins
						</label>
						<textarea
							{...register('wins')}
							rows={2}
							className="w-full rounded-lg border border-light-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000 dark:placeholder-dark-600"
							placeholder="What went well?"
						/>
					</div>

					<div>
						<label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-dark-800">
							Next Steps
						</label>
						<textarea
							{...register('nextSteps')}
							rows={2}
							className="w-full rounded-lg border border-light-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000 dark:placeholder-dark-600"
							placeholder="What's next?"
						/>
					</div>

					<div className="flex gap-2">
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={() => setIsExpanded(false)}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="primary"
							size="sm"
							disabled={createCheckIn.isPending}
							className="flex-1"
						>
							{createCheckIn.isPending ? 'Saving...' : 'Save Check-in'}
						</Button>
					</div>
				</form>
			)}
		</div>
	)
}
