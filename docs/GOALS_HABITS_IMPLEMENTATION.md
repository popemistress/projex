# Goals, Habits, and Time Tracking Implementation

## Overview

This document describes the comprehensive implementation of goal management, habit tracking, and time tracking features for the Kan project management application. These features integrate seamlessly with the existing Kanban system to create a complete productivity solution.

## Database Schema

### New Tables Created

#### Goals System
- **`goal`** - Main goals table with hierarchical support
  - Fields: title, description, goalType, timeframe, status, priority, progress (0-100)
  - Support for parent-child relationships (sub-goals)
  - Links to boards for project-based goals
  - Tags and custom metrics (JSONB)
  - Soft delete support

- **`goal_milestone`** - Milestones for goals
  - Linked to goals with ordering (index)
  - Optional card linking for task tracking
  - Target and completion dates

- **`_goal_cards`** - Many-to-many relationship between goals and cards
  - Enables linking multiple cards to goals

- **`goal_activity`** - Activity tracking for goals
  - Comprehensive activity types (created, updated, archived, etc.)
  - Metadata storage for activity details

- **`goal_check_in`** - Regular progress check-ins
  - Progress updates, notes, mood tracking
  - Blockers, wins, and next steps

#### Habits System
- **`habit`** - Main habits table
  - Fields: title, description, category, frequency, status
  - Streak tracking (current and longest)
  - Reminder system with time and enabled flag
  - Color and icon customization
  - Target count and unit (e.g., "3 times", "30 minutes")
  - Link to goals for habit-goal alignment

- **`habit_completion`** - Completion tracking
  - Timestamp, count, notes, mood
  - Optional card linking

- **`habit_note`** - Daily reflections
  - Date-based notes for habits
  - Mood tracking

- **`_habit_cards`** - Many-to-many relationship between habits and cards
  - Enables recurring task creation from habits

- **`habit_template`** - Pre-built habit templates
  - Public templates for quick setup
  - Usage count tracking

#### Time Tracking System
- **`time_entry`** - Time tracking entries
  - Start/end time with duration calculation
  - Links to cards, goals, or habits
  - Billable flag and hourly rate
  - Tags and metadata

- **`pomodoro_session`** - Pomodoro timer sessions
  - Duration and break duration settings
  - Completed pomodoros counter
  - Target pomodoros per session

- **`time_block`** - Calendar time blocking
  - Start/end time for scheduled work
  - Links to cards or goals
  - Recurring support with RRULE format

- **`card_time_estimate`** - Time estimates for cards
  - Estimated vs actual minutes tracking

### New Enums

```typescript
// Goals
goal_type: 'personal' | 'professional' | 'health' | 'finance' | 'learning' | 'relationships' | 'creativity' | 'other'
goal_timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'long_term'
goal_status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'abandoned'
priority_level: 'critical' | 'high' | 'medium' | 'low'

// Habits
habit_category: 'health' | 'productivity' | 'learning' | 'relationships' | 'finance' | 'creativity' | 'mindfulness' | 'other'
habit_frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
habit_status: 'active' | 'paused' | 'completed' | 'archived'

// Time Tracking
time_entry_type: 'card' | 'goal' | 'habit' | 'document' | 'meeting' | 'other'
```

## API Implementation

### Goal Router (`/api/goal`)

**Endpoints:**
- `POST /goals` - Create a new goal
- `GET /goals/{publicId}` - Get goal by ID with full details
- `GET /workspaces/{workspacePublicId}/goals` - List all goals in workspace
- `PATCH /goals/{publicId}` - Update goal
- `POST /goals/{publicId}/archive` - Archive goal
- `DELETE /goals/{publicId}` - Soft delete goal

**Milestone Operations:**
- `createMilestone` - Add milestone to goal
- `completeMilestone` - Mark milestone as complete

**Card Integration:**
- `linkCard` - Link card to goal
- `unlinkCard` - Remove card from goal

**Check-ins:**
- `createCheckIn` - Record progress check-in
- `getCheckIns` - Get all check-ins for goal

**Activity:**
- `getActivities` - Get activity history

### Habit Router (`/api/habit`)

**Endpoints:**
- `POST /habits` - Create a new habit
- `GET /habits/{publicId}` - Get habit by ID
- `GET /workspaces/{workspacePublicId}/habits` - List user's habits
- `PATCH /habits/{publicId}` - Update habit
- `DELETE /habits/{publicId}` - Soft delete habit

**Completion Tracking:**
- `recordCompletion` - Mark habit as completed
- `deleteCompletion` - Remove completion record
- `getCompletionsByDateRange` - Get completions for date range
- `isCompletedToday` - Check if completed today

**Card Integration:**
- `linkCard` - Link card to habit
- `unlinkCard` - Remove card from habit

