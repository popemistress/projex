CREATE TYPE "public"."habit_type" AS ENUM('build', 'remove');--> statement-breakpoint
CREATE TYPE "public"."tracking_type" AS ENUM('task', 'count', 'time');--> statement-breakpoint
ALTER TYPE "public"."file_type" ADD VALUE 'binary';--> statement-breakpoint
ALTER TYPE "public"."habit_category" ADD VALUE 'physical_mastery' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."habit_category" ADD VALUE 'mental_mastery' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."habit_category" ADD VALUE 'financial_mastery' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."habit_category" ADD VALUE 'social_mastery' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."habit_category" ADD VALUE 'spiritual_mastery' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."habit_frequency" ADD VALUE 'every_few_days';--> statement-breakpoint
ALTER TYPE "public"."habit_frequency" ADD VALUE 'times_per_week';--> statement-breakpoint
ALTER TYPE "public"."habit_frequency" ADD VALUE 'times_per_month';--> statement-breakpoint
ALTER TYPE "public"."habit_frequency" ADD VALUE 'times_per_year';--> statement-breakpoint
ALTER TYPE "public"."habit_frequency" ADD VALUE 'select_dates';--> statement-breakpoint
ALTER TYPE "public"."habit_frequency" ADD VALUE 'none';--> statement-breakpoint
ALTER TABLE "habit" ALTER COLUMN "color" SET DEFAULT '#FDB022';--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "color" varchar(7);--> statement-breakpoint
ALTER TABLE "habit" ADD COLUMN "habitType" "habit_type" DEFAULT 'build' NOT NULL;--> statement-breakpoint
ALTER TABLE "habit" ADD COLUMN "trackingType" "tracking_type" DEFAULT 'task' NOT NULL;--> statement-breakpoint
ALTER TABLE "habit" ADD COLUMN "reminders" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "habit" ADD COLUMN "scheduleStart" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "habit" ADD COLUMN "scheduleEnd" timestamp;