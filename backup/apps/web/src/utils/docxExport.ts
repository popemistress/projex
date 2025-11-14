import {
	Document,
	Packer,
	Paragraph,
	TextRun,
	HeadingLevel,
	AlignmentType,
	UnderlineType,
	type IParagraphOptions,
} from 'docx'
import { saveAs } from 'file-saver'

interface TipTapNode {
	type: string
	attrs?: any
	content?: TipTapNode[]
	text?: string
	marks?: Array<{ type: string; attrs?: any }>
}

/**
 * Export TipTap content to true DOCX format
 */
export async function exportToDocx(
	content: string,
	filename: string
): Promise<void> {
	try {
		const json: TipTapNode = JSON.parse(content)
		const paragraphs = parseContent(json)

		const doc = new Document({
			sections: [
				{
					properties: {},
					children: paragraphs,
				},
			],
		})

		const blob = await Packer.toBlob(doc)
		saveAs(blob, `${filename}.docx`)
	} catch (error) {
		console.error('DOCX export error:', error)
		throw new Error('Failed to export DOCX')
	}
}

/**
 * Parse TipTap JSON to DOCX paragraphs
 */
function parseContent(node: TipTapNode): Paragraph[] {
	const paragraphs: Paragraph[] = []

	if (!node.content) return paragraphs

	for (const child of node.content) {
		const paragraph = parseNode(child)
		if (paragraph) {
			paragraphs.push(paragraph)
		}
	}

	return paragraphs
}

/**
 * Parse a single TipTap node
 */
function parseNode(node: TipTapNode): Paragraph | null {
	switch (node.type) {
		case 'heading':
			return parseHeading(node)
		case 'paragraph':
			return parseParagraph(node)
		case 'bulletList':
			return parseBulletList(node)
		case 'orderedList':
			return parseOrderedList(node)
		case 'listItem':
			return parseListItem(node)
		case 'codeBlock':
			return parseCodeBlock(node)
		case 'blockquote':
			return parseBlockquote(node)
		default:
			return null
	}
}

/**
 * Parse heading node
 */
function parseHeading(node: TipTapNode): Paragraph {
	const level = node.attrs?.level || 1
	const text = extractText(node)

	const headingLevels: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
		1: HeadingLevel.HEADING_1,
		2: HeadingLevel.HEADING_2,
		3: HeadingLevel.HEADING_3,
		4: HeadingLevel.HEADING_4,
		5: HeadingLevel.HEADING_5,
		6: HeadingLevel.HEADING_6,
	}

	return new Paragraph({
		text,
		heading: headingLevels[level] || HeadingLevel.HEADING_1,
	})
}

/**
 * Parse paragraph node
 */
function parseParagraph(node: TipTapNode): Paragraph {
	const runs = parseInlineContent(node)

	return new Paragraph({
		children: runs,
		alignment: getAlignment(node.attrs?.textAlign),
	})
}

/**
 * Parse bullet list
 */
function parseBulletList(node: TipTapNode): Paragraph {
	if (!node.content) return new Paragraph({})

	const items: Paragraph[] = []
	for (const item of node.content) {
		if (item.type === 'listItem') {
			const text = extractText(item)
			items.push(
				new Paragraph({
					text,
					bullet: {
						level: 0,
					},
				})
			)
		}
	}

	return items[0] || new Paragraph({})
}

/**
 * Parse ordered list
 */
function parseOrderedList(node: TipTapNode): Paragraph {
	if (!node.content) return new Paragraph({})

	const items: Paragraph[] = []
	for (const item of node.content) {
		if (item.type === 'listItem') {
			const text = extractText(item)
			items.push(
				new Paragraph({
					text,
					numbering: {
						reference: 'default-numbering',
						level: 0,
					},
				})
			)
		}
	}

	return items[0] || new Paragraph({})
}

/**
 * Parse list item
 */
function parseListItem(node: TipTapNode): Paragraph {
	const text = extractText(node)
	return new Paragraph({ text })
}

/**
 * Parse code block
 */
