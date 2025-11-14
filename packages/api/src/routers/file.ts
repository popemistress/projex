import { TRPCError } from '@trpc/server'
import { eq, and, isNull } from 'drizzle-orm'
import { z } from 'zod'

import * as fileRepo from '@kan/db/repository/file.repo'
import * as workspaceRepo from '@kan/db/repository/workspace.repo'
import { fileTypes } from '@kan/db/schema'

import { createTRPCRouter, protectedProcedure } from '../trpc'
import { assertUserInWorkspace } from '../utils/auth'

export const fileRouter = createTRPCRouter({
	// Get all files in a workspace
	all: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
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

			await assertUserInWorkspace(ctx.db, userId, workspace.id)

			if (input.folderId) {
				return fileRepo.getFilesByFolder(ctx.db, input.folderId)
			}

			// Return only root files (files without a folder)
			return fileRepo.getRootFilesByWorkspace(ctx.db, workspace.id)
		}),

	// Get a single file
	byId: protectedProcedure
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

			const file = await fileRepo.getFileByPublicId(ctx.db, input.filePublicId)
			if (!file) {
				throw new TRPCError({
					message: 'File not found',
					code: 'NOT_FOUND',
				})
			}

			await assertUserInWorkspace(ctx.db, userId, file.workspaceId)

			return file
		}),

	// Create a file
	create: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				name: z.string().min(1),
				type: z.enum(fileTypes),
				content: z.string().optional(),
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

			await assertUserInWorkspace(ctx.db, userId, workspace.id)

			const file = await fileRepo.createFile(ctx.db, {
				name: input.name,
				type: input.type,
				content: input.content,
				folderId: input.folderId,
				workspaceId: workspace.id,
				createdBy: userId,
			})

			return file
		}),

	// Update a file
	update: protectedProcedure
		.input(
			z.object({
				filePublicId: z.string(),
				name: z.string().optional(),
				content: z.string().optional(),
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

			const file = await fileRepo.getFileByPublicId(ctx.db, input.filePublicId)
			if (!file) {
				throw new TRPCError({
					message: 'File not found',
					code: 'NOT_FOUND',
				})
			}

			await assertUserInWorkspace(ctx.db, userId, file.workspaceId)

			const updatedFile = await fileRepo.updateFile(
				ctx.db,
				input.filePublicId,
				{
					name: input.name,
					content: input.content,
				}
			)

			return updatedFile
		}),

	// Delete a file
	delete: protectedProcedure
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

			const file = await fileRepo.getFileByPublicId(ctx.db, input.filePublicId)
			if (!file) {
				throw new TRPCError({
					message: 'File not found',
					code: 'NOT_FOUND',
				})
			}

			await assertUserInWorkspace(ctx.db, userId, file.workspaceId)

			await fileRepo.deleteFile(ctx.db, input.filePublicId, userId)

			return { success: true }
		}),
})
