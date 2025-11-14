import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm'

import type { dbClient } from '@kan/db/client'
import {
	goalActivities,
	goalCards,
	goalCheckIns,
	goalMilestones,
	goals,
	type GoalStatus,
	type GoalTimeframe,
	type GoalType,
	type PriorityLevel,
} from '@kan/db/schema'
import { generateUID } from '@kan/shared/utils'

// Create a new goal
export const create = async (
	db: dbClient,
	goalInput: {
		workspaceId: number
		title: string
		description?: string
		goalType: GoalType
		timeframe: GoalTimeframe
		priority: PriorityLevel
		startDate?: Date
		targetDate?: Date
		parentGoalId?: number
		linkedBoardId?: number
		tags?: string[]
		metrics?: any
		createdBy: string
	},
) => {
	const [result] = await db
		.insert(goals)
		.values({
			publicId: generateUID(),
			workspaceId: goalInput.workspaceId,
			title: goalInput.title,
			description: goalInput.description,
			goalType: goalInput.goalType,
			timeframe: goalInput.timeframe,
			priority: goalInput.priority,
			startDate: goalInput.startDate,
			targetDate: goalInput.targetDate,
			parentGoalId: goalInput.parentGoalId,
			linkedBoardId: goalInput.linkedBoardId,
			tags: goalInput.tags,
			metrics: goalInput.metrics,
			createdBy: goalInput.createdBy,
			status: 'not_started',
			progress: 0,
		})
		.returning()

	// Create initial activity
	if (result) {
		await createActivity(db, {
			goalId: result.id,
			type: 'goal.created',
			createdBy: goalInput.createdBy,
		})
	}

	return result
}

// Get goal by public ID
export const getByPublicId = async (db: dbClient, publicId: string) => {
	return db.query.goals.findFirst({
		where: and(eq(goals.publicId, publicId), isNull(goals.deletedAt)),
		with: {
			workspace: {
				columns: {
					id: true,
					publicId: true,
					name: true,
				},
			},
			createdBy: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
			parentGoal: {
				columns: {
					id: true,
					publicId: true,
					title: true,
				},
			},
			subGoals: {
				where: isNull(goals.deletedAt),
				columns: {
					id: true,
					publicId: true,
					title: true,
					status: true,
					progress: true,
				},
			},
			linkedBoard: {
				columns: {
					id: true,
					publicId: true,
					name: true,
				},
			},
			milestones: {
				orderBy: (milestones, { asc }) => [asc(milestones.index)],
			},
			cards: {
				with: {
					card: {
						columns: {
							id: true,
							publicId: true,
							title: true,
						},
					},
				},
			},
		},
	})
}

// Get all goals for a workspace
export const getAllByWorkspaceId = async (
	db: dbClient,
	workspaceId: number,
	options?: {
		includeArchived?: boolean
		status?: GoalStatus
		goalType?: GoalType
	},
) => {
	const conditions = [
		eq(goals.workspaceId, workspaceId),
		isNull(goals.deletedAt),
	]

	if (!options?.includeArchived) {
		conditions.push(eq(goals.isArchived, false))
	}

	if (options?.status) {
		conditions.push(eq(goals.status, options.status))
	}

	if (options?.goalType) {
		conditions.push(eq(goals.goalType, options.goalType))
	}

	return db.query.goals.findMany({
		where: and(...conditions),
		orderBy: [desc(goals.createdAt)],
		with: {
			createdBy: {
				columns: {
					id: true,
					name: true,
					image: true,
				},
			},
			subGoals: {
				where: isNull(goals.deletedAt),
				columns: {
					id: true,
					publicId: true,
					title: true,
					status: true,
					progress: true,
				},
			},
			milestones: true,
		},
	})
}

// Update goal
export const update = async (
	db: dbClient,
	goalInput: {
		publicId: string
		title?: string
		description?: string
		status?: GoalStatus
		priority?: PriorityLevel
		progress?: number
		startDate?: Date
		targetDate?: Date
		completedDate?: Date
		metrics?: any
		tags?: string[]
		updatedBy: string
	},
) => {
	const updateData: any = {
		updatedAt: new Date(),
	}

	if (goalInput.title !== undefined) updateData.title = goalInput.title
	if (goalInput.description !== undefined)
		updateData.description = goalInput.description
	if (goalInput.status !== undefined) updateData.status = goalInput.status
	if (goalInput.priority !== undefined) updateData.priority = goalInput.priority
	if (goalInput.progress !== undefined) updateData.progress = goalInput.progress
	if (goalInput.startDate !== undefined) updateData.startDate = goalInput.startDate
	if (goalInput.targetDate !== undefined)
		updateData.targetDate = goalInput.targetDate
	if (goalInput.completedDate !== undefined)
		updateData.completedDate = goalInput.completedDate
	if (goalInput.metrics !== undefined) updateData.metrics = goalInput.metrics
	if (goalInput.tags !== undefined) updateData.tags = goalInput.tags

	const [result] = await db
		.update(goals)
		.set(updateData)
		.where(and(eq(goals.publicId, goalInput.publicId), isNull(goals.deletedAt)))
		.returning()

	// Create activity for significant changes
	if (result && goalInput.status) {
		await createActivity(db, {
			goalId: result.id,
			type: 'goal.updated.status',
			createdBy: goalInput.updatedBy,
			metadata: { oldStatus: result.status, newStatus: goalInput.status },
		})
	}

	return result
}

