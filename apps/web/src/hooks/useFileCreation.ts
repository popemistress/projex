import { useCallback } from 'react'
import type { FileMetadata, FileType } from '~/types/file'
import { useWorkspace } from '~/providers/workspace'
import { usePopup } from '~/providers/popup'

export function useFileCreation() {
	const { workspace } = useWorkspace()
	const { showPopup } = usePopup()

	const getStorageKey = useCallback(
		(folderId?: string) => {
			const base = `kan_files_${workspace.publicId}`
			return folderId ? `${base}_${folderId}` : base
		},
		[workspace.publicId]
	)

	const createFile = useCallback(
		(name: string, type: FileType, folderId?: string): FileMetadata => {
			const file: FileMetadata = {
				id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				name,
				type,
				folderId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				content: type === 'xlsx' ? [[{ value: '' }]] : '',
			}

			const storageKey = getStorageKey(folderId)
			const existingFiles = JSON.parse(localStorage.getItem(storageKey) || '[]')
			existingFiles.push(file)
			localStorage.setItem(storageKey, JSON.stringify(existingFiles))

			showPopup({
				header: 'File created',
				message: `"${name}" has been created successfully.`,
				icon: 'success',
			})

			// Trigger event to notify components
			window.dispatchEvent(
				new CustomEvent('fileCreated', { detail: { file, folderId } })
			)

			return file
		},
		[getStorageKey, showPopup]
	)

	const updateFile = useCallback(
		(fileId: string, updates: Partial<FileMetadata>, folderId?: string) => {
			const storageKey = getStorageKey(folderId)
			const existingFiles: FileMetadata[] = JSON.parse(
				localStorage.getItem(storageKey) || '[]'
			)

			const updatedFiles = existingFiles.map((file) =>
				file.id === fileId
					? { ...file, ...updates, updatedAt: new Date().toISOString() }
					: file
			)

			localStorage.setItem(storageKey, JSON.stringify(updatedFiles))

			// Trigger event to notify components
			window.dispatchEvent(
				new CustomEvent('fileUpdated', { detail: { fileId, updates, folderId } })
			)
		},
		[getStorageKey]
	)

	const deleteFile = useCallback(
		(fileId: string, folderId?: string) => {
			const storageKey = getStorageKey(folderId)
			const existingFiles: FileMetadata[] = JSON.parse(
				localStorage.getItem(storageKey) || '[]'
			)

			const updatedFiles = existingFiles.filter((file) => file.id !== fileId)
			localStorage.setItem(storageKey, JSON.stringify(updatedFiles))

			showPopup({
				header: 'File deleted',
				message: 'File has been deleted successfully.',
				icon: 'success',
			})

			// Trigger event to notify components
			window.dispatchEvent(
				new CustomEvent('fileDeleted', { detail: { fileId, folderId } })
			)
		},
		[getStorageKey, showPopup]
	)

	const getFiles = useCallback(
		(folderId?: string): FileMetadata[] => {
			const storageKey = getStorageKey(folderId)
			return JSON.parse(localStorage.getItem(storageKey) || '[]')
		},
		[getStorageKey]
	)

	const getFile = useCallback(
		(fileId: string, folderId?: string): FileMetadata | undefined => {
			const files = getFiles(folderId)
			return files.find((file) => file.id === fileId)
		},
		[getFiles]
	)

	return {
		createFile,
		updateFile,
		deleteFile,
		getFiles,
		getFile,
	}
}
