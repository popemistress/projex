import { relations, sql } from 'drizzle-orm'
import {
	bigint,
	bigserial,
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

import { cards } from './cards'
import { goals } from './goals'
import { habits } from './habits'
import { users } from './users'
import { workspaces } from './workspaces'

// Time tracking enums
export const timeEntryTypes = [
	'card',
	'goal',
	'habit',
	'document',
	'meeting',
	'other',
] as const
export type TimeEntryType = (typeof timeEntryTypes)[number]
export const timeEntryTypeEnum = pgEnum('time_entry_type', timeEntryTypes)

// Time entries table
export const timeEntries = pgTable('time_entry', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	workspaceId: bigint('workspaceId', { mode: 'number' })
		.notNull()
		.references(() => workspaces.id, { onDelete: 'cascade' }),
	userId: uuid('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	type: timeEntryTypeEnum('type').notNull(),
	description: text('description'),
	startTime: timestamp('startTime').notNull(),
	endTime: timestamp('endTime'),
	duration: integer('duration'), // in seconds, calculated when endTime is set
	isBillable: boolean('isBillable').notNull().default(false),
	hourlyRate: integer('hourlyRate'), // in cents
	// Related entities
	cardId: bigint('cardId', { mode: 'number' }).references(() => cards.id, {
		onDelete: 'set null',
	}),
	goalId: bigint('goalId', { mode: 'number' }).references(() => goals.id, {
		onDelete: 'set null',
	}),
	habitId: bigint('habitId', { mode: 'number' }).references(() => habits.id, {
		onDelete: 'set null',
	}),
	tags: jsonb('tags').$type<string[]>().default([]),
	metadata: jsonb('metadata'), // Additional context
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt'),
}).enableRLS()

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [timeEntries.workspaceId],
		references: [workspaces.id],
		relationName: 'timeEntriesWorkspace',
	}),
	user: one(users, {
		fields: [timeEntries.userId],
		references: [users.id],
		relationName: 'timeEntriesUser',
	}),
	card: one(cards, {
		fields: [timeEntries.cardId],
		references: [cards.id],
		relationName: 'timeEntriesCard',
	}),
	goal: one(goals, {
		fields: [timeEntries.goalId],
		references: [goals.id],
		relationName: 'timeEntriesGoal',
	}),
	habit: one(habits, {
		fields: [timeEntries.habitId],
		references: [habits.id],
		relationName: 'timeEntriesHabit',
	}),
}))

// Pomodoro sessions
export const pomodoroSessions = pgTable('pomodoro_session', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	workspaceId: bigint('workspaceId', { mode: 'number' })
		.notNull()
		.references(() => workspaces.id, { onDelete: 'cascade' }),
	userId: uuid('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	cardId: bigint('cardId', { mode: 'number' }).references(() => cards.id, {
		onDelete: 'set null',
	}),
	duration: integer('duration').notNull().default(1500), // 25 minutes in seconds
	breakDuration: integer('breakDuration').notNull().default(300), // 5 minutes
	completedPomodoros: integer('completedPomodoros').notNull().default(0),
	targetPomodoros: integer('targetPomodoros').notNull().default(4),
	startTime: timestamp('startTime').notNull(),
	endTime: timestamp('endTime'),
	isCompleted: boolean('isCompleted').notNull().default(false),
	notes: text('notes'),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
}).enableRLS()

export const pomodoroSessionsRelations = relations(
	pomodoroSessions,
	({ one }) => ({
		workspace: one(workspaces, {
			fields: [pomodoroSessions.workspaceId],
			references: [workspaces.id],
			relationName: 'pomodoroSessionsWorkspace',
		}),
		user: one(users, {
			fields: [pomodoroSessions.userId],
			references: [users.id],
			relationName: 'pomodoroSessionsUser',
		}),
		card: one(cards, {
			fields: [pomodoroSessions.cardId],
			references: [cards.id],
			relationName: 'pomodoroSessionsCard',
		}),
	}),
)

// Time estimates for cards
export const cardTimeEstimates = pgTable('card_time_estimate', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	cardId: bigint('cardId', { mode: 'number' })
		.notNull()
		.references(() => cards.id, { onDelete: 'cascade' })
		.unique(),
	estimatedMinutes: integer('estimatedMinutes').notNull(),
	actualMinutes: integer('actualMinutes').default(0),
	createdBy: uuid('createdBy').references(() => users.id, {
		onDelete: 'set null',
	}),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt'),
}).enableRLS()

export const cardTimeEstimatesRelations = relations(
	cardTimeEstimates,
	({ one }) => ({
		card: one(cards, {
			fields: [cardTimeEstimates.cardId],
			references: [cards.id],
			relationName: 'cardTimeEstimatesCard',
		}),
		createdBy: one(users, {
			fields: [cardTimeEstimates.createdBy],
			references: [users.id],
			relationName: 'cardTimeEstimatesCreatedByUser',
		}),
	}),
)

// Time blocking / calendar events
export const timeBlocks = pgTable('time_block', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	workspaceId: bigint('workspaceId', { mode: 'number' })
		.notNull()
		.references(() => workspaces.id, { onDelete: 'cascade' }),
	userId: uuid('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	startTime: timestamp('startTime').notNull(),
	endTime: timestamp('endTime').notNull(),
	cardId: bigint('cardId', { mode: 'number' }).references(() => cards.id, {
		onDelete: 'set null',
	}),
	goalId: bigint('goalId', { mode: 'number' }).references(() => goals.id, {
		onDelete: 'set null',
	}),
	color: varchar('color', { length: 7 }).default('#3b82f6'),
	isRecurring: boolean('isRecurring').notNull().default(false),
	recurrenceRule: jsonb('recurrenceRule'), // RRULE format
	createdBy: uuid('createdBy').references(() => users.id, {
		onDelete: 'set null',
	}),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt'),
}).enableRLS()

export const timeBlocksRelations = relations(timeBlocks, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [timeBlocks.workspaceId],
		references: [workspaces.id],
		relationName: 'timeBlocksWorkspace',
	}),
	user: one(users, {
		fields: [timeBlocks.userId],
		references: [users.id],
		relationName: 'timeBlocksUser',
	}),
	card: one(cards, {
		fields: [timeBlocks.cardId],
		references: [cards.id],
		relationName: 'timeBlocksCard',
	}),
	goal: one(goals, {
		fields: [timeBlocks.goalId],
		references: [goals.id],
		relationName: 'timeBlocksGoal',
	}),
	createdBy: one(users, {
		fields: [timeBlocks.createdBy],
		references: [users.id],
		relationName: 'timeBlocksCreatedByUser',
	}),
}))