// Archive goal
export const archive = async (
	db: dbClient,
	publicId: string,
	userId: string,
) => {
	const [result] = await db
		.update(goals)
		.set({
			isArchived: true,
			updatedAt: new Date(),
		})
		.where(and(eq(goals.publicId, publicId), isNull(goals.deletedAt)))
		.returning()

	if (result) {
		await createActivity(db, {
			goalId: result.id,
			type: 'goal.archived',
			createdBy: userId,
		})
	}

	return result
}

// Soft delete goal
export const softDelete = async (
	db: dbClient,
	publicId: string,
	userId: string,
) => {
	const [result] = await db
		.update(goals)
		.set({
			deletedAt: new Date(),
			deletedBy: userId,
		})
		.where(and(eq(goals.publicId, publicId), isNull(goals.deletedAt)))
		.returning({ id: goals.id })

	return result
}

// Milestone operations
export const createMilestone = async (
	db: dbClient,
	milestoneInput: {
		goalId: number
		title: string
		description?: string
		targetDate?: Date
		linkedCardId?: number
		createdBy: string
	},
) => {
	// Get the next index
	const result = await db
		.select({ maxIndex: sql<number>`COALESCE(MAX(${goalMilestones.index}), -1)` })
		.from(goalMilestones)
		.where(eq(goalMilestones.goalId, milestoneInput.goalId))

	const nextIndex = (result[0]?.maxIndex ?? -1) + 1

	const [milestone] = await db
		.insert(goalMilestones)
		.values({
			publicId: generateUID(),
			goalId: milestoneInput.goalId,
			title: milestoneInput.title,
			description: milestoneInput.description,
			targetDate: milestoneInput.targetDate,
			linkedCardId: milestoneInput.linkedCardId,
			index: nextIndex,
			createdBy: milestoneInput.createdBy,
		})
		.returning()

	if (milestone) {
		await createActivity(db, {
			goalId: milestoneInput.goalId,
			type: 'goal.milestone.added',
			createdBy: milestoneInput.createdBy,
			metadata: { milestoneId: milestone.id, title: milestone.title },
		})
	}

	return milestone
}

export const completeMilestone = async (
	db: dbClient,
	publicId: string,
	userId: string,
) => {
	const [result] = await db
		.update(goalMilestones)
		.set({
			completedDate: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(goalMilestones.publicId, publicId))
		.returning()

	if (result) {
		await createActivity(db, {
			goalId: result.goalId,
			type: 'goal.milestone.completed',
			createdBy: userId,
			metadata: { milestoneId: result.id, title: result.title },
		})
	}

	return result
}

// Link/unlink cards
export const linkCard = async (
	db: dbClient,
	goalId: number,
	cardId: number,
	userId: string,
) => {
	await db.insert(goalCards).values({
		goalId,
		cardId,
	})

	await createActivity(db, {
		goalId,
		type: 'goal.card.linked',
		createdBy: userId,
		metadata: { cardId },
	})
}

export const unlinkCard = async (
	db: dbClient,
	goalId: number,
	cardId: number,
	userId: string,
) => {
	await db
		.delete(goalCards)
		.where(and(eq(goalCards.goalId, goalId), eq(goalCards.cardId, cardId)))

	await createActivity(db, {
		goalId,
		type: 'goal.card.unlinked',
		createdBy: userId,
		metadata: { cardId },
	})
}

// Check-in operations
export const createCheckIn = async (
	db: dbClient,
	checkInInput: {
		goalId: number
		progress: number
		notes?: string
		mood?: string
		blockers?: string
		wins?: string
		nextSteps?: string
		createdBy: string
	},
) => {
	const [result] = await db
		.insert(goalCheckIns)
		.values({
			publicId: generateUID(),
			goalId: checkInInput.goalId,
			progress: checkInInput.progress,
			notes: checkInInput.notes,
			mood: checkInInput.mood,
			blockers: checkInInput.blockers,
			wins: checkInInput.wins,
			nextSteps: checkInInput.nextSteps,
			createdBy: checkInInput.createdBy,
		})
		.returning()

	// Update goal progress
	if (result) {
		await db
			.update(goals)
			.set({
				progress: checkInInput.progress,
				updatedAt: new Date(),
			})
			.where(eq(goals.id, checkInInput.goalId))
	}

	return result
}

export const getCheckInsByGoalId = async (db: dbClient, goalId: number) => {
	return db.query.goalCheckIns.findMany({
		where: eq(goalCheckIns.goalId, goalId),
		orderBy: [desc(goalCheckIns.createdAt)],
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

// Activity operations
export const createActivity = async (
	db: dbClient,
	activityInput: {
		goalId: number
		type: any
		createdBy: string
		metadata?: any
	},
) => {
	await db.insert(goalActivities).values({
		publicId: generateUID(),
		goalId: activityInput.goalId,
		type: activityInput.type,
		metadata: activityInput.metadata,
		createdBy: activityInput.createdBy,
	})
}

export const getActivitiesByGoalId = async (db: dbClient, goalId: number) => {
	return db.query.goalActivities.findMany({
		where: eq(goalActivities.goalId, goalId),
		orderBy: [desc(goalActivities.createdAt)],
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

// Get workspace ID by goal public ID
export const getWorkspaceIdByPublicId = async (
	db: dbClient,
	publicId: string,
) => {
	const result = await db.query.goals.findFirst({
		columns: { id: true, workspaceId: true },
		where: and(eq(goals.publicId, publicId), isNull(goals.deletedAt)),
	})

	return result
}
