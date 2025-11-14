import { useState, useEffect, useCallback, useRef } from 'react'
import type { FileType } from '~/types/file'

interface SearchResult {
	id: string
	publicId: string
	name: string
	type: FileType
	content?: string
	folderId?: number
	folder?: {
		id: number
		name: string
	}
	createdAt: string
	updatedAt?: string
	matchScore?: number
}

interface UseFileSearchOptions {
	workspaceId: string
	debounceMs?: number
	minQueryLength?: number
}

interface SearchFilters {
	fileType?: FileType
	folderId?: number
	dateFrom?: Date
	dateTo?: Date
	author?: string
}

export function useFileSearch({
	workspaceId,
	debounceMs = 300,
	minQueryLength = 2,
}: UseFileSearchOptions) {
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<SearchResult[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [filters, setFilters] = useState<SearchFilters>({})
	const [recentSearches, setRecentSearches] = useState<string[]>([])

	const abortControllerRef = useRef<AbortController | null>(null)
	const debounceTimerRef = useRef<NodeJS.Timeout>()

	// Load recent searches from localStorage
	useEffect(() => {
		const stored = localStorage.getItem(`recent_searches_${workspaceId}`)
		if (stored) {
			try {
				setRecentSearches(JSON.parse(stored))
			} catch (e) {
				console.error('Failed to parse recent searches:', e)
			}
		}
	}, [workspaceId])

	// Save recent search
	const saveRecentSearch = useCallback(
		(searchQuery: string) => {
			if (!searchQuery.trim()) return

			setRecentSearches(prev => {
				const updated = [
					searchQuery,
					...prev.filter(s => s !== searchQuery),
				].slice(0, 10)
				localStorage.setItem(
					`recent_searches_${workspaceId}`,
					JSON.stringify(updated)
				)
				return updated
			})
		},
		[workspaceId]
	)

	// Clear recent searches
	const clearRecentSearches = useCallback(() => {
		setRecentSearches([])
		localStorage.removeItem(`recent_searches_${workspaceId}`)
	}, [workspaceId])

	// Perform search
	const performSearch = useCallback(
		async (searchQuery: string, searchFilters: SearchFilters) => {
			if (searchQuery.length < minQueryLength) {
				setResults([])
				return
			}

			// Cancel previous request
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}

			abortControllerRef.current = new AbortController()
			setIsSearching(true)
			setError(null)

			try {
				const params = new URLSearchParams({
					q: searchQuery,
					workspaceId,
				})

				if (searchFilters.fileType) {
					params.append('type', searchFilters.fileType)
				}
				if (searchFilters.folderId) {
					params.append('folderId', searchFilters.folderId.toString())
				}
				if (searchFilters.dateFrom) {
					params.append('dateFrom', searchFilters.dateFrom.toISOString())
				}
				if (searchFilters.dateTo) {
					params.append('dateTo', searchFilters.dateTo.toISOString())
				}
				if (searchFilters.author) {
					params.append('author', searchFilters.author)
				}

				const response = await fetch(`/api/files/search?${params}`, {
					signal: abortControllerRef.current.signal,
				})

				if (!response.ok) throw new Error('Search failed')

				const data = await response.json()
				setResults(data)
				saveRecentSearch(searchQuery)
			} catch (err: any) {
				if (err.name !== 'AbortError') {
					setError(err.message || 'Search failed')
					console.error('Search error:', err)
				}
			} finally {
				setIsSearching(false)
			}
		},
		[workspaceId, minQueryLength, saveRecentSearch]
	)

	// Debounced search
	useEffect(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current)
		}

		if (query.length < minQueryLength) {
			setResults([])
			return
		}

		debounceTimerRef.current = setTimeout(() => {
			performSearch(query, filters)
		}, debounceMs)

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [query, filters, debounceMs, minQueryLength, performSearch])

	// Update query
	const updateQuery = useCallback((newQuery: string) => {
		setQuery(newQuery)
	}, [])

	// Update filters
	const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
		setFilters(prev => ({ ...prev, ...newFilters }))
	}, [])

	// Clear filters
	const clearFilters = useCallback(() => {
		setFilters({})
	}, [])

	// Clear search
	const clearSearch = useCallback(() => {
		setQuery('')
		setResults([])
		setError(null)
	}, [])

	// Highlight matches in text
	const highlightMatches = useCallback(
		(text: string) => {
			if (!query) return text

			const regex = new RegExp(`(${query})`, 'gi')
			return text.replace(regex, '<mark>$1</mark>')
		},
		[query]
	)

	return {
		query,
		results,
		isSearching,
		error,
		filters,
		recentSearches,
		updateQuery,
		updateFilters,
		clearFilters,
		clearSearch,
		clearRecentSearches,
		highlightMatches,
	}
}

/**
 * Hook for recent files
 */
export function useRecentFiles(workspaceId: string, limit = 10) {
	const [recentFiles, setRecentFiles] = useState<SearchResult[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		const loadRecentFiles = async () => {
			setIsLoading(true)
			try {
				const response = await fetch(
					`/api/files/recent?workspaceId=${workspaceId}&limit=${limit}`
				)
				if (!response.ok) throw new Error('Failed to load recent files')

				const data = await response.json()
				setRecentFiles(data)
			} catch (err) {
				console.error('Failed to load recent files:', err)
			} finally {
				setIsLoading(false)
			}
		}

		loadRecentFiles()
	}, [workspaceId, limit])

	return { recentFiles, isLoading }
}

/**
 * Hook for frequently accessed files
 */
export function useFrequentFiles(workspaceId: string, limit = 10) {
	const [frequentFiles, setFrequentFiles] = useState<SearchResult[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		const loadFrequentFiles = async () => {
			setIsLoading(true)
			try {
				const response = await fetch(
					`/api/files/frequent?workspaceId=${workspaceId}&limit=${limit}`
				)
				if (!response.ok) throw new Error('Failed to load frequent files')

				const data = await response.json()
				setFrequentFiles(data)
			} catch (err) {
				console.error('Failed to load frequent files:', err)
			} finally {
				setIsLoading(false)
			}
		}

		loadFrequentFiles()
	}, [workspaceId, limit])

	return { frequentFiles, isLoading }
}