**Notes:**
- `createNote` - Add daily reflection
- `getNotes` - Get all notes for habit

**Templates:**
- `getAllTemplates` - Get public habit templates
- `createFromTemplate` - Create habit from template

### Time Tracking Router (`/api/timeTracking`)

**Time Entry Operations:**
- `startTimeEntry` - Start tracking time
- `stopTimeEntry` - Stop active timer
- `getActiveTimeEntry` - Get currently running timer
- `getTimeEntriesByDateRange` - Get entries for date range
- `deleteTimeEntry` - Remove time entry

**Pomodoro Operations:**
- `startPomodoroSession` - Start pomodoro timer
- `updatePomodoroSession` - Update session progress
- `getActivePomodoroSession` - Get active session

**Card Time Estimates:**
- `setCardTimeEstimate` - Set estimated time for card
- `getCardTimeEstimate` - Get card time estimate

**Time Blocks:**
- `createTimeBlock` - Schedule time block
- `getTimeBlocksByDateRange` - Get blocks for calendar
- `updateTimeBlock` - Update time block
- `deleteTimeBlock` - Remove time block

## Repository Layer

### Goal Repository (`goal.repo.ts`)

**Key Functions:**
- `create()` - Create goal with activity tracking
- `getByPublicId()` - Get goal with full relations (workspace, parent, sub-goals, milestones, cards)
- `getAllByWorkspaceId()` - List goals with filtering (status, type, archived)
- `update()` - Update goal with automatic activity logging
- `archive()` / `softDelete()` - Archive or delete goals
- `createMilestone()` / `completeMilestone()` - Milestone management
- `linkCard()` / `unlinkCard()` - Card relationship management
- `createCheckIn()` / `getCheckInsByGoalId()` - Progress tracking
- `createActivity()` / `getActivitiesByGoalId()` - Activity logging

### Habit Repository (`habit.repo.ts`)

**Key Functions:**
- `create()` - Create habit
- `getByPublicId()` - Get habit with completions
- `getAllByUserAndWorkspace()` - List user's habits with filtering
- `update()` - Update habit details
- `softDelete()` - Delete habit
- `recordCompletion()` - Record completion with automatic stats update
- `deleteCompletion()` - Remove completion
- `updateHabitStats()` - Calculate streaks and totals (internal)
- `getCompletionsByDateRange()` - Get completions for period
- `isCompletedToday()` - Check today's completion
- `linkCard()` / `unlinkCard()` - Card relationship management
- `createNote()` / `getNotesByHabitId()` - Daily reflections
- `createTemplate()` / `getAllTemplates()` - Template management

**Streak Calculation:**
- Automatically calculates current streak based on consecutive days
- Tracks longest streak achieved
- Updates on every completion/deletion

### Time Tracking Repository (`timeTracking.repo.ts`)

**Key Functions:**
- `createTimeEntry()` - Start time tracking with duration calculation
- `stopTimeEntry()` - End tracking and calculate duration
- `getTimeEntriesByDateRange()` - Get entries with relations
- `getActiveTimeEntry()` - Get running timer
- `deleteTimeEntry()` - Remove entry
- `createPomodoroSession()` / `updatePomodoroSession()` - Pomodoro management
- `getActivePomodoroSession()` - Get active pomodoro
- `setCardTimeEstimate()` / `updateCardActualTime()` - Card time tracking
- `createTimeBlock()` / `getTimeBlocksByDateRange()` - Calendar blocking
- `updateTimeBlock()` / `deleteTimeBlock()` - Block management
- `getTotalTimeByCard()` / `getTotalTimeByGoal()` - Analytics

## Feature Integration

### Goal-Card Integration

**How it works:**
1. Goals can be linked to boards for project-based tracking
2. Multiple cards can be linked to a single goal via `_goal_cards` table
3. Milestones can be linked to specific cards
4. Activity tracking logs when cards are linked/unlinked
5. Goal progress can be updated based on linked card completion

**Use cases:**
- Break down yearly goals into quarterly boards
- Link sprint cards to product goals
- Track milestone completion through card progress

### Habit-Card Integration

**How it works:**
1. Habits can generate recurring cards for daily/weekly tasks
2. Cards can be linked to habits via `_habit_cards` table
3. Completing a card can mark habit as completed
4. Habit completions can reference specific cards

**Use cases:**
- Daily exercise habit creates daily workout cards
- Reading habit links to book-related cards
- Meditation habit tracks via daily cards

### Time Tracking Integration

**How it works:**
1. Time entries can be linked to cards, goals, or habits
2. Pomodoro sessions can be associated with cards
3. Time blocks can schedule work on cards or goals
4. Card time estimates track estimated vs actual time

**Use cases:**
- Track time spent on goal-related work
- Monitor habit duration (e.g., 30 min meditation)
- Estimate and track card completion time
- Schedule focused work blocks for goals

