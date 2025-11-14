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
	time,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

import { cards } from './cards'
import { goals } from './goals'
import { users } from './users'
import { workspaces } from './workspaces'

// Habit enums
export const habitCategories = [
	'health',
	'productivity',
	'learning',
	'relationships',
	'finance',
	'creativity',
	'mindfulness',
	'physical_mastery',
	'mental_mastery',
	'financial_mastery',
	'social_mastery',
	'spiritual_mastery',
	'other',
] as const
export type HabitCategory = (typeof habitCategories)[number]
export const habitCategoryEnum = pgEnum('habit_category', habitCategories)

export const habitFrequencies = [
	'daily',
	'weekly',
	'monthly',
	'custom',
	'every_few_days',
	'times_per_week',
	'times_per_month',
	'times_per_year',
	'select_dates',
	'none',
] as const
export type HabitFrequency = (typeof habitFrequencies)[number]
export const habitFrequencyEnum = pgEnum('habit_frequency', habitFrequencies)

export const habitStatuses = ['active', 'paused', 'completed', 'archived'] as const
export type HabitStatus = (typeof habitStatuses)[number]
export const habitStatusEnum = pgEnum('habit_status', habitStatuses)

export const habitTypes = ['build', 'remove'] as const
export type HabitType = (typeof habitTypes)[number]
export const habitTypeEnum = pgEnum('habit_type', habitTypes)

export const trackingTypes = ['task', 'count', 'time'] as const
export type TrackingType = (typeof trackingTypes)[number]
export const trackingTypeEnum = pgEnum('tracking_type', trackingTypes)

// Habits table
export const habits = pgTable('habit', {
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
	category: habitCategoryEnum('category').notNull().default('other'),
	habitType: habitTypeEnum('habitType').notNull().default('build'),
	trackingType: trackingTypeEnum('trackingType').notNull().default('task'),
	frequency: habitFrequencyEnum('frequency').notNull().default('daily'),
	frequencyDetails: jsonb('frequencyDetails'), // {days: [0,1,2,3,4,5,6], timesPerDay: 1, count: 2, excludedDates: [], etc}
	streakCount: integer('streakCount').notNull().default(0),
	longestStreak: integer('longestStreak').notNull().default(0),
	totalCompletions: integer('totalCompletions').notNull().default(0),
	reminderTime: time('reminderTime'),
	reminderEnabled: boolean('reminderEnabled').notNull().default(false),
	reminders: jsonb('reminders').$type<Array<{ time: string; enabled: boolean }>>().default([]),
	scheduleStart: timestamp('scheduleStart').defaultNow(),
	scheduleEnd: timestamp('scheduleEnd'),
	linkedGoalId: bigint('linkedGoalId', { mode: 'number' }).references(
		() => goals.id,
		{ onDelete: 'set null' },
	),
	status: habitStatusEnum('status').notNull().default('active'),
	color: varchar('color', { length: 7 }).default('#FDB022'), // hex color
	icon: varchar('icon', { length: 50 }), // emoji or icon name
	targetCount: integer('targetCount').default(1), // daily target
	unit: varchar('unit', { length: 50 }), // e.g., "times", "minutes", "pages"
	isPublic: boolean('isPublic').notNull().default(false),
	tags: jsonb('tags').$type<string[]>().default([]),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt'),
}).enableRLS()

export const habitsRelations = relations(habits, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [habits.workspaceId],
		references: [workspaces.id],
		relationName: 'habitsWorkspace',
	}),
	user: one(users, {
		fields: [habits.userId],
		references: [users.id],
		relationName: 'habitsUser',
	}),
	linkedGoal: one(goals, {
		fields: [habits.linkedGoalId],
		references: [goals.id],
		relationName: 'habitsLinkedGoal',
	}),
	completions: many(habitCompletions),
	cards: many(habitCards),
	notes: many(habitNotes),
}))

