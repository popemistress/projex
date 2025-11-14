import { useState } from 'react'
import Button from '~/components/Button'
import { useModal } from '~/providers/modal'
import { useWorkspace } from '~/providers/workspace'
import { api } from '~/utils/api'

interface LinkCardsModalProps {
	goalPublicId: string
}

export function LinkCardsModal({ goalPublicId }: LinkCardsModalProps) {
	const { closeModal } = useModal()
	const { workspace } = useWorkspace()
	const [selectedCard, setSelectedCard] = useState('')
	const utils = api.useUtils()

	// Note: Adjust this query based on your actual card API
	const { data: boards } = api.board.getAllByWorkspace.useQuery({
		workspacePublicId: workspace.publicId,
	})

	const linkCard = api.goal.linkCard.useMutation({
		onSuccess: () => {
			utils.goal.getByPublicId.invalidate({ publicId: goalPublicId })
			closeModal()
			setSelectedCard('')
		},
	})

	// Flatten all cards from all boards
	const allCards =
		boards?.flatMap((board: any) =>
			board.lists?.flatMap((list: any) => list.cards || []),
		) || []

	return (
		<div className="p-6">
			<h2 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-dark-1000">
				Link Cards to Goal
			</h2>

			<div className="mb-6">
				<label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-dark-800">
					Select a card
				</label>
				<select
					value={selectedCard}
					onChange={(e) => setSelectedCard(e.target.value)}
					className="w-full rounded-lg border border-light-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-400 dark:bg-dark-100 dark:text-dark-1000"
				>
					<option value="">Choose a card...</option>
					{allCards.map((card: any) => (
						<option key={card.publicId} value={card.publicId}>
							{card.title}
						</option>
					))}
				</select>
			</div>

			<div className="flex justify-end gap-2">
				<Button variant="secondary" onClick={closeModal}>
					Cancel
				</Button>
				<Button
					variant="primary"
					onClick={() =>
						linkCard.mutate({ goalPublicId, cardPublicId: selectedCard })
					}
					disabled={!selectedCard || linkCard.isPending}
				>
					{linkCard.isPending ? 'Linking...' : 'Link Card'}
				</Button>
			</div>
		</div>
	)
}
