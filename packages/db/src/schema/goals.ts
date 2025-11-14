import { relations } from 'drizzle-orm'
import {
	bigint,
	bigserial,
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

import { boards } from './boards'
import { cards } from './cards'
import { users } from './users'
import { workspaces } from './workspaces'

// Goal enums
export const goalTypes = [
	'personal',
	'professional',
	'health',
	'finance',
	'learning',
	'relationships',
	'creativity',
	'other',
] as const
export type GoalType = (typeof goalTypes)[number]
export const goalTypeEnum = pgEnum('goal_type', goalTypes)

export const goalTimeframes = [
	'daily',
	'weekly',
	'monthly',
	'quarterly',
	'yearly',
	'long_term',
] as const
export type GoalTimeframe = (typeof goalTimeframes)[number]
export const goalTimeframeEnum = pgEnum('goal_timeframe', goalTimeframes)

export const goalStatuses = [
	'not_started',
	'in_progress',
	'completed',
	'on_hold',
	'abandoned',
] as const
export type GoalStatus = (typeof goalStatuses)[number]
export const goalStatusEnum = pgEnum('goal_status', goalStatuses)

export const priorityLevels = ['critical', 'high', 'medium', 'low'] as const
export type PriorityLevel = (typeof priorityLevels)[number]
export const priorityLevelEnum = pgEnum('priority_level', priorityLevels)

// Goals table
export const goals = pgTable('goal', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	workspaceId: bigint('workspaceId', { mode: 'number' })
		.notNull()
		.references(() => workspaces.id, { onDelete: 'cascade' }),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	goalType: goalTypeEnum('goalType').notNull().default('personal'),
	timeframe: goalTimeframeEnum('timeframe').notNull().default('monthly'),
	status: goalStatusEnum('status').notNull().default('not_started'),
	priority: priorityLevelEnum('priority').notNull().default('medium'),
	startDate: timestamp('startDate'),
	targetDate: timestamp('targetDate'),
	completedDate: timestamp('completedDate'),
	progress: integer('progress').notNull().default(0), // 0-100
	metrics: jsonb('metrics'), // Custom KPIs and success criteria
	parentGoalId: bigint('parentGoalId', { mode: 'number' }).references(
		(): any => goals.id,
		{ onDelete: 'set null' },
	),
	linkedBoardId: bigint('linkedBoardId', { mode: 'number' }).references(
		() => boards.id,
		{ onDelete: 'set null' },
	),
	tags: jsonb('tags').$type<string[]>().default([]),
	isArchived: boolean('isArchived').notNull().default(false),
	createdBy: uuid('createdBy').references(() => users.id, {
		onDelete: 'set null',
	}),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt'),
	deletedBy: uuid('deletedBy').references(() => users.id, {
		onDelete: 'set null',
	}),
}).enableRLS()

export const goalsRelations = relations(goals, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [goals.workspaceId],
		references: [workspaces.id],
		relationName: 'goalsWorkspace',
	}),
	createdBy: one(users, {
		fields: [goals.createdBy],
		references: [users.id],
		relationName: 'goalsCreatedByUser',
	}),
	deletedBy: one(users, {
		fields: [goals.deletedBy],
		references: [users.id],
		relationName: 'goalsDeletedByUser',
	}),
	parentGoal: one(goals, {
		fields: [goals.parentGoalId],
		references: [goals.id],
		relationName: 'goalParent',
	}),
	subGoals: many(goals, { relationName: 'goalParent' }),
	linkedBoard: one(boards, {
		fields: [goals.linkedBoardId],
		references: [boards.id],
		relationName: 'goalsLinkedBoard',
	}),
	milestones: many(goalMilestones),
	cards: many(goalCards),
	activities: many(goalActivities),
	checkIns: many(goalCheckIns),
}))

// Goal milestones
export const goalMilestones = pgTable('goal_milestone', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	goalId: bigint('goalId', { mode: 'number' })
		.notNull()
		.references(() => goals.id, { onDelete: 'cascade' }),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	targetDate: timestamp('targetDate'),
	completedDate: timestamp('completedDate'),
	index: integer('index').notNull().default(0),
	linkedCardId: bigint('linkedCardId', { mode: 'number' }).references(
		() => cards.id,
		{ onDelete: 'set null' },
	),
	createdBy: uuid('createdBy').references(() => users.id, {
		onDelete: 'set null',
	}),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt'),
}).enableRLS()

