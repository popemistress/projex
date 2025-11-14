import { useEffect, useRef, useCallback } from 'react'

interface UseAutoSaveOptions {
	onSave: (content: string | object) => void
	delay?: number
	enabled?: boolean
}

export function useAutoSave(
	content: string | object,
	{ onSave, delay = 3000, enabled = true }: UseAutoSaveOptions
) {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	const previousContentRef = useRef<string | object>(content)

	const save = useCallback(() => {
		if (enabled && content !== previousContentRef.current) {
			onSave(content)
			previousContentRef.current = content
		}
	}, [content, onSave, enabled])

	useEffect(() => {
		if (!enabled) return

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		timeoutRef.current = setTimeout(() => {
			save()
		}, delay)

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [content, delay, enabled, save])

	return { save }
}
