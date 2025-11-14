import { useState } from 'react'
import { HiXMark, HiArrowDownTray } from 'react-icons/hi2'
import type { FileEditorProps } from '~/types/file'
import Button from '~/components/Button'

export function PdfViewer({ file, onClose }: FileEditorProps) {
	const handleClose = () => {
		onClose()
	}

	const handleDownload = () => {
		const link = document.createElement('a')
		link.href = file.content as string
		link.download = `${file.name}.pdf`
		link.click()
	}

	return (
		<div className="flex h-full flex-col bg-white dark:bg-dark-100">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-light-300 bg-light-50 px-4 py-3 dark:border-dark-500 dark:bg-dark-200">
				<div className="flex items-center gap-3">
					<h2 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
						{file.name}
					</h2>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="secondary"
						iconLeft={<HiArrowDownTray />}
						onClick={handleDownload}
					>
						Download
					</Button>
					<button
						onClick={handleClose}
						className="rounded-md p-2 hover:bg-light-100 dark:hover:bg-dark-300"
					>
						<HiXMark className="h-5 w-5 text-neutral-600 dark:text-dark-900" />
					</button>
				</div>
			</div>

			{/* PDF Viewer */}
			<div className="flex-1 overflow-auto bg-neutral-100 dark:bg-dark-200">
				<iframe
					src={file.content as string}
					className="h-full w-full border-0"
					title={file.name}
				/>
			</div>
		</div>
	)
}
