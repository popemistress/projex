import { useState, useEffect, useCallback } from 'react'
import type { FileType } from '~/types/file'

interface Template {
	id: string
	publicId: string
	name: string
	type: FileType
	content: string
	templateCategory: string
	createdBy: string
	createdAt: string
	isPublic?: boolean
	previewImage?: string
	description?: string
}

interface UseTemplatesOptions {
	category?: string
	fileType?: FileType
}

export function useTemplates({ category, fileType }: UseTemplatesOptions = {}) {
	const [templates, setTemplates] = useState<Template[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Load templates
	const loadTemplates = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			const params = new URLSearchParams()
			if (category) params.append('category', category)
			if (fileType) params.append('type', fileType)

			const response = await fetch(`/api/templates?${params}`)
			if (!response.ok) throw new Error('Failed to load templates')

			const data = await response.json()
			setTemplates(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load templates')
		} finally {
			setIsLoading(false)
		}
	}, [category, fileType])

	// Create file from template
	const createFromTemplate = useCallback(
		async (
			templateId: string,
			data: {
				name: string
				folderId?: number
				workspaceId: number
			}
		) => {
			try {
				const response = await fetch(`/api/templates/${templateId}/create`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				})

				if (!response.ok) throw new Error('Failed to create from template')

				const newFile = await response.json()
				return newFile
			} catch (err) {
				console.error('Failed to create from template:', err)
				throw err
			}
		},
		[]
	)

	// Save file as template
	const saveAsTemplate = useCallback(
		async (data: {
			fileId: string
			name: string
			category: string
			description?: string
			isPublic?: boolean
		}) => {
			try {
				const response = await fetch('/api/templates', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				})

				if (!response.ok) throw new Error('Failed to save template')

				const newTemplate = await response.json()
				setTemplates(prev => [...prev, newTemplate])

				return newTemplate
			} catch (err) {
				console.error('Failed to save template:', err)
				throw err
			}
		},
		[]
	)

	// Delete template
	const deleteTemplate = useCallback(async (templateId: string) => {
		try {
			const response = await fetch(`/api/templates/${templateId}`, {
				method: 'DELETE',
			})

			if (!response.ok) throw new Error('Failed to delete template')

			setTemplates(prev => prev.filter(t => t.publicId !== templateId))
		} catch (err) {
			console.error('Failed to delete template:', err)
			throw err
		}
	}, [])

	// Load templates on mount or when filters change
	useEffect(() => {
		loadTemplates()
	}, [loadTemplates])

	return {
		templates,
		isLoading,
		error,
		createFromTemplate,
		saveAsTemplate,
		deleteTemplate,
		loadTemplates,
	}
}

/**
 * Hook for template categories
 */
export function useTemplateCategories() {
	const [categories, setCategories] = useState<string[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		const loadCategories = async () => {
			setIsLoading(true)
			try {
				const response = await fetch('/api/templates/categories')
				if (!response.ok) throw new Error('Failed to load categories')

				const data = await response.json()
				setCategories(data)
			} catch (err) {
				console.error('Failed to load categories:', err)
			} finally {
				setIsLoading(false)
			}
		}

		loadCategories()
	}, [])

	return { categories, isLoading }
}

/**
 * Pre-built template definitions
 */
export const BUILT_IN_TEMPLATES = {
	meetingNotes: {
		name: 'Meeting Notes',
		category: 'Productivity',
		type: 'docx' as FileType,
		content: JSON.stringify({
			type: 'doc',
			content: [
				{
					type: 'heading',
					attrs: { level: 1 },
					content: [{ type: 'text', text: 'Meeting Notes' }],
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', marks: [{ type: 'bold' }], text: 'Date: ' },
						{ type: 'text', text: '[Date]' },
					],
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', marks: [{ type: 'bold' }], text: 'Attendees: ' },
						{ type: 'text', text: '[Names]' },
					],
				},
				{
					type: 'heading',
					attrs: { level: 2 },
					content: [{ type: 'text', text: 'Agenda' }],
				},
				{ type: 'bulletList', content: [] },
				{
					type: 'heading',
					attrs: { level: 2 },
					content: [{ type: 'text', text: 'Discussion' }],
				},
				{ type: 'paragraph', content: [] },
				{
					type: 'heading',
					attrs: { level: 2 },
					content: [{ type: 'text', text: 'Action Items' }],
				},
				{ type: 'bulletList', content: [] },
			],
		}),
	},
	projectPlan: {
		name: 'Project Plan',
		category: 'Project Management',
		type: 'docx' as FileType,
		content: JSON.stringify({
			type: 'doc',
			content: [
				{
					type: 'heading',
					attrs: { level: 1 },
					content: [{ type: 'text', text: 'Project Plan' }],
				},
				{
					type: 'heading',
					attrs: { level: 2 },
					content: [{ type: 'text', text: 'Overview' }],
				},
				{ type: 'paragraph', content: [] },
				{
					type: 'heading',
					attrs: { level: 2 },
					content: [{ type: 'text', text: 'Objectives' }],
				},
				{ type: 'bulletList', content: [] },
				{
					type: 'heading',
					attrs: { level: 2 },
					content: [{ type: 'text', text: 'Timeline' }],
				},
				{ type: 'paragraph', content: [] },
				{
					type: 'heading',
					attrs: { level: 2 },
					content: [{ type: 'text', text: 'Resources' }],
				},
				{ type: 'bulletList', content: [] },
			],
		}),
	},
	weeklyReport: {
		name: 'Weekly Report',
		category: 'Reporting',
		type: 'docx' as FileType,
		content: JSON.stringify({
			type: 'doc',
			content: [
				{
					type: 'heading',
					attrs: { level: 1 },
					content: [{ type: 'text', text: 'Weekly Report' }],
				},
				{
					type: 'heading',
					attrs: { level: 2 },
					content: [{ type: 'text', text: 'Accomplishments' }],
				},
				{ type: 'bulletList', content: [] },
				{
					type: 'heading',
					attrs: { level: 2 },
					content: [{ type: 'text', text: 'Challenges' }],
				},
				{ type: 'bulletList', content: [] },
				{
					type: 'heading',
					attrs: { level: 2 },
					content: [{ type: 'text', text: 'Next Week' }],
				},
				{ type: 'bulletList', content: [] },
			],
		}),
	},
	technicalDoc: {
		name: 'Technical Documentation',
		category: 'Documentation',
		type: 'md' as FileType,
		content: `# Technical Documentation

## Overview

Brief description of the system/feature.

## Architecture

Describe the architecture here.

## API Reference

### Endpoint 1

\`\`\`
GET /api/endpoint
\`\`\`

Description of the endpoint.

## Installation

\`\`\`bash
npm install package-name
\`\`\`

## Usage

\`\`\`javascript
// Example code
\`\`\`

## Contributing

Guidelines for contributing.
`,
	},
	budgetSpreadsheet: {
		name: 'Budget Spreadsheet',
		category: 'Finance',
		type: 'xlsx' as FileType,
		content: JSON.stringify([
			[
				{ value: 'Category' },
				{ value: 'Budget' },
				{ value: 'Actual' },
				{ value: 'Difference' },
			],
			[{ value: 'Revenue' }, { value: '' }, { value: '' }, { value: '' }],
			[{ value: 'Expenses' }, { value: '' }, { value: '' }, { value: '' }],
			[{ value: 'Total' }, { value: '' }, { value: '' }, { value: '' }],
		]),
	},
}
