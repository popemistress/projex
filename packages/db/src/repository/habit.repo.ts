import { and, between, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm'

import type { dbClient } from '@kan/db/client'
import {
	habitCards,
	habitCompletions,
	habitNotes,
	habits,
	habitTemplates,
	type HabitCategory,
	type HabitFrequency,
	type HabitStatus,
} from '@kan/db/schema'
import { generateUID } from '@kan/shared/utils'

// Create a new habit
export const create = async (
	db: dbClient,
	habitInput: {
		workspaceId: number
		userId: string
		title: string
		description?: string
		category: HabitCategory
		frequency: HabitFrequency
		frequencyDetails?: any
		reminderTime?: string
		reminderEnabled?: boolean
		linkedGoalId?: number
		color?: string
		icon?: string
		targetCount?: number
		unit?: string
		isPublic?: boolean
		tags?: string[]
	},
) => {
	const [result] = await db
		.insert(habits)
		.values({
			publicId: generateUID(),
			workspaceId: habitInput.workspaceId,
			userId: habitInput.userId,
			title: habitInput.title,
			description: habitInput.description,
			category: habitInput.category,
			frequency: habitInput.frequency,
			frequencyDetails: habitInput.frequencyDetails,
			reminderTime: habitInput.reminderTime,
			reminderEnabled: habitInput.reminderEnabled ?? false,
			linkedGoalId: habitInput.linkedGoalId,
			color: habitInput.color ?? '#3b82f6',
			icon: habitInput.icon,
			targetCount: habitInput.targetCount ?? 1,
			unit: habitInput.unit,
			isPublic: habitInput.isPublic ?? false,
			tags: habitInput.tags,
			status: 'active',
		})
		.returning()

	return result
}

// Get habit by public ID
export const getByPublicId = async (db: dbClient, publicId: string) => {
	return db.query.habits.findFirst({
		where: and(eq(habits.publicId, publicId), isNull(habits.deletedAt)),
		with: {
			workspace: {
				columns: {
					id: true,
					publicId: true,
					name: true,
				},
			},
			user: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
			linkedGoal: {
				columns: {
					id: true,
					publicId: true,
					title: true,
				},
			},
			completions: {
				orderBy: (completions, { desc }) => [desc(completions.completedAt)],
				limit: 30, // Last 30 completions
			},
		},
	})
}

// Get all habits for a user in a workspace
export const getAllByUserAndWorkspace = async (
	db: dbClient,
	userId: string,
	workspaceId: number,
	options?: {
		status?: HabitStatus
		category?: HabitCategory
	},
) => {
	const conditions = [
		eq(habits.userId, userId),
		eq(habits.workspaceId, workspaceId),
		isNull(habits.deletedAt),
	]

	if (options?.status) {
		conditions.push(eq(habits.status, options.status))
	}

	if (options?.category) {
		conditions.push(eq(habits.category, options.category))
	}

	return db.query.habits.findMany({
		where: and(...conditions),
		orderBy: [desc(habits.createdAt)],
		with: {
			linkedGoal: {
				columns: {
					id: true,
					publicId: true,
					title: true,
				},
			},
		},
	})
}

// Update habit
export const update = async (
	db: dbClient,
	habitInput: {
		publicId: string
		title?: string
		description?: string
		category?: HabitCategory
		frequency?: HabitFrequency
		frequencyDetails?: any
		reminderTime?: string
		reminderEnabled?: boolean
		status?: HabitStatus
		color?: string
		icon?: string
		targetCount?: number
		unit?: string
		tags?: string[]
	},
) => {
	const updateData: any = {
		updatedAt: new Date(),
	}

	if (habitInput.title !== undefined) updateData.title = habitInput.title
	if (habitInput.description !== undefined)
		updateData.description = habitInput.description
	if (habitInput.category !== undefined) updateData.category = habitInput.category
	if (habitInput.frequency !== undefined)
		updateData.frequency = habitInput.frequency
	if (habitInput.frequencyDetails !== undefined)
		updateData.frequencyDetails = habitInput.frequencyDetails
	if (habitInput.reminderTime !== undefined)
		updateData.reminderTime = habitInput.reminderTime
	if (habitInput.reminderEnabled !== undefined)
		updateData.reminderEnabled = habitInput.reminderEnabled
	if (habitInput.status !== undefined) updateData.status = habitInput.status
	if (habitInput.color !== undefined) updateData.color = habitInput.color
	if (habitInput.icon !== undefined) updateData.icon = habitInput.icon
	if (habitInput.targetCount !== undefined)
		updateData.targetCount = habitInput.targetCount
	if (habitInput.unit !== undefined) updateData.unit = habitInput.unit
	if (habitInput.tags !== undefined) updateData.tags = habitInput.tags

	const [result] = await db
		.update(habits)
		.set(updateData)
		.where(and(eq(habits.publicId, habitInput.publicId), isNull(habits.deletedAt)))
		.returning()

	return result
}

// Soft delete habit
export const softDelete = async (
	db: dbClient,
	publicId: string,
	userId: string,
) => {
	const [result] = await db
		.update(habits)
		.set({
			deletedAt: new Date(),
		})
		.where(
			and(
				eq(habits.publicId, publicId),
				eq(habits.userId, userId),
				isNull(habits.deletedAt),
			),
		)
		.returning({ id: habits.id })

	return result
}

// Completion operations
export const recordCompletion = async (
	db: dbClient,
	completionInput: {
		habitId: number
		count?: number
		notes?: string
		mood?: string
		linkedCardId?: number
		createdBy: string
	},
) => {
	const [completion] = await db
		.insert(habitCompletions)
		.values({
			publicId: generateUID(),
			habitId: completionInput.habitId,
			count: completionInput.count ?? 1,
			notes: completionInput.notes,
			mood: completionInput.mood,
			linkedCardId: completionInput.linkedCardId,
			createdBy: completionInput.createdBy,
		})
		.returning()

	// Update habit statistics
	if (completion) {
		await updateHabitStats(db, completionInput.habitId)
	}

	return completion
}

export const deleteCompletion = async (db: dbClient, publicId: string) => {
	const [result] = await db
		.delete(habitCompletions)
		.where(eq(habitCompletions.publicId, publicId))
		.returning({ habitId: habitCompletions.habitId })

	// Update habit statistics
	if (result) {
		await updateHabitStats(db, result.habitId)
	}

	return result
}

// Update habit statistics (streak, total completions, etc.)
const updateHabitStats = async (db: dbClient, habitId: number) => {
	// Get all completions for this habit
	const completions = await db.query.habitCompletions.findMany({
		where: eq(habitCompletions.habitId, habitId),
		orderBy: [desc(habitCompletions.completedAt)],
	})

	const totalCompletions = completions.length

	// Calculate current streak
	let currentStreak = 0
	let longestStreak = 0
	let tempStreak = 0

	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const completionDates = completions.map((c) => {
		const date = new Date(c.completedAt)
		date.setHours(0, 0, 0, 0)
		return date.getTime()
	})

	const uniqueDates = [...new Set(completionDates)].sort((a, b) => b - a)

	for (let i = 0; i < uniqueDates.length; i++) {
		const expectedDate = new Date(today)
		expectedDate.setDate(expectedDate.getDate() - i)

		if (uniqueDates[i] === expectedDate.getTime()) {
			currentStreak++
			tempStreak++
		} else {
			break
		}
	}

	// Calculate longest streak
	tempStreak = 1
	for (let i = 1; i < uniqueDates.length; i++) {
		const prevDate = uniqueDates[i - 1]
		const currDate = uniqueDates[i]
		if (prevDate && currDate) {
			const dayDiff = (prevDate - currDate) / (1000 * 60 * 60 * 24)
			if (dayDiff === 1) {
				tempStreak++
				longestStreak = Math.max(longestStreak, tempStreak)
			} else {
				tempStreak = 1
			}
		}
	}
	longestStreak = Math.max(longestStreak, currentStreak)

	// Update habit
	await db
		.update(habits)
		.set({
			streakCount: currentStreak,
			longestStreak: longestStreak,
			totalCompletions: totalCompletions,
			updatedAt: new Date(),
		})
		.where(eq(habits.id, habitId))
}

// Get completions for a date range
export const getCompletionsByDateRange = async (
	db: dbClient,
	habitId: number,
	startDate: Date,
	endDate: Date,
) => {
	return db.query.habitCompletions.findMany({
		where: and(
			eq(habitCompletions.habitId, habitId),
			gte(habitCompletions.completedAt, startDate),
			lte(habitCompletions.completedAt, endDate),
		),
		orderBy: [desc(habitCompletions.completedAt)],
	})
}

// Check if habit was completed today
export const isCompletedToday = async (db: dbClient, habitId: number) => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const tomorrow = new Date(today)
	tomorrow.setDate(tomorrow.getDate() + 1)

	const completions = await db.query.habitCompletions.findMany({
		where: and(
			eq(habitCompletions.habitId, habitId),
			gte(habitCompletions.completedAt, today),
			lte(habitCompletions.completedAt, tomorrow),
		),
	})

	return completions.length > 0
}

