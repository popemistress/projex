import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import * as goalRepo from '@kan/db/repository/goal.repo'
import * as workspaceRepo from '@kan/db/repository/workspace.repo'
import {
	goalStatuses,
	goalTimeframes,
	goalTypes,
	priorityLevels,
} from '@kan/db/schema'

import { createTRPCRouter, protectedProcedure } from '../trpc'
import { assertUserInWorkspace } from '../utils/auth'

export const goalRouter = createTRPCRouter({
	create: protectedProcedure
		.meta({
			openapi: {
				summary: 'Create a goal',
				method: 'POST',
				path: '/goals',
				description: 'Creates a new goal for a workspace',
				tags: ['Goals'],
				protect: true,
			},
		})
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				title: z.string().min(1).max(255),
				description: z.string().max(10000).optional(),
				goalType: z.enum(goalTypes),
				timeframe: z.enum(goalTimeframes),
				priority: z.enum(priorityLevels),
				startDate: z.string().datetime().optional(),
				targetDate: z.string().datetime().optional(),
				parentGoalPublicId: z.string().min(12).optional(),
				linkedBoardPublicId: z.string().min(12).optional(),
				tags: z.array(z.string()).optional(),
				metrics: z.any().optional(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof goalRepo.create>>>())
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const workspace = await workspaceRepo.getByPublicId(
				ctx.db,
				input.workspacePublicId,
			)

			if (!workspace)
				throw new TRPCError({
					message: `Workspace with public ID ${input.workspacePublicId} not found`,
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, workspace.id)

			// Handle parent goal if provided
			let parentGoalId: number | undefined
			if (input.parentGoalPublicId) {
				const parentGoal = await goalRepo.getWorkspaceIdByPublicId(
					ctx.db,
					input.parentGoalPublicId,
				)
				if (!parentGoal)
					throw new TRPCError({
						message: 'Parent goal not found',
						code: 'NOT_FOUND',
					})
				parentGoalId = parentGoal.id
			}

			// Handle linked board if provided
			let linkedBoardId: number | undefined
			if (input.linkedBoardPublicId) {
				const board = await ctx.db.query.boards.findFirst({
					where: (boards, { eq }) =>
						eq(boards.publicId, input.linkedBoardPublicId!),
				})
				if (!board)
					throw new TRPCError({
						message: 'Linked board not found',
						code: 'NOT_FOUND',
					})
				linkedBoardId = board.id
			}

			const newGoal = await goalRepo.create(ctx.db, {
				workspaceId: workspace.id,
				title: input.title,
				description: input.description,
				goalType: input.goalType,
				timeframe: input.timeframe,
				priority: input.priority,
				startDate: input.startDate ? new Date(input.startDate) : undefined,
				targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
				parentGoalId,
				linkedBoardId,
				tags: input.tags,
				metrics: input.metrics,
				createdBy: userId,
			})

			return newGoal
		}),

	getByPublicId: protectedProcedure
		.meta({
			openapi: {
				summary: 'Get goal by public ID',
				method: 'GET',
				path: '/goals/{publicId}',
				description: 'Retrieves a goal by its public ID',
				tags: ['Goals'],
				protect: true,
			},
		})
		.input(
			z.object({
				publicId: z.string().min(12),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof goalRepo.getByPublicId>>>())
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const goal = await goalRepo.getByPublicId(ctx.db, input.publicId)

			if (!goal)
				throw new TRPCError({
					message: 'Goal not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, goal.workspace.id)

			return goal
		}),

	getAllByWorkspace: protectedProcedure
		.meta({
			openapi: {
				summary: 'Get all goals for a workspace',
				method: 'GET',
				path: '/workspaces/{workspacePublicId}/goals',
				description: 'Retrieves all goals for a workspace',
				tags: ['Goals'],
				protect: true,
			},
		})
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				includeArchived: z.boolean().optional(),
				status: z.enum(goalStatuses).optional(),
				goalType: z.enum(goalTypes).optional(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof goalRepo.getAllByWorkspaceId>>>())
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const workspace = await workspaceRepo.getByPublicId(
				ctx.db,
				input.workspacePublicId,
			)

			if (!workspace)
				throw new TRPCError({
					message: 'Workspace not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, workspace.id)

			const goals = await goalRepo.getAllByWorkspaceId(ctx.db, workspace.id, {
				includeArchived: input.includeArchived,
				status: input.status,
				goalType: input.goalType,
			})

			return goals
		}),

	update: protectedProcedure
		.meta({
			openapi: {
				summary: 'Update a goal',
				method: 'PATCH',
				path: '/goals/{publicId}',
				description: 'Updates a goal',
				tags: ['Goals'],
				protect: true,
			},
		})
		.input(
			z.object({
				publicId: z.string().min(12),
				title: z.string().min(1).max(255).optional(),
				description: z.string().max(10000).optional(),
				status: z.enum(goalStatuses).optional(),
				priority: z.enum(priorityLevels).optional(),
				progress: z.number().min(0).max(100).optional(),
				startDate: z.string().datetime().optional(),
				targetDate: z.string().datetime().optional(),
				completedDate: z.string().datetime().optional(),
				metrics: z.any().optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof goalRepo.update>>>())
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const goal = await goalRepo.getWorkspaceIdByPublicId(ctx.db, input.publicId)

			if (!goal)
				throw new TRPCError({
					message: 'Goal not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, goal.workspaceId)

			const updatedGoal = await goalRepo.update(ctx.db, {
				publicId: input.publicId,
				title: input.title,
				description: input.description,
				status: input.status,
				priority: input.priority,
				progress: input.progress,
				startDate: input.startDate ? new Date(input.startDate) : undefined,
				targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
				completedDate: input.completedDate
					? new Date(input.completedDate)
					: undefined,
				metrics: input.metrics,
				tags: input.tags,
				updatedBy: userId,
			})

			return updatedGoal
		}),

	archive: protectedProcedure
		.meta({
			openapi: {
				summary: 'Archive a goal',
				method: 'POST',
				path: '/goals/{publicId}/archive',
				description: 'Archives a goal',
				tags: ['Goals'],
				protect: true,
			},
		})
		.input(
			z.object({
				publicId: z.string().min(12),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof goalRepo.archive>>>())
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const goal = await goalRepo.getWorkspaceIdByPublicId(ctx.db, input.publicId)

			if (!goal)
				throw new TRPCError({
					message: 'Goal not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, goal.workspaceId)

			const archivedGoal = await goalRepo.archive(ctx.db, input.publicId, userId)

			return archivedGoal
		}),

	delete: protectedProcedure
		.meta({
			openapi: {
				summary: 'Delete a goal',
				method: 'DELETE',
				path: '/goals/{publicId}',
				description: 'Soft deletes a goal',
				tags: ['Goals'],
				protect: true,
			},
		})
		.input(
			z.object({
				publicId: z.string().min(12),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof goalRepo.softDelete>>>())
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const goal = await goalRepo.getWorkspaceIdByPublicId(ctx.db, input.publicId)

			if (!goal)
				throw new TRPCError({
					message: 'Goal not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, goal.workspaceId)

			const deletedGoal = await goalRepo.softDelete(
				ctx.db,
				input.publicId,
				userId,
			)

			return deletedGoal
		}),

	// Milestone operations
	createMilestone: protectedProcedure
		.input(
			z.object({
				goalPublicId: z.string().min(12),
				title: z.string().min(1).max(255),
				description: z.string().max(10000).optional(),
				targetDate: z.string().datetime().optional(),
				linkedCardPublicId: z.string().min(12).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const goal = await goalRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.goalPublicId,
			)

			if (!goal)
				throw new TRPCError({
					message: 'Goal not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, goal.workspaceId)

			let linkedCardId: number | undefined
			if (input.linkedCardPublicId) {
				const card = await ctx.db.query.cards.findFirst({
					where: (cards, { eq }) =>
						eq(cards.publicId, input.linkedCardPublicId!),
				})
				if (card) linkedCardId = card.id
			}

			const milestone = await goalRepo.createMilestone(ctx.db, {
				goalId: goal.id,
				title: input.title,
				description: input.description,
				targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
				linkedCardId,
				createdBy: userId,
			})

			return milestone
		}),

	completeMilestone: protectedProcedure
		.input(
			z.object({
				milestonePublicId: z.string().min(12),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const milestone = await goalRepo.completeMilestone(
				ctx.db,
				input.milestonePublicId,
				userId,
			)

			return milestone
		}),

	// Card linking
	linkCard: protectedProcedure
		.input(
			z.object({
				goalPublicId: z.string().min(12),
				cardPublicId: z.string().min(12),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const goal = await goalRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.goalPublicId,
			)

			if (!goal)
				throw new TRPCError({
					message: 'Goal not found',
					code: 'NOT_FOUND',
				})

			const card = await ctx.db.query.cards.findFirst({
				where: (cards, { eq }) => eq(cards.publicId, input.cardPublicId),
			})

			if (!card)
				throw new TRPCError({
					message: 'Card not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, goal.workspaceId)

			await goalRepo.linkCard(ctx.db, goal.id, card.id, userId)

			return { success: true }
		}),

	unlinkCard: protectedProcedure
		.input(
			z.object({
				goalPublicId: z.string().min(12),
				cardPublicId: z.string().min(12),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const goal = await goalRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.goalPublicId,
			)

			if (!goal)
				throw new TRPCError({
					message: 'Goal not found',
					code: 'NOT_FOUND',
				})

			const card = await ctx.db.query.cards.findFirst({
				where: (cards, { eq }) => eq(cards.publicId, input.cardPublicId),
			})

			if (!card)
				throw new TRPCError({
					message: 'Card not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, goal.workspaceId)

			await goalRepo.unlinkCard(ctx.db, goal.id, card.id, userId)

			return { success: true }
		}),

	// Check-ins
	createCheckIn: protectedProcedure
		.input(
			z.object({
				goalPublicId: z.string().min(12),
				progress: z.number().min(0).max(100),
				notes: z.string().max(10000).optional(),
				mood: z.string().max(50).optional(),
				blockers: z.string().max(10000).optional(),
				wins: z.string().max(10000).optional(),
				nextSteps: z.string().max(10000).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const goal = await goalRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.goalPublicId,
			)

			if (!goal)
				throw new TRPCError({
					message: 'Goal not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, goal.workspaceId)

			const checkIn = await goalRepo.createCheckIn(ctx.db, {
				goalId: goal.id,
				progress: input.progress,
				notes: input.notes,
				mood: input.mood,
				blockers: input.blockers,
				wins: input.wins,
				nextSteps: input.nextSteps,
				createdBy: userId,
			})

			return checkIn
		}),

	getCheckIns: protectedProcedure
		.input(
			z.object({
				goalPublicId: z.string().min(12),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const goal = await goalRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.goalPublicId,
			)

			if (!goal)
				throw new TRPCError({
					message: 'Goal not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, goal.workspaceId)

			const checkIns = await goalRepo.getCheckInsByGoalId(ctx.db, goal.id)

			return checkIns
		}),

	// Activities
	getActivities: protectedProcedure
		.input(
			z.object({
				goalPublicId: z.string().min(12),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const goal = await goalRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.goalPublicId,
			)

			if (!goal)
				throw new TRPCError({
					message: 'Goal not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, goal.workspaceId)

			const activities = await goalRepo.getActivitiesByGoalId(ctx.db, goal.id)

			return activities
		}),
})