function parseCodeBlock(node: TipTapNode): Paragraph {
	const text = extractText(node)
	return new Paragraph({
		children: [
			new TextRun({
				text,
				font: 'Courier New',
				size: 20,
			}),
		],
	})
}

/**
 * Parse blockquote
 */
function parseBlockquote(node: TipTapNode): Paragraph {
	const text = extractText(node)
	return new Paragraph({
		children: [
			new TextRun({
				text,
				italics: true,
			}),
		],
		indent: {
			left: 720, // 0.5 inch
		},
	})
}

/**
 * Parse inline content (text with marks)
 */
function parseInlineContent(node: TipTapNode): TextRun[] {
	const runs: TextRun[] = []

	if (!node.content) return runs

	for (const child of node.content) {
		if (child.type === 'text' && child.text) {
			const marks = child.marks || []
			const run = new TextRun({
				text: child.text,
				bold: marks.some(m => m.type === 'bold'),
				italics: marks.some(m => m.type === 'italic'),
				underline: marks.some(m => m.type === 'underline')
					? { type: UnderlineType.SINGLE }
					: undefined,
				strike: marks.some(m => m.type === 'strike'),
				color: getColor(marks),
			})
			runs.push(run)
		} else if (child.type === 'hardBreak') {
			runs.push(new TextRun({ text: '', break: 1 }))
		}
	}

	return runs
}

/**
 * Extract plain text from node
 */
function extractText(node: TipTapNode): string {
	if (node.text) return node.text

	if (!node.content) return ''

	return node.content
		.map(child => {
			if (child.text) return child.text
			return extractText(child)
		})
		.join('')
}

/**
 * Get alignment from attrs
 */
function getAlignment(align?: string): typeof AlignmentType[keyof typeof AlignmentType] {
	switch (align) {
		case 'left':
			return AlignmentType.LEFT
		case 'center':
			return AlignmentType.CENTER
		case 'right':
			return AlignmentType.RIGHT
		case 'justify':
			return AlignmentType.JUSTIFIED
		default:
			return AlignmentType.LEFT
	}
}

/**
 * Get color from marks
 */
function getColor(marks: Array<{ type: string; attrs?: any }>): string | undefined {
	const colorMark = marks.find(m => m.type === 'textStyle' && m.attrs?.color)
	return colorMark?.attrs?.color
}

/**
 * Export plain text to DOCX
 */
export async function exportPlainTextToDocx(
	content: string,
	filename: string
): Promise<void> {
	const lines = content.split('\n')
	const paragraphs = lines.map(
		line =>
			new Paragraph({
				children: [new TextRun(line)],
			})
	)

	const doc = new Document({
		sections: [
			{
				properties: {},
				children: paragraphs,
			},
		],
	})

	const blob = await Packer.toBlob(doc)
	saveAs(blob, `${filename}.docx`)
}

/**
 * Export markdown to DOCX
 */
export async function exportMarkdownToDocx(
	content: string,
	filename: string
): Promise<void> {
	// Simple markdown parsing
	const lines = content.split('\n')
	const paragraphs: Paragraph[] = []

	for (const line of lines) {
		if (line.startsWith('# ')) {
			paragraphs.push(
				new Paragraph({
					text: line.substring(2),
					heading: HeadingLevel.HEADING_1,
				})
			)
		} else if (line.startsWith('## ')) {
			paragraphs.push(
				new Paragraph({
					text: line.substring(3),
					heading: HeadingLevel.HEADING_2,
				})
			)
		} else if (line.startsWith('### ')) {
			paragraphs.push(
				new Paragraph({
					text: line.substring(4),
					heading: HeadingLevel.HEADING_3,
				})
			)
		} else if (line.startsWith('- ') || line.startsWith('* ')) {
			paragraphs.push(
				new Paragraph({
					text: line.substring(2),
					bullet: { level: 0 },
				})
			)
		} else {
			paragraphs.push(
				new Paragraph({
					children: [new TextRun(line)],
				})
			)
		}
	}

	const doc = new Document({
		sections: [
			{
				properties: {},
				children: paragraphs,
			},
		],
	})

	const blob = await Packer.toBlob(doc)
	saveAs(blob, `${filename}.docx`)
}
