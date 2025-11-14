export type FileType = 'folder' | 'list' | 'docx' | 'md' | 'pdf' | 'jpg' | 'png' | 'gif' | 'epub'

export interface FileMetadata {
	id: string
	name: string
	type: FileType
	folderId?: string
	createdAt: string
	updatedAt: string
	content?: string | object
	size?: number
}

export interface FileEditorProps {
	file: FileMetadata
	onSave: (content: string | object) => void
	onClose: () => void
}

export interface SpreadsheetCell {
	value: string | number
}

export type SpreadsheetData = SpreadsheetCell[][]