// Link/unlink cards
export const linkCard = async (
	db: dbClient,
	habitId: number,
	cardId: number,
) => {
	await db.insert(habitCards).values({
		habitId,
		cardId,
	})
}

export const unlinkCard = async (
	db: dbClient,
	habitId: number,
	cardId: number,
) => {
	await db
		.delete(habitCards)
		.where(and(eq(habitCards.habitId, habitId), eq(habitCards.cardId, cardId)))
}

// Note operations
export const createNote = async (
	db: dbClient,
	noteInput: {
		habitId: number
		date: Date
		note: string
		mood?: string
		createdBy: string
	},
) => {
	const [result] = await db
		.insert(habitNotes)
		.values({
			publicId: generateUID(),
			habitId: noteInput.habitId,
			date: noteInput.date,
			note: noteInput.note,
			mood: noteInput.mood,
			createdBy: noteInput.createdBy,
		})
		.returning()

	return result
}

export const getNotesByHabitId = async (db: dbClient, habitId: number) => {
	return db.query.habitNotes.findMany({
		where: eq(habitNotes.habitId, habitId),
		orderBy: [desc(habitNotes.date)],
		with: {
			createdBy: {
				columns: {
					id: true,
					name: true,
					image: true,
				},
			},
		},
	})
}

// Template operations
export const createTemplate = async (
	db: dbClient,
	templateInput: {
		name: string
		description?: string
		category: HabitCategory
		frequency: HabitFrequency
		frequencyDetails?: any
		icon?: string
		color?: string
		targetCount?: number
		unit?: string
		isPublic?: boolean
		createdBy: string
	},
) => {
	const [result] = await db
		.insert(habitTemplates)
		.values({
			publicId: generateUID(),
			name: templateInput.name,
			description: templateInput.description,
			category: templateInput.category,
			frequency: templateInput.frequency,
			frequencyDetails: templateInput.frequencyDetails,
			icon: templateInput.icon,
			color: templateInput.color,
			targetCount: templateInput.targetCount ?? 1,
			unit: templateInput.unit,
			isPublic: templateInput.isPublic ?? true,
			createdBy: templateInput.createdBy,
		})
		.returning()

	return result
}

export const getAllTemplates = async (db: dbClient) => {
	return db.query.habitTemplates.findMany({
		where: eq(habitTemplates.isPublic, true),
		orderBy: [desc(habitTemplates.usageCount)],
	})
}

export const incrementTemplateUsage = async (db: dbClient, publicId: string) => {
	await db
		.update(habitTemplates)
		.set({
			usageCount: sql`${habitTemplates.usageCount} + 1`,
		})
		.where(eq(habitTemplates.publicId, publicId))
}

// Get workspace ID by habit public ID
export const getWorkspaceIdByPublicId = async (
	db: dbClient,
	publicId: string,
) => {
	const result = await db.query.habits.findFirst({
		columns: { id: true, workspaceId: true, userId: true },
		where: and(eq(habits.publicId, publicId), isNull(habits.deletedAt)),
	})

	return result
}
