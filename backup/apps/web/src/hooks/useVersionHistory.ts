import { useState, useEffect, useCallback } from 'react'

interface FileVersion {
	id: string
	publicId: string
	versionNumber: number
	content: string
	changeDescription?: string
	createdBy: string
	createdAt: string
	createdByUser?: {
		id: string
		name: string | null
		email: string
		image: string | null
	}
}

interface UseVersionHistoryOptions {
	fileId: string
	currentContent: string
	onRestore?: (content: string) => void
	autoSaveInterval?: number // in milliseconds
}

export function useVersionHistory({
	fileId,
	currentContent,
	onRestore,
	autoSaveInterval = 5 * 60 * 1000, // 5 minutes
}: UseVersionHistoryOptions) {
	const [versions, setVersions] = useState<FileVersion[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [lastSavedContent, setLastSavedContent] = useState(currentContent)

	// Load versions
	const loadVersions = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch(`/api/files/${fileId}/versions`)
			if (!response.ok) throw new Error('Failed to load versions')

			const data = await response.json()
			setVersions(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load versions')
		} finally {
			setIsLoading(false)
		}
	}, [fileId])

	// Create a new version
	const createVersion = useCallback(
		async (content: string, description?: string) => {
			try {
				const response = await fetch(`/api/files/${fileId}/versions`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						content,
						changeDescription: description,
					}),
				})

				if (!response.ok) throw new Error('Failed to create version')

				const newVersion = await response.json()
				setVersions(prev => [newVersion, ...prev])
				setLastSavedContent(content)

				return newVersion
			} catch (err) {
				console.error('Failed to create version:', err)
				throw err
			}
		},
		[fileId]
	)

	// Restore a version
	const restoreVersion = useCallback(
		async (versionId: string) => {
			try {
				const version = versions.find(v => v.publicId === versionId)
				if (!version) throw new Error('Version not found')

				if (onRestore) {
					onRestore(version.content)
				}

				// Create a new version for the restoration
				await createVersion(
					version.content,
					`Restored from version ${version.versionNumber}`
				)

				return version.content
			} catch (err) {
				console.error('Failed to restore version:', err)
				throw err
			}
		},
		[versions, onRestore, createVersion]
	)

	// Compare two versions
	const compareVersions = useCallback(
		(versionId1: string, versionId2: string) => {
			const version1 = versions.find(v => v.publicId === versionId1)
			const version2 = versions.find(v => v.publicId === versionId2)

			if (!version1 || !version2) {
				throw new Error('One or both versions not found')
			}

			return {
				version1,
				version2,
				diff: generateDiff(version1.content, version2.content),
			}
		},
		[versions]
	)

	// Auto-save version
	useEffect(() => {
		if (!autoSaveInterval) return

		const hasChanges = currentContent !== lastSavedContent
		if (!hasChanges) return

		const timer = setTimeout(() => {
			createVersion(currentContent, 'Auto-save checkpoint')
		}, autoSaveInterval)

		return () => clearTimeout(timer)
	}, [currentContent, lastSavedContent, autoSaveInterval, createVersion])

	// Load versions on mount
	useEffect(() => {
		loadVersions()
	}, [loadVersions])

	return {
		versions,
		isLoading,
		error,
		createVersion,
		restoreVersion,
		compareVersions,
		loadVersions,
	}
}

/**
 * Simple diff generator
 */
function generateDiff(text1: string, text2: string): Array<{
	type: 'added' | 'removed' | 'unchanged'
	value: string
}> {
	const lines1 = text1.split('\n')
	const lines2 = text2.split('\n')
	const diff: Array<{ type: 'added' | 'removed' | 'unchanged'; value: string }> =
		[]

	const maxLength = Math.max(lines1.length, lines2.length)

	for (let i = 0; i < maxLength; i++) {
		const line1 = lines1[i]
		const line2 = lines2[i]

		if (line1 === line2) {
			if (line1 !== undefined) {
				diff.push({ type: 'unchanged', value: line1 })
			}
		} else {
			if (line1 !== undefined && !lines2.includes(line1)) {
				diff.push({ type: 'removed', value: line1 })
			}
			if (line2 !== undefined && !lines1.includes(line2)) {
				diff.push({ type: 'added', value: line2 })
			}
		}
	}

	return diff
}

/**
 * Hook for version comparison UI
 */
export function useVersionComparison(version1Content: string, version2Content: string) {
	const [diff, setDiff] = useState<
		Array<{ type: 'added' | 'removed' | 'unchanged'; value: string }>
	>([])

	useEffect(() => {
		setDiff(generateDiff(version1Content, version2Content))
	}, [version1Content, version2Content])

	const stats = {
		added: diff.filter(d => d.type === 'added').length,
		removed: diff.filter(d => d.type === 'removed').length,
		unchanged: diff.filter(d => d.type === 'unchanged').length,
	}

	return { diff, stats }
}
