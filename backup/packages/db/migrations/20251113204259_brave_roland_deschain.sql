-- Note: file_type and permission_level enums already exist
CREATE TYPE "public"."goal_activity_type" AS ENUM('goal.created', 'goal.updated.title', 'goal.updated.description', 'goal.updated.status', 'goal.updated.progress', 'goal.updated.priority', 'goal.updated.dates', 'goal.milestone.added', 'goal.milestone.completed', 'goal.card.linked', 'goal.card.unlinked', 'goal.archived', 'goal.completed');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('not_started', 'in_progress', 'completed', 'on_hold', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."goal_timeframe" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'long_term');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('personal', 'professional', 'health', 'finance', 'learning', 'relationships', 'creativity', 'other');--> statement-breakpoint
CREATE TYPE "public"."priority_level" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."habit_category" AS ENUM('health', 'productivity', 'learning', 'relationships', 'finance', 'creativity', 'mindfulness', 'other');--> statement-breakpoint
CREATE TYPE "public"."habit_frequency" AS ENUM('daily', 'weekly', 'monthly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."habit_status" AS ENUM('active', 'paused', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."time_entry_type" AS ENUM('card', 'goal', 'habit', 'document', 'meeting', 'other');--> statement-breakpoint
-- Note: file-related tables already exist (file_collaborators, file_shares, file_versions, files, folders)
CREATE TABLE IF NOT EXISTS "goal_activity" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"type" "goal_activity_type" NOT NULL,
	"goalId" bigint NOT NULL,
	"metadata" jsonb,
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "goal_activity_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "goal_activity" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_goal_cards" (
	"goalId" bigint NOT NULL,
	"cardId" bigint NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "_goal_cards_goalId_cardId_pk" PRIMARY KEY("goalId","cardId")
);
--> statement-breakpoint
ALTER TABLE "_goal_cards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goal_check_in" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"goalId" bigint NOT NULL,
	"progress" integer NOT NULL,
	"notes" text,
	"mood" varchar(50),
	"blockers" text,
	"wins" text,
	"nextSteps" text,
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "goal_check_in_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "goal_check_in" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goal_milestone" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"goalId" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"targetDate" timestamp,
	"completedDate" timestamp,
	"index" integer DEFAULT 0 NOT NULL,
	"linkedCardId" bigint,
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "goal_milestone_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "goal_milestone" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goal" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"workspaceId" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"goalType" "goal_type" DEFAULT 'personal' NOT NULL,
	"timeframe" "goal_timeframe" DEFAULT 'monthly' NOT NULL,
	"status" "goal_status" DEFAULT 'not_started' NOT NULL,
	"priority" "priority_level" DEFAULT 'medium' NOT NULL,
	"startDate" timestamp,
	"targetDate" timestamp,
	"completedDate" timestamp,
	"progress" integer DEFAULT 0 NOT NULL,
	"metrics" jsonb,
	"parentGoalId" bigint,
	"linkedBoardId" bigint,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"isArchived" boolean DEFAULT false NOT NULL,
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp,
	"deletedBy" uuid,
	CONSTRAINT "goal_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "goal" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_habit_cards" (
	"habitId" bigint NOT NULL,
	"cardId" bigint NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "_habit_cards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habit_completion" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"habitId" bigint NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"mood" varchar(50),
	"linkedCardId" bigint,
	"createdBy" uuid,
	CONSTRAINT "habit_completion_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "habit_completion" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habit_note" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"habitId" bigint NOT NULL,
	"date" timestamp NOT NULL,
	"note" text NOT NULL,
	"mood" varchar(50),
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "habit_note_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "habit_note" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habit_template" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" "habit_category" NOT NULL,
	"frequency" "habit_frequency" NOT NULL,
	"frequencyDetails" jsonb,
	"icon" varchar(50),
	"color" varchar(7),
	"targetCount" integer DEFAULT 1,
	"unit" varchar(50),
	"isPublic" boolean DEFAULT true NOT NULL,
	"usageCount" integer DEFAULT 0 NOT NULL,
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "habit_template_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "habit_template" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "habit" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"workspaceId" bigint NOT NULL,
	"userId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" "habit_category" DEFAULT 'other' NOT NULL,
	"frequency" "habit_frequency" DEFAULT 'daily' NOT NULL,
	"frequencyDetails" jsonb,
	"streakCount" integer DEFAULT 0 NOT NULL,
	"longestStreak" integer DEFAULT 0 NOT NULL,
	"totalCompletions" integer DEFAULT 0 NOT NULL,
	"reminderTime" time,
	"reminderEnabled" boolean DEFAULT false NOT NULL,
	"linkedGoalId" bigint,
	"status" "habit_status" DEFAULT 'active' NOT NULL,
	"color" varchar(7) DEFAULT '#3b82f6',
	"icon" varchar(50),
	"targetCount" integer DEFAULT 1,
	"unit" varchar(50),
	"isPublic" boolean DEFAULT false NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp,
	CONSTRAINT "habit_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "habit" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "card_time_estimate" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"cardId" bigint NOT NULL,
	"estimatedMinutes" integer NOT NULL,
	"actualMinutes" integer DEFAULT 0,
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "card_time_estimate_cardId_unique" UNIQUE("cardId")
);
--> statement-breakpoint
ALTER TABLE "card_time_estimate" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pomodoro_session" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"workspaceId" bigint NOT NULL,
	"userId" uuid NOT NULL,
	"cardId" bigint,
	"duration" integer DEFAULT 1500 NOT NULL,
	"breakDuration" integer DEFAULT 300 NOT NULL,
	"completedPomodoros" integer DEFAULT 0 NOT NULL,
	"targetPomodoros" integer DEFAULT 4 NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pomodoro_session_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "pomodoro_session" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "time_block" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"workspaceId" bigint NOT NULL,
	"userId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	"cardId" bigint,
	"goalId" bigint,
	"color" varchar(7) DEFAULT '#3b82f6',
	"isRecurring" boolean DEFAULT false NOT NULL,
	"recurrenceRule" jsonb,
	"createdBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp,
	CONSTRAINT "time_block_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "time_block" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "time_entry" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"publicId" varchar(12) NOT NULL,
	"workspaceId" bigint NOT NULL,
	"userId" uuid NOT NULL,
	"type" time_entry_type NOT NULL,
	"description" text,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp,
	"duration" integer,
	"isBillable" boolean DEFAULT false NOT NULL,
	"hourlyRate" integer,
	"cardId" bigint,
	"goalId" bigint,
	"habitId" bigint,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"deletedAt" timestamp,
	CONSTRAINT "time_entry_publicId_unique" UNIQUE("publicId")
);
--> statement-breakpoint
ALTER TABLE "time_entry" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
-- Note: board.coverImage column already exists
-- Note: file-related foreign keys already exist, skipping those
DO $$ BEGIN
 ALTER TABLE "goal_activity" ADD CONSTRAINT "goal_activity_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_activity" ADD CONSTRAINT "goal_activity_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_goal_cards" ADD CONSTRAINT "_goal_cards_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_goal_cards" ADD CONSTRAINT "_goal_cards_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_check_in" ADD CONSTRAINT "goal_check_in_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_check_in" ADD CONSTRAINT "goal_check_in_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_milestone" ADD CONSTRAINT "goal_milestone_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goal"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_milestone" ADD CONSTRAINT "goal_milestone_linkedCardId_card_id_fk" FOREIGN KEY ("linkedCardId") REFERENCES "public"."card"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal_milestone" ADD CONSTRAINT "goal_milestone_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal" ADD CONSTRAINT "goal_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal" ADD CONSTRAINT "goal_parentGoalId_goal_id_fk" FOREIGN KEY ("parentGoalId") REFERENCES "public"."goal"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal" ADD CONSTRAINT "goal_linkedBoardId_board_id_fk" FOREIGN KEY ("linkedBoardId") REFERENCES "public"."board"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal" ADD CONSTRAINT "goal_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goal" ADD CONSTRAINT "goal_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_habit_cards" ADD CONSTRAINT "_habit_cards_habitId_habit_id_fk" FOREIGN KEY ("habitId") REFERENCES "public"."habit"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "_habit_cards" ADD CONSTRAINT "_habit_cards_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_completion" ADD CONSTRAINT "habit_completion_habitId_habit_id_fk" FOREIGN KEY ("habitId") REFERENCES "public"."habit"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_completion" ADD CONSTRAINT "habit_completion_linkedCardId_card_id_fk" FOREIGN KEY ("linkedCardId") REFERENCES "public"."card"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_completion" ADD CONSTRAINT "habit_completion_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_note" ADD CONSTRAINT "habit_note_habitId_habit_id_fk" FOREIGN KEY ("habitId") REFERENCES "public"."habit"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_note" ADD CONSTRAINT "habit_note_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit_template" ADD CONSTRAINT "habit_template_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit" ADD CONSTRAINT "habit_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit" ADD CONSTRAINT "habit_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "habit" ADD CONSTRAINT "habit_linkedGoalId_goal_id_fk" FOREIGN KEY ("linkedGoalId") REFERENCES "public"."goal"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_time_estimate" ADD CONSTRAINT "card_time_estimate_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_time_estimate" ADD CONSTRAINT "card_time_estimate_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pomodoro_session" ADD CONSTRAINT "pomodoro_session_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pomodoro_session" ADD CONSTRAINT "pomodoro_session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pomodoro_session" ADD CONSTRAINT "pomodoro_session_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."card"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_block" ADD CONSTRAINT "time_block_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_block" ADD CONSTRAINT "time_block_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_block" ADD CONSTRAINT "time_block_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."card"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_block" ADD CONSTRAINT "time_block_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goal"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_block" ADD CONSTRAINT "time_block_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_workspaceId_workspace_id_fk" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_cardId_card_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."card"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_goalId_goal_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goal"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_habitId_habit_id_fk" FOREIGN KEY ("habitId") REFERENCES "public"."habit"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
