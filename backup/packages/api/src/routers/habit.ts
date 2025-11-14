import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import * as habitRepo from '@kan/db/repository/habit.repo'
import * as workspaceRepo from '@kan/db/repository/workspace.repo'
import {
	habitCategories,
	habitFrequencies,
	habitStatuses,
} from '@kan/db/schema'

import { createTRPCRouter, protectedProcedure } from '../trpc'
import { assertUserInWorkspace } from '../utils/auth'

export const habitRouter = createTRPCRouter({
	create: protectedProcedure
		.meta({
			openapi: {
				summary: 'Create a habit',
				method: 'POST',
				path: '/habits',
				description: 'Creates a new habit for a user',
				tags: ['Habits'],
				protect: true,
			},
		})
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				title: z.string().min(1).max(255),
				description: z.string().max(10000).optional(),
				category: z.enum(habitCategories),
				habitType: z.enum(['build', 'remove']).optional(),
				trackingType: z.enum(['task', 'count', 'time']).optional(),
				frequency: z.enum(habitFrequencies),
				frequencyDetails: z.any().optional(),
				reminderTime: z.string().optional(),
				reminderEnabled: z.boolean().optional(),
				reminders: z.array(z.object({ time: z.string(), enabled: z.boolean() })).optional(),
				scheduleStart: z.string().optional(),
				scheduleEnd: z.string().optional().nullable(),
				linkedGoalPublicId: z.string().min(12).optional(),
				color: z.string().max(7).optional(),
				icon: z.string().max(50).optional(),
				targetCount: z.number().min(1).optional(),
				unit: z.string().max(50).optional(),
				isPublic: z.boolean().optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof habitRepo.create>>>())
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

			// Handle linked goal if provided
			let linkedGoalId: number | undefined
			if (input.linkedGoalPublicId) {
				const goal = await ctx.db.query.goals.findFirst({
					where: (goals, { eq }) =>
						eq(goals.publicId, input.linkedGoalPublicId!),
				})
				if (goal) linkedGoalId = goal.id
			}

			const newHabit = await habitRepo.create(ctx.db, {
				workspaceId: workspace.id,
				userId,
				title: input.title,
				description: input.description,
				category: input.category,
				frequency: input.frequency,
				frequencyDetails: input.frequencyDetails,
				reminderTime: input.reminderTime,
				reminderEnabled: input.reminderEnabled,
				linkedGoalId,
				color: input.color,
				icon: input.icon,
				targetCount: input.targetCount,
				unit: input.unit,
				isPublic: input.isPublic,
				tags: input.tags,
			})

			return newHabit
		}),

	getByPublicId: protectedProcedure
		.meta({
			openapi: {
				summary: 'Get habit by public ID',
				method: 'GET',
				path: '/habits/{publicId}',
				description: 'Retrieves a habit by its public ID',
				tags: ['Habits'],
				protect: true,
			},
		})
		.input(
			z.object({
				publicId: z.string().min(12),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof habitRepo.getByPublicId>>>())
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const habit = await habitRepo.getByPublicId(ctx.db, input.publicId)

			if (!habit)
				throw new TRPCError({
					message: 'Habit not found',
					code: 'NOT_FOUND',
				})

			// Check if user has access (either owner or workspace member)
			if (habit.userId !== userId) {
				await assertUserInWorkspace(ctx.db, userId, habit.workspace.id)
			}

			return habit
		}),

	getAllByWorkspace: protectedProcedure
		.meta({
			openapi: {
				summary: 'Get all habits for a workspace',
				method: 'GET',
				path: '/workspaces/{workspacePublicId}/habits',
				description: 'Retrieves all habits for a user in a workspace',
				tags: ['Habits'],
				protect: true,
			},
		})
		.input(
			z.object({
				workspacePublicId: z.string().min(12),
				status: z.enum(habitStatuses).optional(),
				category: z.enum(habitCategories).optional(),
			}),
		)
		.output(
			z.custom<Awaited<ReturnType<typeof habitRepo.getAllByUserAndWorkspace>>>(),
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

			const habits = await habitRepo.getAllByUserAndWorkspace(
				ctx.db,
				userId,
				workspace.id,
				{
					status: input.status,
					category: input.category,
				},
			)

			return habits
		}),

	update: protectedProcedure
		.meta({
			openapi: {
				summary: 'Update a habit',
				method: 'PATCH',
				path: '/habits/{publicId}',
				description: 'Updates a habit',
				tags: ['Habits'],
				protect: true,
			},
		})
		.input(
			z.object({
				publicId: z.string().min(12),
				title: z.string().min(1).max(255).optional(),
				description: z.string().max(10000).optional(),
				category: z.enum(habitCategories).optional(),
				frequency: z.enum(habitFrequencies).optional(),
				frequencyDetails: z.any().optional(),
				reminderTime: z.string().optional(),
				reminderEnabled: z.boolean().optional(),
				status: z.enum(habitStatuses).optional(),
				color: z.string().max(7).optional(),
				icon: z.string().max(50).optional(),
				targetCount: z.number().min(1).optional(),
				unit: z.string().max(50).optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof habitRepo.update>>>())
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const habit = await habitRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.publicId,
			)

			if (!habit)
				throw new TRPCError({
					message: 'Habit not found',
					code: 'NOT_FOUND',
				})

			// Check if user is the owner
			if (habit.userId !== userId)
				throw new TRPCError({
					message: 'Not authorized to update this habit',
					code: 'FORBIDDEN',
				})

			const updatedHabit = await habitRepo.update(ctx.db, {
				publicId: input.publicId,
				title: input.title,
				description: input.description,
				category: input.category,
				frequency: input.frequency,
				frequencyDetails: input.frequencyDetails,
				reminderTime: input.reminderTime,
				reminderEnabled: input.reminderEnabled,
				status: input.status,
				color: input.color,
				icon: input.icon,
				targetCount: input.targetCount,
				unit: input.unit,
				tags: input.tags,
			})

			return updatedHabit
		}),

	delete: protectedProcedure
		.meta({
			openapi: {
				summary: 'Delete a habit',
				method: 'DELETE',
				path: '/habits/{publicId}',
				description: 'Soft deletes a habit',
				tags: ['Habits'],
				protect: true,
			},
		})
		.input(
			z.object({
				publicId: z.string().min(12),
			}),
		)
		.output(z.custom<Awaited<ReturnType<typeof habitRepo.softDelete>>>())
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const habit = await habitRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.publicId,
			)

			if (!habit)
				throw new TRPCError({
					message: 'Habit not found',
					code: 'NOT_FOUND',
				})

			// Check if user is the owner
			if (habit.userId !== userId)
				throw new TRPCError({
					message: 'Not authorized to delete this habit',
					code: 'FORBIDDEN',
				})

			const deletedHabit = await habitRepo.softDelete(
				ctx.db,
				input.publicId,
				userId,
			)

			return deletedHabit
		}),

	// Completion operations
	recordCompletion: protectedProcedure
		.input(
			z.object({
				habitPublicId: z.string().min(12),
				count: z.number().min(1).optional(),
				notes: z.string().max(10000).optional(),
				mood: z.string().max(50).optional(),
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

			const habit = await habitRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.habitPublicId,
			)

			if (!habit)
				throw new TRPCError({
					message: 'Habit not found',
					code: 'NOT_FOUND',
				})

			// Check if user is the owner
			if (habit.userId !== userId)
				throw new TRPCError({
					message: 'Not authorized to record completion for this habit',
					code: 'FORBIDDEN',
				})

			let linkedCardId: number | undefined
			if (input.linkedCardPublicId) {
				const card = await ctx.db.query.cards.findFirst({
					where: (cards, { eq }) =>
						eq(cards.publicId, input.linkedCardPublicId!),
				})
				if (card) linkedCardId = card.id
			}

			const completion = await habitRepo.recordCompletion(ctx.db, {
				habitId: habit.id,
				count: input.count,
				notes: input.notes,
				mood: input.mood,
				linkedCardId,
				createdBy: userId,
			})

			return completion
		}),

	deleteCompletion: protectedProcedure
		.input(
			z.object({
				completionPublicId: z.string().min(12),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const result = await habitRepo.deleteCompletion(
				ctx.db,
				input.completionPublicId,
			)

			return result
		}),

	getCompletionsByDateRange: protectedProcedure
		.input(
			z.object({
				habitPublicId: z.string().min(12),
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

			const habit = await habitRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.habitPublicId,
			)

			if (!habit)
				throw new TRPCError({
					message: 'Habit not found',
					code: 'NOT_FOUND',
				})

			const completions = await habitRepo.getCompletionsByDateRange(
				ctx.db,
				habit.id,
				new Date(input.startDate),
				new Date(input.endDate),
			)

			return completions
		}),

	isCompletedToday: protectedProcedure
		.input(
			z.object({
				habitPublicId: z.string().min(12),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const habit = await habitRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.habitPublicId,
			)

			if (!habit)
				throw new TRPCError({
					message: 'Habit not found',
					code: 'NOT_FOUND',
				})

			const isCompleted = await habitRepo.isCompletedToday(ctx.db, habit.id)

			return { isCompleted }
		}),

	// Card linking
	linkCard: protectedProcedure
		.input(
			z.object({
				habitPublicId: z.string().min(12),
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

			const habit = await habitRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.habitPublicId,
			)

			if (!habit)
				throw new TRPCError({
					message: 'Habit not found',
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

			await habitRepo.linkCard(ctx.db, habit.id, card.id)

			return { success: true }
		}),

	unlinkCard: protectedProcedure
		.input(
			z.object({
				habitPublicId: z.string().min(12),
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

			const habit = await habitRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.habitPublicId,
			)

			if (!habit)
				throw new TRPCError({
					message: 'Habit not found',
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

			await habitRepo.unlinkCard(ctx.db, habit.id, card.id)

			return { success: true }
		}),

	// Note operations
	createNote: protectedProcedure
		.input(
			z.object({
				habitPublicId: z.string().min(12),
				date: z.string().datetime(),
				note: z.string().min(1).max(10000),
				mood: z.string().max(50).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const habit = await habitRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.habitPublicId,
			)

			if (!habit)
				throw new TRPCError({
					message: 'Habit not found',
					code: 'NOT_FOUND',
				})

			const note = await habitRepo.createNote(ctx.db, {
				habitId: habit.id,
				date: new Date(input.date),
				note: input.note,
				mood: input.mood,
				createdBy: userId,
			})

			return note
		}),

	getNotes: protectedProcedure
		.input(
			z.object({
				habitPublicId: z.string().min(12),
			}),
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.user?.id

			if (!userId)
				throw new TRPCError({
					message: 'User not authenticated',
					code: 'UNAUTHORIZED',
				})

			const habit = await habitRepo.getWorkspaceIdByPublicId(
				ctx.db,
				input.habitPublicId,
			)

			if (!habit)
				throw new TRPCError({
					message: 'Habit not found',
					code: 'NOT_FOUND',
				})

			const notes = await habitRepo.getNotesByHabitId(ctx.db, habit.id)

			return notes
		}),

	// Template operations
	getAllTemplates: protectedProcedure
		.meta({
			openapi: {
				summary: 'Get all habit templates',
				method: 'GET',
				path: '/habits/templates',
				description: 'Retrieves all public habit templates',
				tags: ['Habits'],
				protect: true,
			},
		})
		.query(async ({ ctx }) => {
			const templates = await habitRepo.getAllTemplates(ctx.db)
			return templates
		}),

	createFromTemplate: protectedProcedure
		.input(
			z.object({
				templatePublicId: z.string().min(12),
				workspacePublicId: z.string().min(12),
				title: z.string().min(1).max(255).optional(),
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

			const template = await ctx.db.query.habitTemplates.findFirst({
				where: (templates, { eq }) =>
					eq(templates.publicId, input.templatePublicId),
			})

			if (!template)
				throw new TRPCError({
					message: 'Template not found',
					code: 'NOT_FOUND',
				})

			// Increment template usage
			await habitRepo.incrementTemplateUsage(ctx.db, template.publicId)

			// Create habit from template
			const newHabit = await habitRepo.create(ctx.db, {
				workspaceId: workspace.id,
				userId,
				title: input.title || template.name,
				description: template.description ?? undefined,
				category: template.category,
				frequency: template.frequency,
				frequencyDetails: template.frequencyDetails,
				color: template.color ?? undefined,
				icon: template.icon ?? undefined,
				targetCount: template.targetCount ?? undefined,
				unit: template.unit ?? undefined,
			})

			return newHabit
		}),
})
