import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import * as fileRepo from '@kan/db/repository/file.repo'
import * as userRepo from '@kan/db/repository/user.repo'
import * as workspaceRepo from '@kan/db/repository/workspace.repo'
import type { FileType } from '@kan/db/schema'

import { protectedProcedure, createTRPCRouter } from '../trpc'
import {
	saveFileLocally,
	readFileLocally,
	deleteFileLocally,
	shouldStoreLocally,
	getFileUrl,
} from '../utils/localStorage'

// Helper function to determine file type from filename or MIME type
function getFileType(fileName: string, mimeType: string): FileType {
	const extension = fileName.split('.').pop()?.toLowerCase()
	
	// Map extensions to file types
	const extensionMap: Record<string, FileType> = {
		'docx': 'docx',
		'doc': 'docx',
		'md': 'md',
		'markdown': 'md',
		'pdf': 'pdf',
		'jpg': 'jpg',
		'jpeg': 'jpg',
		'png': 'png',
		'gif': 'gif',
		'epub': 'epub',
	}
	
	if (extension && extensionMap[extension]) {
		return extensionMap[extension]
	}
	
	// Fallback to MIME type mapping
	if (mimeType.includes('word')) return 'docx'
	if (mimeType.includes('markdown')) return 'md'
	if (mimeType.includes('pdf')) return 'pdf'
	if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg'
	if (mimeType.includes('png')) return 'png'
	if (mimeType.includes('gif')) return 'gif'
	if (mimeType.includes('epub')) return 'epub'
	
	// Default to docx for unknown document types
	return 'docx'
}

export const uploadRouter = createTRPCRouter({
	// Upload file (binary to local storage, text to database)
	uploadFile: protectedProcedure
		.input(
			z.object({
				fileName: z.string(),
				fileContent: z.string(), // Base64 encoded
				mimeType: z.string(),
				workspacePublicId: z.string().min(12),
				folderId: z.number().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId) {
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})
			}

			// Get user info
			const user = await userRepo.getById(ctx.db, userId)
			if (!user) {
				throw new TRPCError({
					message: 'User not found',
					code: 'NOT_FOUND',
				})
			}

			// Get workspace by publicId
			const workspace = await workspaceRepo.getByPublicId(
				ctx.db,
				input.workspacePublicId
			)
			if (!workspace) {
				throw new TRPCError({
					message: 'Workspace not found',
					code: 'NOT_FOUND',
				})
			}

			// Decode base64 content
			const buffer = Buffer.from(input.fileContent, 'base64')
			const fileSize = buffer.length

			// Determine storage location based on MIME type
			const storeLocally = shouldStoreLocally(input.mimeType)
			const fileType = getFileType(input.fileName, input.mimeType)

			let file

			if (storeLocally) {
				// Binary files: Store in local file system
				const username = user.email || user.name || user.id
				const storageResult = await saveFileLocally(
					username,
					workspace.id.toString(),
					input.fileName,
					buffer
				)

				// Create database record with storage path
				file = await fileRepo.createFile(ctx.db, {
					name: input.fileName,
					type: fileType,
					storagePath: storageResult.relativePath,
					fileSize: storageResult.size,
					mimeType: input.mimeType,
					workspaceId: workspace.id,
					folderId: input.folderId,
					createdBy: userId,
				})

				return {
					fileId: file.publicId,
					url: getFileUrl(storageResult.relativePath),
					size: storageResult.size,
					storageType: 'local' as const,
				}
			} else {
				// Text files: Store in database
				const content = buffer.toString('utf-8')

				file = await fileRepo.createFile(ctx.db, {
					name: input.fileName,
					type: fileType,
					content,
					fileSize,
					mimeType: input.mimeType,
					workspaceId: workspace.id,
					folderId: input.folderId,
					createdBy: userId,
				})

				return {
					fileId: file.publicId,
					size: fileSize,
					storageType: 'database' as const,
				}
			}
		}),

	// Get file content
	getFile: protectedProcedure
		.input(
			z.object({
				filePublicId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId) {
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})
			}

			// Get file record
			const file = await fileRepo.getFileByPublicId(ctx.db, input.filePublicId)
			if (!file) {
				throw new TRPCError({
					message: 'File not found',
					code: 'NOT_FOUND',
				})
			}

			// If stored locally, return URL
			if (file.storagePath) {
				return {
					name: file.name,
					mimeType: file.mimeType,
					size: file.fileSize,
					url: getFileUrl(file.storagePath),
					storageType: 'local' as const,
				}
			}

			// If stored in database, return content
			if (file.content) {
				return {
					name: file.name,
					mimeType: file.mimeType,
					size: file.fileSize,
					content: file.content,
					storageType: 'database' as const,
				}
			}

			throw new TRPCError({
				message: 'File content not found',
				code: 'NOT_FOUND',
			})
		}),

	// Download file (for local storage files)
	downloadFile: protectedProcedure
		.input(
			z.object({
				filePublicId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId) {
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})
			}

			// Get file record
			const file = await fileRepo.getFileByPublicId(ctx.db, input.filePublicId)
			if (!file) {
				throw new TRPCError({
					message: 'File not found',
					code: 'NOT_FOUND',
				})
			}

			if (!file.storagePath) {
				throw new TRPCError({
					message: 'File is not stored locally',
					code: 'BAD_REQUEST',
				})
			}

			// Read file from local storage
			const buffer = await readFileLocally(file.storagePath)

			return {
				name: file.name,
				mimeType: file.mimeType,
				content: buffer.toString('base64'),
				size: buffer.length,
			}
		}),

	// Delete file
	deleteFile: protectedProcedure
		.input(
			z.object({
				filePublicId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId) {
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})
			}

			// Get file record
			const file = await fileRepo.getFileByPublicId(ctx.db, input.filePublicId)
			if (!file) {
				throw new TRPCError({
					message: 'File not found',
					code: 'NOT_FOUND',
				})
			}

			// Delete from local storage if exists
			if (file.storagePath) {
				await deleteFileLocally(file.storagePath)
			}

			// Delete from database
			await fileRepo.deleteFile(ctx.db, input.filePublicId, userId)

			return {
				success: true,
			}
		}),

	// List files in workspace
	listFiles: protectedProcedure
		.input(
			z.object({
				workspaceId: z.number(),
				folderId: z.number().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId) {
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})
			}

			const files = await fileRepo.getFilesByWorkspace(ctx.db, input.workspaceId)

			// Filter by folder if specified
			const filteredFiles = input.folderId
				? files.filter((f) => f.folderId === input.folderId)
				: files.filter((f) => !f.folderId)

			return filteredFiles.map((file) => ({
				publicId: file.publicId,
				name: file.name,
				mimeType: file.mimeType,
				size: file.fileSize,
				storageType: file.storagePath ? ('local' as const) : ('database' as const),
				url: file.storagePath ? getFileUrl(file.storagePath) : undefined,
				createdAt: file.createdAt,
			}))
		}),
})
