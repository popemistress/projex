import { useEffect, useState } from 'react'
import { useModal } from '~/providers/modal'
import { api } from '~/utils/api'
import { MarkdownEditor, DocxEditor, PdfViewer, ImageViewer, EpubViewer } from './editors'

export function FileEditorModal() {
	const { modalContentType, entityId, closeModal } = useModal()
	const [file, setFile] = useState<any | null>(null)

	// Fetch file from API
	const { data: fileData, isLoading } = api.file.byId.useQuery(
		{ filePublicId: entityId || '' },
		{ enabled: !!entityId && modalContentType.startsWith('FILE_EDITOR_') }
	)

	// Update file mutation
	const updateFileMutation = api.file.update.useMutation({
		onSuccess: () => {
			// File updated successfully
		},
	})

	useEffect(() => {
		if (fileData) {
			setFile(fileData)
		}
	}, [fileData])

	const handleSave = (content: string | object) => {
		if (!file || !entityId) return

		updateFileMutation.mutate({
			filePublicId: entityId,
			content: typeof content === 'string' ? content : JSON.stringify(content),
		})
	}

	const handleClose = () => {
		closeModal()
		setFile(null)
	}

	if (!modalContentType.startsWith('FILE_EDITOR_')) {
		return null
	}

	if (isLoading || !file) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
				<div className="rounded-lg bg-white p-8 dark:bg-dark-200">
					<p className="text-neutral-600 dark:text-dark-700">Loading file...</p>
				</div>
			</div>
		)
	}

	const renderEditor = () => {
		const editorProps = {
			file,
			onSave: handleSave,
			onClose: handleClose,
		}

		switch (file.type) {
			case 'md':
				return <MarkdownEditor {...editorProps} />
			case 'docx':
				return <DocxEditor {...editorProps} />
			case 'list':
				return <DocxEditor {...editorProps} />
			case 'pdf':
				return <PdfViewer {...editorProps} />
			case 'jpg':
			case 'png':
			case 'gif':
				return <ImageViewer {...editorProps} />
			case 'epub':
				return <EpubViewer {...editorProps} />
			default:
				return (
					<div className="p-6 text-center">
						<p className="text-neutral-600 dark:text-dark-700">
							Unsupported file type: {file.type}
						</p>
					</div>
				)
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="h-[90vh] w-[90vw] overflow-hidden rounded-lg border border-light-300 bg-white shadow-xl dark:border-dark-500 dark:bg-dark-200">
				{renderEditor()}
			</div>
		</div>
	)
}
