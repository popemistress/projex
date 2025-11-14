import { useState, useEffect, useRef } from 'react'
import {
	HiH1,
	HiH2,
	HiH3,
	HiListBullet,
	HiQueueList,
	HiBars3BottomLeft,
	HiMinus,
	HiCodeBracket,
	HiCheckCircle,
} from 'react-icons/hi2'

interface SlashCommand {
	id: string
	label: string
	icon: React.ReactNode
	description: string
	insertText: string
}

interface MarkdownSlashMenuProps {
	position: { top: number; left: number }
	onSelect: (insertText: string) => void
	onClose: () => void
}

export function MarkdownSlashMenu({ position, onSelect, onClose }: MarkdownSlashMenuProps) {
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [searchQuery, setSearchQuery] = useState('')
	const menuRef = useRef<HTMLDivElement>(null)

	const commands: SlashCommand[] = [
		{
			id: 'heading1',
			label: 'Heading 1',
			icon: <HiH1 className="h-5 w-5" />,
			description: 'Large section heading',
			insertText: '# ',
		},
		{
			id: 'heading2',
			label: 'Heading 2',
			icon: <HiH2 className="h-5 w-5" />,
			description: 'Medium section heading',
			insertText: '## ',
		},
		{
			id: 'heading3',
			label: 'Heading 3',
			icon: <HiH3 className="h-5 w-5" />,
			description: 'Small section heading',
			insertText: '### ',
		},
		{
			id: 'bulletList',
			label: 'Bullet List',
			icon: <HiListBullet className="h-5 w-5" />,
			description: 'Create a bulleted list',
			insertText: '- ',
		},
		{
			id: 'numberedList',
			label: 'Numbered List',
			icon: <HiQueueList className="h-5 w-5" />,
			description: 'Create a numbered list',
			insertText: '1. ',
		},
		{
			id: 'checkbox',
			label: 'Checkbox',
			icon: <HiCheckCircle className="h-5 w-5" />,
			description: 'Create a task list item',
			insertText: '- [ ] ',
		},
		{
			id: 'divider',
			label: 'Divider',
			icon: <HiMinus className="h-5 w-5" />,
			description: 'Add a horizontal divider',
			insertText: '\n---\n',
		},
		{
			id: 'codeBlock',
			label: 'Code Block',
			icon: <HiCodeBracket className="h-5 w-5" />,
			description: 'Insert a code block',
			insertText: '```\n\n```',
		},
	]

	const filteredCommands = commands.filter(
		(cmd) =>
			cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
			cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
	)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowDown') {
				e.preventDefault()
				setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
			} else if (e.key === 'ArrowUp') {
				e.preventDefault()
				setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
			} else if (e.key === 'Enter') {
				e.preventDefault()
				const command = filteredCommands[selectedIndex]
				if (command) {
					onSelect(command.insertText)
				}
			} else if (e.key === 'Escape') {
				e.preventDefault()
				onClose()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [selectedIndex, filteredCommands, onSelect, onClose])

	useEffect(() => {
		// Click outside to close
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [onClose])

	return (
		<div
			ref={menuRef}
			className="fixed z-50 w-80 rounded-lg border border-light-300 bg-white shadow-xl dark:border-dark-500 dark:bg-dark-200"
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
			}}
		>
			<div className="p-2">
				<input
					type="text"
					placeholder="Search commands..."
					value={searchQuery}
					onChange={(e) => {
						setSearchQuery(e.target.value)
						setSelectedIndex(0)
					}}
					className="w-full rounded-md border border-light-300 bg-white px-3 py-2 text-sm outline-none focus:border-coral dark:border-dark-500 dark:bg-dark-100 dark:text-dark-1000"
					autoFocus
				/>
			</div>
			<div className="max-h-96 overflow-y-auto">
				{filteredCommands.length === 0 ? (
					<div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-dark-700">
						No commands found
					</div>
				) : (
					filteredCommands.map((command, index) => (
						<button
							key={command.id}
							onClick={() => onSelect(command.insertText)}
							className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
								index === selectedIndex
									? 'bg-light-100 dark:bg-dark-300'
									: 'hover:bg-light-50 dark:hover:bg-dark-300'
							}`}
						>
							<div className="mt-0.5 text-neutral-600 dark:text-dark-700">
								{command.icon}
							</div>
							<div className="flex-1">
								<div className="text-sm font-medium text-neutral-900 dark:text-dark-1000">
									{command.label}
								</div>
								<div className="text-xs text-neutral-500 dark:text-dark-700">
									{command.description}
								</div>
							</div>
						</button>
					))
				)}
			</div>
		</div>
	)
}
