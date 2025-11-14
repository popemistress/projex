import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import * as fileRepo from '@kan/db/repository/file.repo'
import * as workspaceRepo from '@kan/db/repository/workspace.repo'

import { createTRPCRouter, protectedProcedure } from '../trpc'
import { assertUserInWorkspace } from '../utils/auth'

export const folderRouter = createTRPCRouter({
	// Get all folders in a workspace
	all: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
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

			return fileRepo.getFoldersByWorkspace(ctx.db, workspace.id)
		}),

	// Get a single folder with its files
	byId: protectedProcedure
		.input(
			z.object({
				folderPublicId: z.string(),
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

			const folder = await fileRepo.getFolderByPublicId(
				ctx.db,
				input.folderPublicId
			)
			if (!folder) {
				throw new TRPCError({
					message: 'Folder not found',
					code: 'NOT_FOUND',
				})
			}

			await assertUserInWorkspace(ctx.db, userId, folder.workspaceId)

			return folder
		}),

	// Create a folder
	create: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				name: z.string().min(1),
				parentId: z.number().optional(),
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

			const folder = await fileRepo.createFolder(ctx.db, {
				name: input.name,
				parentId: input.parentId,
				workspaceId: workspace.id,
				createdBy: userId,
			})

			return folder
		}),

	// Update a folder
	update: protectedProcedure
		.input(
			z.object({
				folderPublicId: z.string(),
				name: z.string().optional(),
				color: z.string().nullable().optional(),
				isExpanded: z.boolean().optional(),
				index: z.number().optional(),
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

			const folder = await fileRepo.getFolderByPublicId(
				ctx.db,
				input.folderPublicId
			)
			if (!folder) {
				throw new TRPCError({
					message: 'Folder not found',
					code: 'NOT_FOUND',
				})
			}

			await assertUserInWorkspace(ctx.db, userId, folder.workspaceId)

			const updatedFolder = await fileRepo.updateFolder(
				ctx.db,
				input.folderPublicId,
				{
					name: input.name,
					color: input.color,
					isExpanded: input.isExpanded,
					index: input.index,
				}
			)

			return updatedFolder
		}),

	// Delete a folder
	delete: protectedProcedure
		.input(
			z.object({
				folderPublicId: z.string(),
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

			const folder = await fileRepo.getFolderByPublicId(
				ctx.db,
				input.folderPublicId
			)
			if (!folder) {
				throw new TRPCError({
					message: 'Folder not found',
					code: 'NOT_FOUND',
				})
			}

			await assertUserInWorkspace(ctx.db, userId, folder.workspaceId)

			await fileRepo.deleteFolder(ctx.db, input.folderPublicId, userId)

			return { success: true }
		}),
})
