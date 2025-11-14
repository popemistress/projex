import { useState, useEffect, useRef } from 'react'
import { HiXMark, HiArrowDownTray, HiEye, HiPencil } from 'react-icons/hi2'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import type { FileEditorProps } from '~/types/file'
import { useAutoSave } from '~/hooks/useAutoSave'
import { exportFile } from '~/utils/fileExport'
import Button from '~/components/Button'
import { MarkdownSlashMenu } from './MarkdownSlashMenu'

export function MarkdownEditor({ file, onSave, onClose }: FileEditorProps) {
	const [content, setContent] = useState(
		typeof file.content === 'string' ? file.content : ''
	)
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split')
	const [showSlashMenu, setShowSlashMenu] = useState(false)
	const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
	const [cursorPosition, setCursorPosition] = useState(0)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	useAutoSave(content, {
		onSave: (newContent) => {
			onSave(newContent as string)
			setHasUnsavedChanges(false)
		},
		delay: 3000,
	})

	useEffect(() => {
		setHasUnsavedChanges(content !== file.content)
	}, [content, file.content])

	const handleClose = () => {
		if (hasUnsavedChanges) {
			if (
				confirm(
					'You have unsaved changes. Are you sure you want to close this file?'
				)
			) {
				onClose()
			}
		} else {
			onClose()
		}
	}

	const handleExport = () => {
		exportFile({ ...file, content })
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === '/') {
			const textarea = e.currentTarget
			const rect = textarea.getBoundingClientRect()
			const lineHeight = 20 // approximate line height
			
			setSlashMenuPosition({
				top: rect.top + lineHeight,
				left: rect.left + 20,
			})
			setCursorPosition(textarea.selectionStart)
			setShowSlashMenu(true)
		}
	}

	const handleSlashCommandSelect = (insertText: string) => {
		if (textareaRef.current) {
			const textarea = textareaRef.current
			const before = content.substring(0, cursorPosition)
			const after = content.substring(cursorPosition)
			
			// Remove the "/" that triggered the menu
			const newContent = before.slice(0, -1) + insertText + after
			setContent(newContent)
			
			// Set cursor position after inserted text
			setTimeout(() => {
				const newCursorPos = before.length - 1 + insertText.length
				textarea.setSelectionRange(newCursorPos, newCursorPos)
				textarea.focus()
			}, 0)
		}
		setShowSlashMenu(false)
	}

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-light-300 bg-white px-6 py-4 dark:border-dark-500 dark:bg-dark-200">
				<div className="flex items-center gap-3">
					<h2 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
						{file.name}
					</h2>
					{hasUnsavedChanges && (
						<span className="text-sm text-neutral-500 dark:text-dark-700">
							(Unsaved changes)
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{/* View Mode Toggle */}
					<div className="flex rounded-md border border-light-300 dark:border-dark-500">
						<button
							onClick={() => setViewMode('edit')}
							className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
								viewMode === 'edit'
									? 'bg-light-200 text-neutral-900 dark:bg-dark-300 dark:text-dark-1000'
									: 'text-neutral-600 hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-300'
							}`}
						>
							<HiPencil className="h-4 w-4" />
							Edit
						</button>
						<button
							onClick={() => setViewMode('split')}
							className={`flex items-center gap-1 border-x border-light-300 px-3 py-1.5 text-sm dark:border-dark-500 ${
								viewMode === 'split'
									? 'bg-light-200 text-neutral-900 dark:bg-dark-300 dark:text-dark-1000'
									: 'text-neutral-600 hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-300'
							}`}
						>
							Split
						</button>
						<button
							onClick={() => setViewMode('preview')}
							className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
								viewMode === 'preview'
									? 'bg-light-200 text-neutral-900 dark:bg-dark-300 dark:text-dark-1000'
									: 'text-neutral-600 hover:bg-light-100 dark:text-dark-700 dark:hover:bg-dark-300'
							}`}
						>
							<HiEye className="h-4 w-4" />
							Preview
						</button>
					</div>
					<Button
						variant="primary"
						onClick={() => {
							onSave(content)
							setHasUnsavedChanges(false)
						}}
						disabled={!hasUnsavedChanges}
					>
						Save
					</Button>
					<Button
						variant="secondary"
						iconLeft={<HiArrowDownTray />}
						onClick={handleExport}
					>
						Export
					</Button>
					<button
						onClick={handleClose}
						className="rounded-md p-2 hover:bg-light-100 dark:hover:bg-dark-300"
					>
						<HiXMark className="h-5 w-5 text-neutral-600 dark:text-dark-900" />
					</button>
				</div>
			</div>

			{/* Editor */}
			<div className="flex flex-1 overflow-hidden">
				{/* Edit Pane */}
				{(viewMode === 'edit' || viewMode === 'split') && (
					<div
						className={`flex flex-col overflow-hidden ${
							viewMode === 'split' ? 'w-1/2 border-r border-light-300 dark:border-dark-500' : 'w-full'
						}`}
					>
						<textarea
							ref={textareaRef}
							value={content}
							onChange={(e) => setContent(e.target.value)}
							onKeyDown={handleKeyDown}
							className="h-full w-full resize-none border-none bg-white p-6 font-mono text-sm text-neutral-900 outline-none dark:bg-dark-100 dark:text-dark-1000"
							placeholder="# Start writing markdown... (Press / for commands)"
							spellCheck={false}
						/>
					</div>
				)}

				{/* Preview Pane */}
				{(viewMode === 'preview' || viewMode === 'split') && (
					<div
						className={`overflow-auto bg-white dark:bg-dark-100 ${
							viewMode === 'split' ? 'w-1/2' : 'w-full'
						}`}
					>
						<div className="prose prose-sm max-w-none p-6 dark:prose-invert">
							<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
								{content || '*No content yet*'}
							</ReactMarkdown>
						</div>
					</div>
				)}
			</div>

			{/* Slash Command Menu */}
			{showSlashMenu && (
				<MarkdownSlashMenu
					position={slashMenuPosition}
					onSelect={handleSlashCommandSelect}
					onClose={() => setShowSlashMenu(false)}
				/>
			)}
		</div>
	)
}