// Habit completions
export const habitCompletions = pgTable('habit_completion', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	habitId: bigint('habitId', { mode: 'number' })
		.notNull()
		.references(() => habits.id, { onDelete: 'cascade' }),
	completedAt: timestamp('completedAt').defaultNow().notNull(),
	count: integer('count').notNull().default(1), // for habits with targets > 1
	notes: text('notes'),
	mood: varchar('mood', { length: 50 }), // positive, neutral, challenging
	linkedCardId: bigint('linkedCardId', { mode: 'number' }).references(
		() => cards.id,
		{ onDelete: 'set null' },
	),
	createdBy: uuid('createdBy').references(() => users.id, {
		onDelete: 'set null',
	}),
}).enableRLS()

export const habitCompletionsRelations = relations(
	habitCompletions,
	({ one }) => ({
		habit: one(habits, {
			fields: [habitCompletions.habitId],
			references: [habits.id],
			relationName: 'habitCompletionsHabit',
		}),
		linkedCard: one(cards, {
			fields: [habitCompletions.linkedCardId],
			references: [cards.id],
			relationName: 'habitCompletionsLinkedCard',
		}),
		createdBy: one(users, {
			fields: [habitCompletions.createdBy],
			references: [users.id],
			relationName: 'habitCompletionsCreatedByUser',
		}),
	}),
)

// Habit-Card relationship (for recurring tasks)
export const habitCards = pgTable('_habit_cards', {
	habitId: bigint('habitId', { mode: 'number' })
		.notNull()
		.references(() => habits.id, { onDelete: 'cascade' }),
	cardId: bigint('cardId', { mode: 'number' })
		.notNull()
		.references(() => cards.id, { onDelete: 'cascade' }),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
}).enableRLS()

export const habitCardsRelations = relations(habitCards, ({ one }) => ({
	habit: one(habits, {
		fields: [habitCards.habitId],
		references: [habits.id],
		relationName: 'habitCardsHabit',
	}),
	card: one(cards, {
		fields: [habitCards.cardId],
		references: [cards.id],
		relationName: 'habitCardsCard',
	}),
}))

// Habit notes for daily reflections
export const habitNotes = pgTable('habit_note', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	habitId: bigint('habitId', { mode: 'number' })
		.notNull()
		.references(() => habits.id, { onDelete: 'cascade' }),
	date: timestamp('date').notNull(),
	note: text('note').notNull(),
	mood: varchar('mood', { length: 50 }),
	createdBy: uuid('createdBy').references(() => users.id, {
		onDelete: 'set null',
	}),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt'),
}).enableRLS()

export const habitNotesRelations = relations(habitNotes, ({ one }) => ({
	habit: one(habits, {
		fields: [habitNotes.habitId],
		references: [habits.id],
		relationName: 'habitNotesHabit',
	}),
	createdBy: one(users, {
		fields: [habitNotes.createdBy],
		references: [users.id],
		relationName: 'habitNotesCreatedByUser',
	}),
}))

// Habit templates for quick setup
export const habitTemplates = pgTable('habit_template', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	category: habitCategoryEnum('category').notNull(),
	frequency: habitFrequencyEnum('frequency').notNull(),
	frequencyDetails: jsonb('frequencyDetails'),
	icon: varchar('icon', { length: 50 }),
	color: varchar('color', { length: 7 }),
	targetCount: integer('targetCount').default(1),
	unit: varchar('unit', { length: 50 }),
	isPublic: boolean('isPublic').notNull().default(true),
	usageCount: integer('usageCount').notNull().default(0),
	createdBy: uuid('createdBy').references(() => users.id, {
		onDelete: 'set null',
	}),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
}).enableRLS()

export const habitTemplatesRelations = relations(habitTemplates, ({ one }) => ({
	createdBy: one(users, {
		fields: [habitTemplates.createdBy],
		references: [users.id],
		relationName: 'habitTemplatesCreatedByUser',
	}),
}))
