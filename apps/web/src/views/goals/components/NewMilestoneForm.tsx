import { useForm } from 'react-hook-form'
import Button from '~/components/Button'
import Input from '~/components/Input'
import { useModal } from '~/providers/modal'
import { api } from '~/utils/api'

interface NewMilestoneFormProps {
	goalPublicId: string
}

export function NewMilestoneForm({ goalPublicId }: NewMilestoneFormProps) {
	const { closeModal } = useModal()
	const utils = api.useUtils()

	const { register, handleSubmit } = useForm({
		defaultValues: {
			title: '',
			description: '',
			targetDate: '',
		},
	})

	const createMilestone = api.goal.createMilestone.useMutation({
		onSuccess: () => {
			utils.goal.getByPublicId.invalidate({ publicId: goalPublicId })
			closeModal()
		},
	})

	const onSubmit = (data: any) => {
		createMilestone.mutate({
			goalPublicId,
			...data,
		})
	}

	return (
		<div className="p-6">
			<h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-dark-1000">
				Add Milestone
			</h2>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div>
					<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
						Title *
					</label>
					<Input {...register('title')} placeholder="Milestone title" required />
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
						Description
					</label>
					<textarea
						{...register('description')}
						rows={3}
						className="w-full rounded-lg border border-light-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000 dark:placeholder-dark-600"
						placeholder="Describe this milestone..."
					/>
				</div>

				<div>
					<label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-dark-800">
						Target Date
					</label>
					<Input {...register('targetDate')} type="date" />
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<Button
						type="button"
						variant="secondary"
						onClick={closeModal}
						disabled={createMilestone.isPending}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="primary"
						disabled={createMilestone.isPending}
					>
						{createMilestone.isPending ? 'Creating...' : 'Create Milestone'}
					</Button>
				</div>
			</form>
		</div>
	)
}
