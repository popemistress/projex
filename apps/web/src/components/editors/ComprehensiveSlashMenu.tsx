import { useState, useEffect, useRef } from 'react'
import {
	HiH1, HiH2, HiH3,
	HiListBullet, HiQueueList, HiCheckCircle,
	HiBars3BottomLeft, HiMinus, HiCodeBracket,
	HiLink, HiPhoto, HiVideoCamera, HiMusicalNote,
	HiDocumentText, HiTableCells, HiCalendar,
	HiMap, HiChartBar, HiPuzzlePiece, HiChevronRight,
	HiViewColumns, HiDocumentPlus, HiRectangleStack,
	HiSquare3Stack3D, HiListBullet as HiToc,
	HiGlobeAlt, HiPaperClip,
} from 'react-icons/hi2'
import { SiYoutube, SiVimeo, SiGoogleslides, SiGoogledocs, SiGooglesheets } from 'react-icons/si'

interface SlashCommand {
	id: string
	label: string
	icon: React.ReactNode
	description: string
	category: string
	action: () => void
}

interface ComprehensiveSlashMenuProps {
	editor: any
	position: { top: number; left: number }
	onClose: () => void
}

export function ComprehensiveSlashMenu({ editor, position, onClose }: ComprehensiveSlashMenuProps) {
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [searchQuery, setSearchQuery] = useState('')
	const menuRef = useRef<HTMLDivElement>(null)

	const commands: SlashCommand[] = [
		// TEXT
		{
			id: 'paragraph',
			label: 'Normal Text',
			icon: <HiBars3BottomLeft className="h-5 w-5" />,
			description: 'Regular paragraph text',
			category: 'TEXT',
			action: () => {
				editor.chain().focus().setParagraph().run()
				onClose()
			},
		},
		{
			id: 'heading1',
			label: 'Heading 1',
			icon: <HiH1 className="h-5 w-5" />,
			description: 'Large section heading',
			category: 'TEXT',
			action: () => {
				editor.chain().focus().toggleHeading({ level: 1 }).run()
				onClose()
			},
		},
		{
			id: 'heading2',
			label: 'Heading 2',
			icon: <HiH2 className="h-5 w-5" />,
			description: 'Medium section heading',
			category: 'TEXT',
			action: () => {
				editor.chain().focus().toggleHeading({ level: 2 }).run()
				onClose()
			},
		},
		{
			id: 'heading3',
			label: 'Heading 3',
			icon: <HiH3 className="h-5 w-5" />,
			description: 'Small section heading',
			category: 'TEXT',
			action: () => {
				editor.chain().focus().toggleHeading({ level: 3 }).run()
				onClose()
			},
		},
		{
			id: 'bulletList',
			label: 'Bulleted List',
			icon: <HiListBullet className="h-5 w-5" />,
			description: 'Create a bulleted list',
			category: 'TEXT',
			action: () => {
				editor.chain().focus().toggleBulletList().run()
				onClose()
			},
		},
		{
			id: 'numberedList',
			label: 'Numbered List',
			icon: <HiQueueList className="h-5 w-5" />,
			description: 'Create a numbered list',
			category: 'TEXT',
			action: () => {
				editor.chain().focus().toggleOrderedList().run()
				onClose()
			},
		},
		{
			id: 'checkbox',
			label: 'Checklist',
			icon: <HiCheckCircle className="h-5 w-5" />,
			description: 'Create a task list',
			category: 'TEXT',
			action: () => {
				editor.chain().focus().toggleTaskList().run()
				onClose()
			},
		},

		// ADVANCED BLOCKS
		{
			id: 'divider',
			label: 'Divider',
			icon: <HiMinus className="h-5 w-5" />,
			description: 'Add a horizontal divider',
			category: 'ADVANCED BLOCKS',
			action: () => {
				editor.chain().focus().setHorizontalRule().run()
				onClose()
			},
		},
		{
			id: 'codeBlock',
			label: 'Code Block',
			icon: <HiCodeBracket className="h-5 w-5" />,
			description: 'Insert a code block',
			category: 'ADVANCED BLOCKS',
			action: () => {
				editor.chain().focus().toggleCodeBlock().run()
				onClose()
			},
		},
		{
			id: 'blockquote',
			label: 'Block Quote',
			icon: <HiDocumentText className="h-5 w-5" />,
			description: 'Insert a quote block',
			category: 'ADVANCED BLOCKS',
			action: () => {
				editor.chain().focus().toggleBlockquote().run()
				onClose()
			},
		},
		{
			id: 'table',
			label: 'Table',
			icon: <HiTableCells className="h-5 w-5" />,
			description: 'Insert a table',
			category: 'ADVANCED BLOCKS',
			action: () => {
				editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
				onClose()
			},
		},
		{
			id: 'columns',
			label: 'Columns',
			icon: <HiViewColumns className="h-5 w-5" />,
			description: 'Create a multi-column layout',
			category: 'ADVANCED BLOCKS',
			action: () => {
				editor.chain().focus().insertContent('<div class="grid grid-cols-2 gap-4"><div><p>Column 1</p></div><div><p>Column 2</p></div></div>').run()
				onClose()
			},
		},
		{
			id: 'newSubpage',
			label: 'New Subpage',
			icon: <HiRectangleStack className="h-5 w-5" />,
			description: 'Create a nested subpage',
			category: 'ADVANCED BLOCKS',
			action: () => {
				editor.chain().focus().insertContent('<div class="ml-6 pl-4 border-l-2 border-neutral-200"><h3>Subpage</h3><p>Content here...</p></div>').run()
				onClose()
			},
		},
		{
			id: 'button',
			label: 'Button',
			icon: <HiSquare3Stack3D className="h-5 w-5" />,
			description: 'Insert a clickable button',
			category: 'ADVANCED BLOCKS',
			action: () => {
				const text = window.prompt('Button text:', 'Click me')
				if (text) {
					editor.chain().focus().insertContent(`<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">${text}</button>`).run()
				}
				onClose()
			},
		},
		{
			id: 'tableOfContents',
			label: 'Table of contents',
			icon: <HiToc className="h-5 w-5" />,
			description: 'Generate a table of contents',
			category: 'ADVANCED BLOCKS',
			action: () => {
				editor.chain().focus().insertContent('<div class="toc p-4 bg-neutral-50 dark:bg-neutral-800 rounded"><h3 class="font-bold mb-2">Table of Contents</h3><ul class="list-disc list-inside"><li>Section 1</li><li>Section 2</li><li>Section 3</li></ul></div>').run()
				onClose()
			},
		},
		{
			id: 'stickyTableOfContents',
			label: 'Sticky table of contents',
			icon: <HiToc className="h-5 w-5" />,
			description: 'Create a sticky TOC sidebar',
			category: 'ADVANCED BLOCKS',
			action: () => {
				editor.chain().focus().insertContent('<div class="sticky top-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded border border-neutral-200"><h4 class="font-bold mb-2">Contents</h4><ul class="text-sm space-y-1"><li>Section 1</li><li>Section 2</li></ul></div>').run()
				onClose()
			},
		},
		{
			id: 'template',
			label: 'Template',
			icon: <HiDocumentText className="h-5 w-5" />,
			description: 'Insert from template',
			category: 'ADVANCED BLOCKS',
			action: () => {
				editor.chain().focus().insertContent('<div class="template p-6 border-2 border-dashed border-neutral-300 rounded"><h2>Template</h2><p>Start with a template...</p></div>').run()
				onClose()
			},
		},
		{
			id: 'markdown',
			label: 'Markdown',
			icon: <HiCodeBracket className="h-5 w-5" />,
			description: 'Insert markdown block',
			category: 'ADVANCED BLOCKS',
			action: () => {
				editor.chain().focus().insertContent('<pre class="markdown-block p-4 bg-neutral-100 dark:bg-neutral-900 rounded font-mono text-sm"># Markdown\n\nWrite markdown here...</pre>').run()
				onClose()
			},
		},

		// FORMATTING
		{
			id: 'bold',
			label: 'Bold',
			icon: <span className="font-bold text-lg">B</span>,
			description: 'Make text bold',
			category: 'FORMATTING',
			action: () => {
				editor.chain().focus().toggleBold().run()
				onClose()
			},
		},
		{
			id: 'italic',
			label: 'Italic',
			icon: <span className="italic text-lg">I</span>,
			description: 'Make text italic',
			category: 'FORMATTING',
			action: () => {
				editor.chain().focus().toggleItalic().run()
				onClose()
			},
		},
		{
			id: 'strikethrough',
			label: 'Strikethrough',
			icon: <span className="line-through text-lg">S</span>,
			description: 'Strike through text',
			category: 'FORMATTING',
			action: () => {
				editor.chain().focus().toggleStrike().run()
				onClose()
			},
		},
		{
			id: 'inlineCode',
			label: 'Inline Code',
			icon: <HiCodeBracket className="h-5 w-5" />,
			description: 'Inline code formatting',
			category: 'FORMATTING',
			action: () => {
				editor.chain().focus().toggleCode().run()
				onClose()
			},
		},
		{
			id: 'link',
			label: 'Website Link',
			icon: <HiLink className="h-5 w-5" />,
			description: 'Add a hyperlink',
			category: 'FORMATTING',
			action: () => {
				const url = window.prompt('Enter URL:')
				if (url) {
					editor.chain().focus().setLink({ href: url }).run()
				}
				onClose()
			},
		},

		// INLINE (Mentions)
		{
			id: 'mentionPerson',
			label: 'Mention a Person',
			icon: <span className="text-lg">@</span>,
			description: 'Tag a team member',
			category: 'INLINE',
			action: () => {
				// Placeholder - would need custom extension
				editor.chain().focus().insertContent('@').run()
				onClose()
			},
		},
		{
			id: 'mentionPage',
			label: 'Mention a Page',
			icon: <HiDocumentText className="h-5 w-5" />,
			description: 'Link to another page',
			category: 'INLINE',
			action: () => {
				// Placeholder
				editor.chain().focus().insertContent('[[').run()
				onClose()
			},
		},

		// EMBEDS
		{
			id: 'image',
			label: 'Image',
			icon: <HiPhoto className="h-5 w-5" />,
			description: 'Upload or embed an image',
			category: 'EMBEDS',
			action: () => {
				const url = window.prompt('Enter image URL:')
				if (url) {
					editor.chain().focus().setImage({ src: url }).run()
				}
				onClose()
			},
		},
		{
			id: 'embedWebsite',
			label: 'Embed website',
			icon: <HiGlobeAlt className="h-5 w-5" />,
			description: 'Embed any website',
			category: 'EMBEDS',
			action: () => {
				const url = window.prompt('Enter website URL:')
				if (url) {
					editor.chain().focus().setIframe({ src: url, width: '100%', height: '400' }).run()
				}
				onClose()
			},
		},
		{
			id: 'youtube',
			label: 'YouTube',
			icon: <SiYoutube className="h-5 w-5 text-red-600" />,
			description: 'Embed a YouTube video',
			category: 'EMBEDS',
			action: () => {
				const url = window.prompt('Enter YouTube URL:')
				if (url) {
					let videoId = ''
					if (url.includes('youtube.com/watch?v=')) {
						videoId = url.split('v=')[1]?.split('&')[0] || ''
					} else if (url.includes('youtu.be/')) {
						videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
					}
					if (videoId) {
						editor.chain().focus().setIframe({ src: `https://www.youtube.com/embed/${videoId}`, width: '560', height: '315' }).run()
					}
				}
				onClose()
			},
		},
		{
			id: 'vimeo',
			label: 'Vimeo',
			icon: <SiVimeo className="h-5 w-5 text-blue-500" />,
			description: 'Embed a Vimeo video',
			category: 'EMBEDS',
			action: () => {
				const url = window.prompt('Enter Vimeo URL:')
				if (url) {
					const videoId = url.split('vimeo.com/')[1]?.split('?')[0] || ''
					if (videoId) {
						editor.chain().focus().setIframe({ src: `https://player.vimeo.com/video/${videoId}`, width: '560', height: '315' }).run()
					}
				}
				onClose()
			},
		},
		{
			id: 'googleSlides',
			label: 'Google Slides',
			icon: <SiGoogleslides className="h-5 w-5 text-yellow-500" />,
			description: 'Embed Google Slides',
			category: 'EMBEDS',
			action: () => {
				const url = window.prompt('Enter Google Slides URL:')
				if (url) {
					const embedUrl = url.replace('/edit', '/embed')
					editor.chain().focus().setIframe({ src: embedUrl, width: '100%', height: '400' }).run()
				}
				onClose()
			},
		},
		{
			id: 'googleDocs',
			label: 'Google Docs',
			icon: <SiGoogledocs className="h-5 w-5 text-blue-600" />,
			description: 'Embed Google Docs',
			category: 'EMBEDS',
			action: () => {
				const url = window.prompt('Enter Google Docs URL:')
				if (url) {
					const embedUrl = url.replace('/edit', '/preview')
					editor.chain().focus().setIframe({ src: embedUrl, width: '100%', height: '600' }).run()
				}
				onClose()
			},
		},
		{
			id: 'googleSheets',
			label: 'Google Sheets',
			icon: <SiGooglesheets className="h-5 w-5 text-green-600" />,
			description: 'Embed Google Sheets',
			category: 'EMBEDS',
			action: () => {
				const url = window.prompt('Enter Google Sheets URL:')
				if (url) {
					const embedUrl = url.replace('/edit', '/preview')
					editor.chain().focus().setIframe({ src: embedUrl, width: '100%', height: '400' }).run()
				}
				onClose()
			},
		},
		{
			id: 'attachment',
			label: 'Attachment',
			icon: <HiPaperClip className="h-5 w-5" />,
			description: 'Attach a file',
			category: 'EMBEDS',
			action: () => {
				const fileName = window.prompt('Enter file name:')
				if (fileName) {
					editor.chain().focus().insertContent(`<div class="attachment p-3 border border-neutral-300 rounded flex items-center gap-2"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg><span>${fileName}</span></div>`).run()
				}
				onClose()
			},
		},
	]

	const filteredCommands = commands.filter(
		(cmd) =>
			cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
			cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
	)

	// Group commands by category
	const groupedCommands = filteredCommands.reduce((acc, cmd) => {
		if (!acc[cmd.category]) {
			acc[cmd.category] = []
		}
		acc[cmd.category].push(cmd)
		return acc
	}, {} as Record<string, SlashCommand[]>)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (filteredCommands.length === 0) return
			
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
					command.action()
				}
			} else if (e.key === 'Escape') {
				e.preventDefault()
				onClose()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [selectedIndex, filteredCommands, onClose])

	useEffect(() => {
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
			className="fixed z-50 w-96 rounded-lg border border-light-300 bg-white shadow-xl dark:border-dark-500 dark:bg-dark-200"
			style={{
				top: `${position.top}px`,
				left: `${position.left}px`,
				maxHeight: '80vh',
			}}
		>
			<div className="sticky top-0 bg-white p-2 dark:bg-dark-200">
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
			<div className="max-h-[calc(80vh-60px)] overflow-y-auto">
				{filteredCommands.length === 0 ? (
					<div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-dark-700">
						No commands found
					</div>
				) : (
					Object.entries(groupedCommands).map(([category, cmds]) => (
						<div key={category} className="mb-2">
							<div className="px-4 py-2 text-xs font-semibold uppercase text-neutral-500 dark:text-dark-700">
								{category}
							</div>
							{cmds.map((command, index) => {
								const globalIndex = filteredCommands.indexOf(command)
								return (
									<button
										key={command.id}
										onClick={command.action}
										className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${
											globalIndex === selectedIndex
												? 'bg-light-100 dark:bg-dark-300'
												: 'hover:bg-light-50 dark:hover:bg-dark-300'
										}`}
									>
										<div className="mt-0.5 text-neutral-600 dark:text-dark-700">
											{command.icon}
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-sm font-medium text-neutral-900 dark:text-dark-1000 truncate">
												{command.label}
											</div>
											<div className="text-xs text-neutral-500 dark:text-dark-700 truncate">
												{command.description}
											</div>
										</div>
									</button>
								)
							})}
						</div>
					))
				)}
			</div>
		</div>
	)
}
