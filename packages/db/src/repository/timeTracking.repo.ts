import { and, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm'

import type { dbClient } from '@kan/db/client'
import {
	cardTimeEstimates,
	pomodoroSessions,
	timeBlocks,
	timeEntries,
	type TimeEntryType,
} from '@kan/db/schema'
import { generateUID } from '@kan/shared/utils'

// Time Entry operations
export const createTimeEntry = async (
	db: dbClient,
	entryInput: {
		workspaceId: number
		userId: string
		type: TimeEntryType
		description?: string
		startTime: Date
		endTime?: Date
		isBillable?: boolean
		hourlyRate?: number
		cardId?: number
		goalId?: number
		habitId?: number
		tags?: string[]
		metadata?: any
	},
) => {
	const duration = entryInput.endTime
		? Math.floor(
				(entryInput.endTime.getTime() - entryInput.startTime.getTime()) / 1000,
		  )
		: null

	const [result] = await db
		.insert(timeEntries)
		.values({
			publicId: generateUID(),
			workspaceId: entryInput.workspaceId,
			userId: entryInput.userId,
			type: entryInput.type,
			description: entryInput.description,
			startTime: entryInput.startTime,
			endTime: entryInput.endTime,
			duration: duration,
			isBillable: entryInput.isBillable ?? false,
			hourlyRate: entryInput.hourlyRate,
			cardId: entryInput.cardId,
			goalId: entryInput.goalId,
			habitId: entryInput.habitId,
			tags: entryInput.tags,
			metadata: entryInput.metadata,
		})
		.returning()

	return result
}

export const stopTimeEntry = async (
	db: dbClient,
	publicId: string,
	endTime: Date,
) => {
	const entry = await db.query.timeEntries.findFirst({
		where: and(eq(timeEntries.publicId, publicId), isNull(timeEntries.deletedAt)),
	})

	if (!entry) return null

	const duration = Math.floor(
		(endTime.getTime() - entry.startTime.getTime()) / 1000,
	)

	const [result] = await db
		.update(timeEntries)
		.set({
			endTime,
			duration,
			updatedAt: new Date(),
		})
		.where(eq(timeEntries.publicId, publicId))
		.returning()

	return result
}

export const getTimeEntriesByDateRange = async (
	db: dbClient,
	userId: string,
	workspaceId: number,
	startDate: Date,
	endDate: Date,
) => {
	return db.query.timeEntries.findMany({
		where: and(
			eq(timeEntries.userId, userId),
			eq(timeEntries.workspaceId, workspaceId),
			gte(timeEntries.startTime, startDate),
			lte(timeEntries.startTime, endDate),
			isNull(timeEntries.deletedAt),
		),
		orderBy: [desc(timeEntries.startTime)],
		with: {
			card: {
				columns: {
					id: true,
					publicId: true,
					title: true,
				},
			},
			goal: {
				columns: {
					id: true,
					publicId: true,
					title: true,
				},
			},
			habit: {
				columns: {
					id: true,
					publicId: true,
					title: true,
				},
			},
		},
	})
}

export const getActiveTimeEntry = async (
	db: dbClient,
	userId: string,
	workspaceId: number,
) => {
	return db.query.timeEntries.findFirst({
		where: and(
			eq(timeEntries.userId, userId),
			eq(timeEntries.workspaceId, workspaceId),
			isNull(timeEntries.endTime),
			isNull(timeEntries.deletedAt),
		),
		with: {
			card: {
				columns: {
					id: true,
					publicId: true,
					title: true,
				},
			},
		},
	})
}

export const deleteTimeEntry = async (db: dbClient, publicId: string) => {
	const [result] = await db
		.update(timeEntries)
		.set({
			deletedAt: new Date(),
		})
		.where(eq(timeEntries.publicId, publicId))
		.returning({ id: timeEntries.id })

	return result
}

// Pomodoro Session operations
export const createPomodoroSession = async (
	db: dbClient,
	sessionInput: {
		workspaceId: number
		userId: string
		cardId?: number
		duration?: number
		breakDuration?: number
		targetPomodoros?: number
	},
) => {
	const [result] = await db
		.insert(pomodoroSessions)
		.values({
			publicId: generateUID(),
			workspaceId: sessionInput.workspaceId,
			userId: sessionInput.userId,
			cardId: sessionInput.cardId,
			duration: sessionInput.duration ?? 1500,
			breakDuration: sessionInput.breakDuration ?? 300,
			targetPomodoros: sessionInput.targetPomodoros ?? 4,
			startTime: new Date(),
		})
		.returning()

	return result
}

export const updatePomodoroSession = async (
	db: dbClient,
	publicId: string,
	updates: {
		completedPomodoros?: number
		endTime?: Date
		isCompleted?: boolean
		notes?: string
	},
) => {
	const [result] = await db
		.update(pomodoroSessions)
		.set(updates)
		.where(eq(pomodoroSessions.publicId, publicId))
		.returning()

	return result
}

export const getActivePomodoroSession = async (
	db: dbClient,
	userId: string,
	workspaceId: number,
) => {
	return db.query.pomodoroSessions.findFirst({
		where: and(
			eq(pomodoroSessions.userId, userId),
			eq(pomodoroSessions.workspaceId, workspaceId),
			eq(pomodoroSessions.isCompleted, false),
		),
		orderBy: [desc(pomodoroSessions.startTime)],
	})
}

// Card Time Estimate operations
export const setCardTimeEstimate = async (
	db: dbClient,
	cardId: number,
	estimatedMinutes: number,
	createdBy: string,
) => {
	const existing = await db.query.cardTimeEstimates.findFirst({
		where: eq(cardTimeEstimates.cardId, cardId),
	})

	if (existing) {
		const [result] = await db
			.update(cardTimeEstimates)
			.set({
				estimatedMinutes,
				updatedAt: new Date(),
			})
			.where(eq(cardTimeEstimates.cardId, cardId))
			.returning()
		return result
	}

	const [result] = await db
		.insert(cardTimeEstimates)
		.values({
			cardId,
			estimatedMinutes,
			createdBy,
		})
		.returning()

	return result
}

export const updateCardActualTime = async (
	db: dbClient,
	cardId: number,
	additionalMinutes: number,
) => {
	await db
		.update(cardTimeEstimates)
		.set({
			actualMinutes: sql`${cardTimeEstimates.actualMinutes} + ${additionalMinutes}`,
			updatedAt: new Date(),
		})
		.where(eq(cardTimeEstimates.cardId, cardId))
}

export const getCardTimeEstimate = async (db: dbClient, cardId: number) => {
	return db.query.cardTimeEstimates.findFirst({
		where: eq(cardTimeEstimates.cardId, cardId),
	})
}

// Time Block operations
export const createTimeBlock = async (
	db: dbClient,
	blockInput: {
		workspaceId: number
		userId: string
		title: string
		description?: string
		startTime: Date
		endTime: Date
		cardId?: number
		goalId?: number
		color?: string
		isRecurring?: boolean
		recurrenceRule?: any
		createdBy: string
	},
) => {
	const [result] = await db
		.insert(timeBlocks)
		.values({
			publicId: generateUID(),
			workspaceId: blockInput.workspaceId,
			userId: blockInput.userId,
			title: blockInput.title,
			description: blockInput.description,
			startTime: blockInput.startTime,
			endTime: blockInput.endTime,
			cardId: blockInput.cardId,
			goalId: blockInput.goalId,
			color: blockInput.color ?? '#3b82f6',
			isRecurring: blockInput.isRecurring ?? false,
			recurrenceRule: blockInput.recurrenceRule,
			createdBy: blockInput.createdBy,
		})
		.returning()

	return result
}

export const getTimeBlocksByDateRange = async (
	db: dbClient,
	userId: string,
	workspaceId: number,
	startDate: Date,
	endDate: Date,
) => {
	return db.query.timeBlocks.findMany({
		where: and(
			eq(timeBlocks.userId, userId),
			eq(timeBlocks.workspaceId, workspaceId),
			gte(timeBlocks.startTime, startDate),
			lte(timeBlocks.endTime, endDate),
			isNull(timeBlocks.deletedAt),
		),
		orderBy: [timeBlocks.startTime],
		with: {
			card: {
				columns: {
					id: true,
					publicId: true,
					title: true,
				},
			},
			goal: {
				columns: {
					id: true,
					publicId: true,
					title: true,
				},
			},
		},
	})
}

export const updateTimeBlock = async (
	db: dbClient,
	publicId: string,
	updates: {
		title?: string
		description?: string
		startTime?: Date
		endTime?: Date
		color?: string
	},
) => {
	const updateData: any = {
		updatedAt: new Date(),
	}

	if (updates.title !== undefined) updateData.title = updates.title
	if (updates.description !== undefined)
		updateData.description = updates.description
	if (updates.startTime !== undefined) updateData.startTime = updates.startTime
	if (updates.endTime !== undefined) updateData.endTime = updates.endTime
	if (updates.color !== undefined) updateData.color = updates.color

	const [result] = await db
		.update(timeBlocks)
		.set(updateData)
		.where(eq(timeBlocks.publicId, publicId))
		.returning()

	return result
}

export const deleteTimeBlock = async (db: dbClient, publicId: string) => {
	const [result] = await db
		.update(timeBlocks)
		.set({
			deletedAt: new Date(),
		})
		.where(eq(timeBlocks.publicId, publicId))
		.returning({ id: timeBlocks.id })

	return result
}

// Analytics
export const getTotalTimeByCard = async (
	db: dbClient,
	cardId: number,
	startDate?: Date,
	endDate?: Date,
) => {
	const conditions = [eq(timeEntries.cardId, cardId), isNull(timeEntries.deletedAt)]

	if (startDate) {
		conditions.push(gte(timeEntries.startTime, startDate))
	}

	if (endDate) {
		conditions.push(lte(timeEntries.startTime, endDate))
	}

	const result = await db
		.select({
			totalSeconds: sql<number>`COALESCE(SUM(${timeEntries.duration}), 0)`,
		})
		.from(timeEntries)
		.where(and(...conditions))

	return result[0]?.totalSeconds ?? 0
}

export const getTotalTimeByGoal = async (
	db: dbClient,
	goalId: number,
	startDate?: Date,
	endDate?: Date,
) => {
	const conditions = [eq(timeEntries.goalId, goalId), isNull(timeEntries.deletedAt)]

	if (startDate) {
		conditions.push(gte(timeEntries.startTime, startDate))
	}

	if (endDate) {
		conditions.push(lte(timeEntries.startTime, endDate))
	}

	const result = await db
		.select({
			totalSeconds: sql<number>`COALESCE(SUM(${timeEntries.duration}), 0)`,
		})
		.from(timeEntries)
		.where(and(...conditions))

	return result[0]?.totalSeconds ?? 0
}
