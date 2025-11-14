import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Image } from '@tiptap/extension-image'
import { Iframe } from './extensions/Iframe'
import {
	HiXMark,
	HiArrowDownTray,
} from 'react-icons/hi2'
import type { FileEditorProps } from '~/types/file'
import { useAutoSave } from '~/hooks/useAutoSave'
import { exportFile } from '~/utils/fileExport'
import Button from '~/components/Button'
import { ComprehensiveSlashMenu } from './ComprehensiveSlashMenu'

export function DocxEditor({ file, onSave, onClose }: FileEditorProps) {
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const [showSlashMenu, setShowSlashMenu] = useState(false)
	const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
	const editorRef = useRef<HTMLDivElement>(null)

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-blue-600 hover:underline dark:text-blue-400',
				},
			}),
			Placeholder.configure({
				placeholder: "Write or type '/' for commands",
			}),
			TaskList,
			TaskItem.configure({
				nested: true,
			}),
			Table.configure({
				resizable: true,
			}),
			TableRow,
			TableHeader,
			TableCell,
			Image.configure({
				inline: true,
				allowBase64: true,
			}),
			Iframe.configure({
				allowFullscreen: true,
				HTMLAttributes: {
					class: 'iframe-wrapper',
				},
			}),
		],
		content: typeof file.content === 'string' ? file.content : '',
		editorProps: {
			attributes: {
				class:
					'prose prose-sm max-w-none focus:outline-none dark:prose-invert min-h-full p-6',
			},
			transformPastedHTML(html) {
				// Allow iframes to be pasted
				return html
			},
		},
		onUpdate: ({ editor }) => {
			setHasUnsavedChanges(true)
			
			// Check if the last character typed is a slash
			const { state } = editor
			const { selection } = state
			const { $from } = selection
			const textBefore = $from.nodeBefore?.text || ''
			
			if (textBefore.endsWith('/')) {
				const coords = editor.view.coordsAtPos(selection.from)
				setSlashMenuPosition({
					top: coords.top + 25,
					left: coords.left,
				})
				setShowSlashMenu(true)
			}
		},
	})

	useAutoSave(editor?.getHTML() || '', {
		onSave: (newContent) => {
			onSave(newContent as string)
			setHasUnsavedChanges(false)
		},
		delay: 3000,
		enabled: !!editor,
	})

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
		if (editor) {
			exportFile({ ...file, content: editor.getHTML() })
		}
	}

	const setLink = () => {
		if (!editor) return

		const previousUrl = editor.getAttributes('link').href
		const url = window.prompt('URL', previousUrl)

		if (url === null) return

		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run()
			return
		}

		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
	}

	if (!editor) {
		return null
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
					<Button
						variant="primary"
						onClick={() => {
							if (editor) {
								onSave(editor.getHTML())
								setHasUnsavedChanges(false)
							}
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
			<div ref={editorRef} className="flex-1 overflow-auto bg-white dark:bg-dark-100">
			<style>{`
				.ProseMirror p.is-editor-empty:first-child::before {
					content: attr(data-placeholder);
					float: left;
					color: #9ca3af;
					pointer-events: none;
					height: 0;
				}
				.iframe-wrapper {
					position: relative;
					width: 100%;
					margin: 1rem 0;
				}
				.iframe-wrapper iframe {
					border: 1px solid #e5e7eb;
					border-radius: 0.5rem;
					max-width: 100%;
				}
			`}</style>
			<EditorContent editor={editor} />
			</div>

			{/* Slash Command Menu */}
			{showSlashMenu && editor && (
				<ComprehensiveSlashMenu
					editor={editor}
					position={slashMenuPosition}
					onClose={() => setShowSlashMenu(false)}
				/>
			)}
		</div>
	)
}
