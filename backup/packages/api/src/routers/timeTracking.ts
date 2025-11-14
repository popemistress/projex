import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import * as timeTrackingRepo from '@kan/db/repository/timeTracking.repo'
import * as workspaceRepo from '@kan/db/repository/workspace.repo'
import { timeEntryTypes } from '@kan/db/schema'

import { createTRPCRouter, protectedProcedure } from '../trpc'
import { assertUserInWorkspace } from '../utils/auth'

export const timeTrackingRouter = createTRPCRouter({
	// Time Entry operations
	startTimeEntry: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				type: z.enum(timeEntryTypes),
				description: z.string().max(1000).optional(),
				cardPublicId: z.string().min(12).optional(),
				goalPublicId: z.string().min(12).optional(),
				habitPublicId: z.string().min(12).optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
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
					message: 'Workspace not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, workspace.id)

			// Check if there's already an active entry
			const activeEntry = await timeTrackingRepo.getActiveTimeEntry(
				ctx.db,
				userId,
				workspace.id,
			)

			if (activeEntry)
				throw new TRPCError({
					message: 'You already have an active time entry',
					code: 'BAD_REQUEST',
				})

			// Resolve related entities
			let cardId: number | undefined
			let goalId: number | undefined
			let habitId: number | undefined

			if (input.cardPublicId) {
				const card = await ctx.db.query.cards.findFirst({
					where: (cards, { eq }) => eq(cards.publicId, input.cardPublicId!),
				})
				if (card) cardId = card.id
			}

			if (input.goalPublicId) {
				const goal = await ctx.db.query.goals.findFirst({
					where: (goals, { eq }) => eq(goals.publicId, input.goalPublicId!),
				})
				if (goal) goalId = goal.id
			}

			if (input.habitPublicId) {
				const habit = await ctx.db.query.habits.findFirst({
					where: (habits, { eq }) => eq(habits.publicId, input.habitPublicId!),
				})
				if (habit) habitId = habit.id
			}

			const entry = await timeTrackingRepo.createTimeEntry(ctx.db, {
				workspaceId: workspace.id,
				userId,
				type: input.type,
				description: input.description,
				startTime: new Date(),
				cardId,
				goalId,
				habitId,
				tags: input.tags,
			})

			return entry
		}),

	stopTimeEntry: protectedProcedure
		.input(
			z.object({
				publicId: z.string().min(12),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const entry = await timeTrackingRepo.stopTimeEntry(
				ctx.db,
				input.publicId,
				new Date(),
			)

			if (!entry)
				throw new TRPCError({
					message: 'Time entry not found',
					code: 'NOT_FOUND',
				})

			return entry
		}),

	getActiveTimeEntry: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
			}),
		)
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

			const entry = await timeTrackingRepo.getActiveTimeEntry(
				ctx.db,
				userId,
				workspace.id,
			)

			return entry
		}),

	getTimeEntriesByDateRange: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				startDate: z.string().datetime(),
				endDate: z.string().datetime(),
			}),
		)
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

			const entries = await timeTrackingRepo.getTimeEntriesByDateRange(
				ctx.db,
				userId,
				workspace.id,
				new Date(input.startDate),
				new Date(input.endDate),
			)

			return entries
		}),

	deleteTimeEntry: protectedProcedure
		.input(
			z.object({
				publicId: z.string().min(12),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const result = await timeTrackingRepo.deleteTimeEntry(
				ctx.db,
				input.publicId,
			)

			return result
		}),

	// Pomodoro operations
	startPomodoroSession: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				cardPublicId: z.string().min(12).optional(),
				duration: z.number().min(60).max(3600).optional(),
				breakDuration: z.number().min(60).max(1800).optional(),
				targetPomodoros: z.number().min(1).max(12).optional(),
			}),
		)
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
					message: 'Workspace not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, workspace.id)

			let cardId: number | undefined
			if (input.cardPublicId) {
				const card = await ctx.db.query.cards.findFirst({
					where: (cards, { eq }) => eq(cards.publicId, input.cardPublicId!),
				})
				if (card) cardId = card.id
			}

			const session = await timeTrackingRepo.createPomodoroSession(ctx.db, {
				workspaceId: workspace.id,
				userId,
				cardId,
				duration: input.duration,
				breakDuration: input.breakDuration,
				targetPomodoros: input.targetPomodoros,
			})

			return session
		}),

	updatePomodoroSession: protectedProcedure
		.input(
			z.object({
				publicId: z.string().min(12),
				completedPomodoros: z.number().min(0).optional(),
				isCompleted: z.boolean().optional(),
				notes: z.string().max(1000).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const updates: any = {}
			if (input.completedPomodoros !== undefined)
				updates.completedPomodoros = input.completedPomodoros
			if (input.isCompleted !== undefined) {
				updates.isCompleted = input.isCompleted
				if (input.isCompleted) updates.endTime = new Date()
			}
			if (input.notes !== undefined) updates.notes = input.notes

			const session = await timeTrackingRepo.updatePomodoroSession(
				ctx.db,
				input.publicId,
				updates,
			)

			return session
		}),

	getActivePomodoroSession: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
			}),
		)
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

			const session = await timeTrackingRepo.getActivePomodoroSession(
				ctx.db,
				userId,
				workspace.id,
			)

			return session
		}),

	// Card time estimates
	setCardTimeEstimate: protectedProcedure
		.input(
			z.object({
				cardPublicId: z.string().min(12),
				estimatedMinutes: z.number().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const card = await ctx.db.query.cards.findFirst({
				where: (cards, { eq }) => eq(cards.publicId, input.cardPublicId),
				with: {
					list: {
						with: {
							board: {
								columns: {
									workspaceId: true,
								},
							},
						},
					},
				},
			})

			if (!card)
				throw new TRPCError({
					message: 'Card not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, card.list.board.workspaceId)

			const estimate = await timeTrackingRepo.setCardTimeEstimate(
				ctx.db,
				card.id,
				input.estimatedMinutes,
				userId,
			)

			return estimate
		}),

	getCardTimeEstimate: protectedProcedure
		.input(
			z.object({
				cardPublicId: z.string().min(12),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const card = await ctx.db.query.cards.findFirst({
				where: (cards, { eq }) => eq(cards.publicId, input.cardPublicId),
			})

			if (!card)
				throw new TRPCError({
					message: 'Card not found',
					code: 'NOT_FOUND',
				})

			const estimate = await timeTrackingRepo.getCardTimeEstimate(
				ctx.db,
				card.id,
			)

			return estimate
		}),

	// Time blocks
	createTimeBlock: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				title: z.string().min(1).max(255),
				description: z.string().max(1000).optional(),
				startTime: z.string().datetime(),
				endTime: z.string().datetime(),
				cardPublicId: z.string().min(12).optional(),
				goalPublicId: z.string().min(12).optional(),
				color: z.string().max(7).optional(),
				isRecurring: z.boolean().optional(),
				recurrenceRule: z.any().optional(),
			}),
		)
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
					message: 'Workspace not found',
					code: 'NOT_FOUND',
				})

			await assertUserInWorkspace(ctx.db, userId, workspace.id)

			let cardId: number | undefined
			let goalId: number | undefined

			if (input.cardPublicId) {
				const card = await ctx.db.query.cards.findFirst({
					where: (cards, { eq }) => eq(cards.publicId, input.cardPublicId!),
				})
				if (card) cardId = card.id
			}

			if (input.goalPublicId) {
				const goal = await ctx.db.query.goals.findFirst({
					where: (goals, { eq }) => eq(goals.publicId, input.goalPublicId!),
				})
				if (goal) goalId = goal.id
			}

			const block = await timeTrackingRepo.createTimeBlock(ctx.db, {
				workspaceId: workspace.id,
				userId,
				title: input.title,
				description: input.description,
				startTime: new Date(input.startTime),
				endTime: new Date(input.endTime),
				cardId,
				goalId,
				color: input.color,
				isRecurring: input.isRecurring,
				recurrenceRule: input.recurrenceRule,
				createdBy: userId,
			})

			return block
		}),

	getTimeBlocksByDateRange: protectedProcedure
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				startDate: z.string().datetime(),
				endDate: z.string().datetime(),
			}),
		)
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

			const blocks = await timeTrackingRepo.getTimeBlocksByDateRange(
				ctx.db,
				userId,
				workspace.id,
				new Date(input.startDate),
				new Date(input.endDate),
			)

			return blocks
		}),

	updateTimeBlock: protectedProcedure
		.input(
			z.object({
				publicId: z.string().min(12),
				title: z.string().min(1).max(255).optional(),
				description: z.string().max(1000).optional(),
				startTime: z.string().datetime().optional(),
				endTime: z.string().datetime().optional(),
				color: z.string().max(7).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const updates: any = {}
			if (input.title !== undefined) updates.title = input.title
			if (input.description !== undefined)
				updates.description = input.description
			if (input.startTime !== undefined)
				updates.startTime = new Date(input.startTime)
			if (input.endTime !== undefined) updates.endTime = new Date(input.endTime)
			if (input.color !== undefined) updates.color = input.color

			const block = await timeTrackingRepo.updateTimeBlock(
				ctx.db,
				input.publicId,
				updates,
			)

			return block
		}),

	deleteTimeBlock: protectedProcedure
		.input(
			z.object({
				publicId: z.string().min(12),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const result = await timeTrackingRepo.deleteTimeBlock(
				ctx.db,
				input.publicId,
			)

			return result
		}),
})