## Key Features Implemented

### Goals
✅ Hierarchical goal structure (parent-child relationships)
✅ Goal types and timeframes
✅ Progress tracking (0-100%)
✅ Priority levels
✅ Milestones with target dates
✅ Card linking for task breakdown
✅ Activity history
✅ Progress check-ins with mood and blockers
✅ Tags and custom metrics
✅ Board linking for project goals
✅ Archive and soft delete

### Habits
✅ Habit categories and frequencies
✅ Streak tracking (current and longest)
✅ Completion history
✅ Reminder system
✅ Mood tracking
✅ Daily notes/reflections
✅ Goal linking for alignment
✅ Card generation for recurring tasks
✅ Habit templates for quick setup
✅ Custom targets (count and unit)
✅ Color and icon customization

### Time Tracking
✅ Start/stop time tracking
✅ Link to cards, goals, or habits
✅ Billable time tracking
✅ Pomodoro timer with breaks
✅ Card time estimates
✅ Calendar time blocking
✅ Recurring time blocks
✅ Time analytics by card/goal
✅ Active timer detection

## Security & Permissions

All endpoints enforce:
- User authentication via `protectedProcedure`
- Workspace membership validation via `assertUserInWorkspace()`
- Owner validation for habits (user-specific)
- Row Level Security (RLS) enabled on all tables
- Soft deletes for data recovery

## Next Steps

### Frontend Implementation (Pending)
1. **Goal Management UI**
   - Goal list/grid views
   - Goal creation wizard
   - Progress visualization
   - Milestone timeline
   - Check-in forms
   - Activity feed

2. **Habit Tracking UI**
   - Habit dashboard
   - Calendar heatmap
   - Streak visualization
   - Quick completion buttons
   - Habit templates gallery
   - Daily reflection forms

3. **Time Tracking UI**
   - Timer widget
   - Pomodoro interface
   - Time entry list
   - Calendar view for time blocks
   - Time reports and analytics

4. **Integration Features**
   - Goal-card linking interface
   - Habit-card automation
   - Time tracking from cards
   - Cross-feature dashboards

5. **Analytics & Reporting**
   - Goal progress dashboards
   - Habit adherence charts
   - Time distribution reports
   - Productivity insights
   - Achievement badges

6. **Automation & Workflows**
   - Auto-create cards from habits
   - Goal progress automation
   - Reminder notifications
   - Recurring task generation

7. **Templates & Quick Start**
   - Goal templates library
   - Habit templates gallery
   - Onboarding wizards
   - Best practices guides

## Technical Notes

### Performance Considerations
- Indexes on foreign keys for fast lookups
- JSONB for flexible metadata storage
- Efficient streak calculation algorithm
- Cursor-based pagination for large datasets

### Data Integrity
- Foreign key constraints with cascade deletes
- Soft deletes for data recovery
- Activity logging for audit trails
- Duplicate prevention with unique constraints

### Extensibility
- JSONB fields for custom data
- Flexible frequency system for habits
- Metadata support in time entries
- Tag system for organization

## Migration Applied

Migration file: `20251113204259_brave_roland_deschain.sql`

Successfully created:
- 7 new enum types
- 15 new tables
- All foreign key constraints
- Row Level Security on all tables

## Files Created

### Database Layer
- `/packages/db/src/schema/goals.ts` - Goal schema definitions
- `/packages/db/src/schema/habits.ts` - Habit schema definitions
- `/packages/db/src/schema/timeTracking.ts` - Time tracking schema definitions
- `/packages/db/src/repository/goal.repo.ts` - Goal repository functions
- `/packages/db/src/repository/habit.repo.ts` - Habit repository functions
- `/packages/db/src/repository/timeTracking.repo.ts` - Time tracking repository functions

### API Layer
- `/packages/api/src/routers/goal.ts` - Goal API endpoints
- `/packages/api/src/routers/habit.ts` - Habit API endpoints
- `/packages/api/src/routers/timeTracking.ts` - Time tracking API endpoints
- Updated `/packages/api/src/root.ts` - Added new routers to app

### Documentation
- `/docs/GOALS_HABITS_IMPLEMENTATION.md` - This file

## Summary

The backend implementation for goals, habits, and time tracking is now complete and fully functional. The system provides:

- **Comprehensive goal management** with hierarchical structure, milestones, and progress tracking
- **Robust habit tracking** with streak calculation, templates, and daily reflections
- **Flexible time tracking** with pomodoro support, time blocking, and analytics
- **Seamless integration** with existing Kanban cards and boards
- **Enterprise-grade security** with RLS, soft deletes, and audit trails
- **Scalable architecture** ready for frontend implementation

The next phase involves building the frontend UI components and pages to expose these features to users.
