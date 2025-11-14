-- Add new enums for habit type and tracking type
CREATE TYPE habit_type AS ENUM ('build', 'remove');
CREATE TYPE tracking_type AS ENUM ('task', 'count', 'time');

-- Add new columns to habit table
ALTER TABLE habit 
ADD COLUMN IF NOT EXISTS habit_type habit_type DEFAULT 'build',
ADD COLUMN IF NOT EXISTS tracking_type tracking_type DEFAULT 'task',
ADD COLUMN IF NOT EXISTS schedule_start DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS schedule_end DATE,
ADD COLUMN IF NOT EXISTS reminders JSONB DEFAULT '[]'::jsonb;

-- Update category enum to include new mastery categories
ALTER TYPE habit_category ADD VALUE IF NOT EXISTS 'physical_mastery';
ALTER TYPE habit_category ADD VALUE IF NOT EXISTS 'mental_mastery';
ALTER TYPE habit_category ADD VALUE IF NOT EXISTS 'financial_mastery';
ALTER TYPE habit_category ADD VALUE IF NOT EXISTS 'social_mastery';
ALTER TYPE habit_category ADD VALUE IF NOT EXISTS 'spiritual_mastery';

-- Update frequency enum to include new frequency types
ALTER TYPE habit_frequency ADD VALUE IF NOT EXISTS 'every_few_days';
ALTER TYPE habit_frequency ADD VALUE IF NOT EXISTS 'times_per_week';
ALTER TYPE habit_frequency ADD VALUE IF NOT EXISTS 'times_per_month';
ALTER TYPE habit_frequency ADD VALUE IF NOT EXISTS 'times_per_year';
ALTER TYPE habit_frequency ADD VALUE IF NOT EXISTS 'select_dates';
ALTER TYPE habit_frequency ADD VALUE IF NOT EXISTS 'none';