export const goalMilestonesRelations = relations(
	goalMilestones,
	({ one }) => ({
		goal: one(goals, {
			fields: [goalMilestones.goalId],
			references: [goals.id],
			relationName: 'goalMilestonesGoal',
		}),
		linkedCard: one(cards, {
			fields: [goalMilestones.linkedCardId],
			references: [cards.id],
			relationName: 'goalMilestonesLinkedCard',
		}),
		createdBy: one(users, {
			fields: [goalMilestones.createdBy],
			references: [users.id],
			relationName: 'goalMilestonesCreatedByUser',
		}),
	}),
)

// Goal-Card relationship (many-to-many)
export const goalCards = pgTable(
	'_goal_cards',
	{
		goalId: bigint('goalId', { mode: 'number' })
			.notNull()
			.references(() => goals.id, { onDelete: 'cascade' }),
		cardId: bigint('cardId', { mode: 'number' })
			.notNull()
			.references(() => cards.id, { onDelete: 'cascade' }),
		createdAt: timestamp('createdAt').defaultNow().notNull(),
	},
	(t) => [primaryKey({ columns: [t.goalId, t.cardId] })],
).enableRLS()

export const goalCardsRelations = relations(goalCards, ({ one }) => ({
	goal: one(goals, {
		fields: [goalCards.goalId],
		references: [goals.id],
		relationName: 'goalCardsGoal',
	}),
	card: one(cards, {
		fields: [goalCards.cardId],
		references: [cards.id],
		relationName: 'goalCardsCard',
	}),
}))

// Goal activity tracking
export const goalActivityTypes = [
	'goal.created',
	'goal.updated.title',
	'goal.updated.description',
	'goal.updated.status',
	'goal.updated.progress',
	'goal.updated.priority',
	'goal.updated.dates',
	'goal.milestone.added',
	'goal.milestone.completed',
	'goal.card.linked',
	'goal.card.unlinked',
	'goal.archived',
	'goal.completed',
] as const
export type GoalActivityType = (typeof goalActivityTypes)[number]
export const goalActivityTypeEnum = pgEnum(
	'goal_activity_type',
	goalActivityTypes,
)

export const goalActivities = pgTable('goal_activity', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	type: goalActivityTypeEnum('type').notNull(),
	goalId: bigint('goalId', { mode: 'number' })
		.notNull()
		.references(() => goals.id, { onDelete: 'cascade' }),
	metadata: jsonb('metadata'), // Store activity-specific data
	createdBy: uuid('createdBy').references(() => users.id, {
		onDelete: 'set null',
	}),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
}).enableRLS()

export const goalActivitiesRelations = relations(goalActivities, ({ one }) => ({
	goal: one(goals, {
		fields: [goalActivities.goalId],
		references: [goals.id],
		relationName: 'goalActivitiesGoal',
	}),
	createdBy: one(users, {
		fields: [goalActivities.createdBy],
		references: [users.id],
		relationName: 'goalActivitiesCreatedByUser',
	}),
}))

// Goal check-ins for regular reviews
export const goalCheckIns = pgTable('goal_check_in', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	goalId: bigint('goalId', { mode: 'number' })
		.notNull()
		.references(() => goals.id, { onDelete: 'cascade' }),
	progress: integer('progress').notNull(), // 0-100
	notes: text('notes'),
	mood: varchar('mood', { length: 50 }), // optional: positive, neutral, challenging
	blockers: text('blockers'),
	wins: text('wins'),
	nextSteps: text('nextSteps'),
	createdBy: uuid('createdBy').references(() => users.id, {
		onDelete: 'set null',
	}),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
}).enableRLS()

export const goalCheckInsRelations = relations(goalCheckIns, ({ one }) => ({
	goal: one(goals, {
		fields: [goalCheckIns.goalId],
		references: [goals.id],
		relationName: 'goalCheckInsGoal',
	}),
	createdBy: one(users, {
		fields: [goalCheckIns.createdBy],
		references: [users.id],
		relationName: 'goalCheckInsCreatedByUser',
	}),
}))
