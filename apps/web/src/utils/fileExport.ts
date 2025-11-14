import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import type { FileMetadata, SpreadsheetData } from '~/types/file'

export function exportFile(file: FileMetadata) {
	const { name, type, content } = file

	switch (type) {
		case 'txt':
			exportTextFile(name, content as string)
			break
		case 'md':
			exportMarkdownFile(name, content as string)
			break
		case 'docx':
			exportDocxFile(name, content as string)
			break
		case 'xlsx':
			exportSpreadsheetFile(name, content as SpreadsheetData)
			break
		default:
			console.error('Unsupported file type:', type)
	}
}

function exportTextFile(name: string, content: string) {
	const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
	const fileName = name.endsWith('.txt') ? name : `${name}.txt`
	saveAs(blob, fileName)
}

function exportMarkdownFile(name: string, content: string) {
	const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
	const fileName = name.endsWith('.md') ? name : `${name}.md`
	saveAs(blob, fileName)
}

function exportDocxFile(name: string, content: string) {
	// For now, export as HTML since true DOCX requires complex library
	// In production, consider using docx.js for proper DOCX generation
	const htmlContent = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>${name}</title>
	<style>
		body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
	</style>
</head>
<body>
	${content}
</body>
</html>
	`.trim()

	const blob = new Blob([htmlContent], {
		type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	})
	const fileName = name.endsWith('.docx') ? name : `${name}.docx`
	saveAs(blob, fileName)
}

function exportSpreadsheetFile(name: string, data: SpreadsheetData) {
	// Convert spreadsheet data to worksheet
	const ws = XLSX.utils.aoa_to_sheet(
		data.map((row) => row.map((cell) => cell.value))
	)

	// Create workbook
	const wb = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

	// Generate XLSX file
	const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
	const blob = new Blob([wbout], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	})

	const fileName = name.endsWith('.xlsx') ? name : `${name}.xlsx`
	saveAs(blob, fileName)
}

export function getFileIcon(type: FileMetadata['type']) {
	switch (type) {
		case 'folder':
			return 'HiFolder'
		case 'list':
			return 'HiListBullet'
		case 'docx':
			return 'HiDocumentText'
		case 'md':
			return 'HiDocument'
		case 'txt':
			return 'HiDocumentText'
		case 'xlsx':
			return 'HiTableCells'
		default:
			return 'HiDocument'
	}
}
