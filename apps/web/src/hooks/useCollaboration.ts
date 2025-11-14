import { useEffect, useState, useCallback, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'

interface CollaborationUser {
	userId: string
	name?: string
	email?: string
	image?: string
	cursorPosition?: any
}

interface UseCollaborationOptions {
	fileId: string
	userId: string
	userName?: string
	onContentChange?: (content: string, userId: string) => void
	onCursorMove?: (position: any, userId: string) => void
}

export function useCollaboration({
	fileId,
	userId,
	userName,
	onContentChange,
	onCursorMove,
}: UseCollaborationOptions) {
	const [socket, setSocket] = useState<Socket | null>(null)
	const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])
	const [isConnected, setIsConnected] = useState(false)
	const socketRef = useRef<Socket | null>(null)

	// Initialize socket connection
	useEffect(() => {
		const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'
		const newSocket = io(wsUrl, {
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionAttempts: 5,
		})

		socketRef.current = newSocket
		setSocket(newSocket)

		// Connection events
		newSocket.on('connect', () => {
			setIsConnected(true)
			console.log('WebSocket connected')

			// Join file room
			newSocket.emit('join-file', {
				fileId,
				userId,
				userName,
			})
		})

		newSocket.on('disconnect', () => {
			setIsConnected(false)
			console.log('WebSocket disconnected')
		})

		newSocket.on('connect_error', error => {
			console.error('WebSocket connection error:', error)
			setIsConnected(false)
		})

		// Collaboration events
		newSocket.on('user-joined', (data: CollaborationUser) => {
			console.log('User joined:', data)
			setActiveUsers(prev => {
				if (prev.some(u => u.userId === data.userId)) return prev
				return [...prev, data]
			})
		})

		newSocket.on('user-left', (data: { userId: string }) => {
			console.log('User left:', data)
			setActiveUsers(prev => prev.filter(u => u.userId !== data.userId))
		})

		newSocket.on('active-users', (users: CollaborationUser[]) => {
			console.log('Active users:', users)
			setActiveUsers(users.filter(u => u.userId !== userId))
		})

		newSocket.on('content-updated', (data: { content: string; userId: string }) => {
			console.log('Content updated by:', data.userId)
			if (data.userId !== userId && onContentChange) {
				onContentChange(data.content, data.userId)
			}
		})

		newSocket.on('cursor-updated', (data: { position: any; userId: string }) => {
			if (data.userId !== userId && onCursorMove) {
				onCursorMove(data.position, data.userId)
			}

			// Update cursor position in active users
			setActiveUsers(prev =>
				prev.map(u =>
					u.userId === data.userId ? { ...u, cursorPosition: data.position } : u
				)
			)
		})

		// Cleanup
		return () => {
			newSocket.emit('leave-file', { fileId, userId })
			newSocket.close()
			socketRef.current = null
		}
	}, [fileId, userId, userName, onContentChange, onCursorMove])

	// Broadcast content change
	const broadcastContentChange = useCallback(
		(content: string) => {
			if (socket && isConnected) {
				socket.emit('content-change', {
					fileId,
					content,
					userId,
				})
			}
		},
		[socket, isConnected, fileId, userId]
	)

	// Broadcast cursor position
	const broadcastCursorPosition = useCallback(
		(position: any) => {
			if (socket && isConnected) {
				socket.emit('cursor-move', {
					fileId,
					position,
					userId,
				})
			}
		},
		[socket, isConnected, fileId, userId]
	)

	// Send typing indicator
	const sendTypingIndicator = useCallback(
		(isTyping: boolean) => {
			if (socket && isConnected) {
				socket.emit('typing', {
					fileId,
					userId,
					isTyping,
				})
			}
		},
		[socket, isConnected, fileId, userId]
	)

	return {
		socket,
		activeUsers,
		isConnected,
		broadcastContentChange,
		broadcastCursorPosition,
		sendTypingIndicator,
	}
}

/**
 * Hook for managing typing indicators
 */
export function useTypingIndicator(
	sendTypingIndicator: (isTyping: boolean) => void,
	delay = 1000
) {
	const timeoutRef = useRef<NodeJS.Timeout>()

	const startTyping = useCallback(() => {
		sendTypingIndicator(true)

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		timeoutRef.current = setTimeout(() => {
			sendTypingIndicator(false)
		}, delay)
	}, [sendTypingIndicator, delay])

	const stopTyping = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}
		sendTypingIndicator(false)
	}, [sendTypingIndicator])

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	return { startTyping, stopTyping }
}
