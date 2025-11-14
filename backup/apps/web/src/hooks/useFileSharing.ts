import { useState, useEffect, useCallback } from 'react'

export type PermissionLevel = 'view' | 'edit' | 'admin'

interface FileShare {
	id: string
	publicId: string
	fileId: number
	userId?: string
	email?: string
	permission: PermissionLevel
	expiresAt?: string
	sharedBy: string
	createdAt: string
	revokedAt?: string
	user?: {
		id: string
		name: string | null
		email: string
		image: string | null
	}
	sharedByUser?: {
		id: string
		name: string | null
		email: string
	}
}

interface UseFileSharingOptions {
	fileId: string
}

export function useFileSharing({ fileId }: UseFileSharingOptions) {
	const [shares, setShares] = useState<FileShare[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Load shares
	const loadShares = useCallback(async () => {
		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch(`/api/files/${fileId}/shares`)
			if (!response.ok) throw new Error('Failed to load shares')

			const data = await response.json()
			setShares(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load shares')
		} finally {
			setIsLoading(false)
		}
	}, [fileId])

	// Share file
	const shareFile = useCallback(
		async (data: {
			email: string
			permission: PermissionLevel
			expiresIn?: number // days
		}) => {
			try {
				const expiresAt = data.expiresIn
					? new Date(Date.now() + data.expiresIn * 24 * 60 * 60 * 1000)
					: undefined

				const response = await fetch(`/api/files/${fileId}/shares`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: data.email,
						permission: data.permission,
						expiresAt,
					}),
				})

				if (!response.ok) {
					const errorData = await response.json()
					throw new Error(errorData.message || 'Failed to share file')
				}

				const newShare = await response.json()
				setShares(prev => [...prev, newShare])

				return newShare
			} catch (err) {
				console.error('Failed to share file:', err)
				throw err
			}
		},
		[fileId]
	)

	// Update share permission
	const updateSharePermission = useCallback(
		async (shareId: string, permission: PermissionLevel) => {
			try {
				const response = await fetch(`/api/files/${fileId}/shares/${shareId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ permission }),
				})

				if (!response.ok) throw new Error('Failed to update permission')

				const updatedShare = await response.json()
				setShares(prev =>
					prev.map(s => (s.publicId === shareId ? updatedShare : s))
				)

				return updatedShare
			} catch (err) {
				console.error('Failed to update permission:', err)
				throw err
			}
		},
		[fileId]
	)

	// Revoke share
	const revokeShare = useCallback(
		async (shareId: string) => {
			try {
				const response = await fetch(`/api/files/${fileId}/shares/${shareId}`, {
					method: 'DELETE',
				})

				if (!response.ok) throw new Error('Failed to revoke share')

				setShares(prev => prev.filter(s => s.publicId !== shareId))
			} catch (err) {
				console.error('Failed to revoke share:', err)
				throw err
			}
		},
		[fileId]
	)

	// Check if user has access
	const checkAccess = useCallback(
		async (userId: string): Promise<PermissionLevel | null> => {
			try {
				const response = await fetch(
					`/api/files/${fileId}/access?userId=${userId}`
				)
				if (!response.ok) return null

				const data = await response.json()
				return data.permission || null
			} catch (err) {
				console.error('Failed to check access:', err)
				return null
			}
		},
		[fileId]
	)

	// Load shares on mount
	useEffect(() => {
		loadShares()
	}, [loadShares])

	return {
		shares,
		isLoading,
		error,
		shareFile,
		updateSharePermission,
		revokeShare,
		checkAccess,
		loadShares,
	}
}

/**
 * Hook for managing shared files (files shared with current user)
 */
export function useSharedWithMe(userId: string) {
	const [sharedFiles, setSharedFiles] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const loadSharedFiles = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const response = await fetch(`/api/files/shared-with-me?userId=${userId}`)
				if (!response.ok) throw new Error('Failed to load shared files')

				const data = await response.json()
				setSharedFiles(data)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load shared files')
			} finally {
				setIsLoading(false)
			}
		}

		loadSharedFiles()
	}, [userId])

	return { sharedFiles, isLoading, error }
}

/**
 * Hook for permission checking
 */
export function useFilePermission(fileId: string, userId: string) {
	const [permission, setPermission] = useState<PermissionLevel | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkPermission = async () => {
			setIsLoading(true)
			try {
				const response = await fetch(
					`/api/files/${fileId}/access?userId=${userId}`
				)
				if (!response.ok) {
					setPermission(null)
					return
				}

				const data = await response.json()
				setPermission(data.permission || null)
			} catch (err) {
				console.error('Failed to check permission:', err)
				setPermission(null)
			} finally {
				setIsLoading(false)
			}
		}

		checkPermission()
	}, [fileId, userId])

	const canView = permission !== null
	const canEdit = permission === 'edit' || permission === 'admin'
	const canAdmin = permission === 'admin'

	return {
		permission,
		isLoading,
		canView,
		canEdit,
		canAdmin,
	}
}

/**
 * Generate shareable link
 */
export function useShareableLink(fileId: string) {
	const [link, setLink] = useState<string | null>(null)
	const [isGenerating, setIsGenerating] = useState(false)

	const generateLink = useCallback(
		async (expiresIn?: number) => {
			setIsGenerating(true)
			try {
				const response = await fetch(`/api/files/${fileId}/share-link`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ expiresIn }),
				})

				if (!response.ok) throw new Error('Failed to generate link')

				const data = await response.json()
				const fullLink = `${window.location.origin}/shared/${data.token}`
				setLink(fullLink)

				return fullLink
			} catch (err) {
				console.error('Failed to generate link:', err)
				throw err
			} finally {
				setIsGenerating(false)
			}
		},
		[fileId]
	)

	const copyLink = useCallback(async () => {
		if (!link) return false

		try {
			await navigator.clipboard.writeText(link)
			return true
		} catch (err) {
			console.error('Failed to copy link:', err)
			return false
		}
	}, [link])

	return {
		link,
		isGenerating,
		generateLink,
		copyLink,
	}
}
