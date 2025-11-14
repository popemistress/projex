# Habit Form Complete Redesign Plan

**Date:** November 14, 2025  
**Status:** In Progress  
**Scope:** Major UI/UX overhaul of habit creation and tracking

---

## Overview

Complete redesign of the habit creation form with new tracking types, frequency options, icon/color pickers, and enhanced scheduling features.

---

## Database Changes ✅

### New Enums Added
- **`habit_type`**: `'build'` | `'remove'`
- **`tracking_type`**: `'task'` | `'count'` | `'time'`

### New Columns Added to `habit` table
- `habitType` - Type of habit (build good habit vs remove bad habit)
- `trackingType` - How the habit is tracked (task, count, or time)
- `reminders` - JSONB array of reminder objects `[{time: string, enabled: boolean}]`
- `scheduleStart` - Start date for the habit
- `scheduleEnd` - End date for the habit (optional)

### Updated Enums
**Categories** - Added mastery categories:
- `physical_mastery`
- `mental_mastery`
- `financial_mastery`
- `social_mastery`
- `spiritual_mastery`

**Frequencies** - Added new frequency types:
- `every_few_days`
- `times_per_week`
- `times_per_month`
- `times_per_year`
- `select_dates`
- `none`

---

## UI Components to Create

### 1. Icon Picker Modal
**File:** `/apps/web/src/components/IconPicker.tsx`

**Features:**
- Search bar for filtering icons
- Categories: Activities, Health, Productivity, etc.
- Grid display of icons
- Selected icon preview with colored background
- Confirm/Cancel buttons

**Icons to include:**
- Use react-icons library
- Categories: Activities, Food, Sports, Learning, etc.
- Minimum 100+ icons

### 2. Color Picker Modal
**File:** `/apps/web/src/components/ColorPicker.tsx`

**Features:**
- Preset color swatches (14 colors shown in image)
- Gradient color picker at bottom
- Hue slider
- Selected color preview with icon
- Confirm/Cancel buttons

**Preset Colors:**
- Orange: `#FF9F66`
- Green: `#A8E063`
- Blue: `#5DADE2`
- Purple: `#BB8FCE`
- Red: `#F1948A`
- Beige: `#F9E79F`
- Yellow: `#F4D03F`
- Mint: `#ABEBC6`
- Teal: `#76D7C4`
- Cyan: `#7FB3D5`
- Sky: `#AED6F1`
- Lavender: `#D7BDE2`
- Pink: `#F8B4D9`
- Rose: `#F5B7B1`

### 3. Frequency Selector Modal
**File:** `/apps/web/src/components/FrequencySelector.tsx`

**Frequency Types:**

#### a) Select Days (Daily with specific days)
- Dropdown: "Select Days"
- 7 day buttons (S M T W T F S)
- "Every week" button with "Change" option
- "No dates excluded" button with "Change" option
- Description text

#### b) Every Few Days
- Dropdown: "Every few Days"
- Input for number of days (e.g., "Every 2 days")
- "No dates excluded" with calendar option
- Description text

#### c) Weekly
- Dropdown: "Weekly"
- "Every week" display
- Description text

#### d) Times per Week
- Dropdown: "Times per Week"
- Count selector (e.g., "1 time", "2 times")
- "Every week" display
- "No dates excluded" option
- Description text

#### e) Times per Month
- Dropdown: "Times per Month"
- Count selector
- "No dates excluded" option
- Description text

#### f) Times per Year
- Dropdown: "Times per Year"
- Count selector
- "No dates excluded" option
- Description text

#### g) Select Dates
- Dropdown: "Select Dates"
- Calendar grid (1-31)
- Multi-select dates
- Description text

#### h) None
- Dropdown: "None"
- Description: Manual tracking only
- No automatic scheduling

### 4. Date Exclusion Calendar
**File:** `/apps/web/src/components/DateExclusionCalendar.tsx`

**Features:**
- Full month calendar view
- Multi-select dates to exclude
- Visual indication of excluded dates
- Confirm/Cancel buttons

### 5. Reminder Time Picker
**File:** `/apps/web/src/components/ReminderTimePicker.tsx`

**Features:**
- Scrollable time picker (hours/minutes/AM-PM)
- Selected time highlighted
- Confirm/Cancel buttons
- Multiple reminders support

---

## Redesigned NewHabitForm

### Form Layout

#### Section 1: Basic Info
- **Title** (required) - Text input

#### Section 2: Category
- **Category** (required) - Dropdown
  - Physical Mastery
  - Mental Mastery
  - Financial Mastery
  - Social Mastery
  - Spiritual Mastery
  - Other

#### Section 3: Icon & Color (Side by side buttons)
- **Icon Button** - Opens icon picker modal
  - Shows selected icon or default gear icon
  - Label: "Icon"
- **Color Button** - Opens color picker modal
  - Shows selected color swatch
  - Label: "Color"
  - Default: `#FDB022` (orange/yellow)

#### Section 4: Habit Type
- **Two toggle buttons:**
  - **Build** - Build a good habit
  - **Remove** - Get rid of a bad habit
- Description text below selected type

#### Section 5: Tracking
- **Three options:**
  - **Task** - Simple checkbox (default)
  - **Count** - Number input for counting
  - **Time** - Time duration input

#### Section 6: Frequency
- **Button** - Opens frequency selector modal
  - Shows current frequency selection
  - Label: "Frequency"

#### Section 7: Reminders
- **Section Title:** "Add reminders to ensure you never miss it"
- **Add Reminder Button** - Opens time picker
- **Reminder List** - Shows added reminders with delete option
- **Subtitle:** "Remembering is a big part of doing."

#### Section 8: Schedule
- **Start Date** - Date picker (default: Today)
- **End Date** - Date picker (default: Never)

#### Section 9: Actions
- **Cancel** button
- **Create Habit** button

### Fields Removed
- ❌ Description textarea
- ❌ Target Count input
- ❌ Unit input
- ❌ Tags input
- ❌ Single reminder checkbox/time

---

## Habit Card Updates

### Tracking UI Based on Type

#### Task-based Tracking
- Simple checkbox to mark complete
- Shows completion status

#### Count-based Tracking
- Number input or +/- buttons
- Shows current count / target count
- Progress bar

#### Time-based Tracking
- Timer interface
- Start/Stop button
- Shows elapsed time / target time
- Progress indicator

---

## API Updates Needed

### Update habit router
**File:** `/packages/api/src/routers/habit.ts`

Update `create` mutation input schema:
```typescript
.input(
  z.object({
    workspacePublicId: z.string().min(12),
    title: z.string().min(1).max(255),
    category: z.enum([...new categories]),
    habitType: z.enum(['build', 'remove']),
    trackingType: z.enum(['task', 'count', 'time']),
    frequency: z.enum([...new frequencies]),
    frequencyDetails: z.any().optional(),
    reminders: z.array(z.object({
      time: z.string(),
      enabled: z.boolean()
    })).optional(),
    scheduleStart: z.string().optional(),
    scheduleEnd: z.string().optional(),
    color: z.string().max(7).optional(),
    icon: z.string().max(50).optional(),
    // Remove: description, targetCount, unit, tags
  })
)
```

---

## Implementation Steps

### Phase 1: Database & Schema ✅
- [x] Create migration file
- [x] Update schema with new enums
- [x] Add new columns to habits table

### Phase 2: UI Components
- [ ] Create IconPicker component
- [ ] Create ColorPicker component
- [ ] Create FrequencySelector component
- [ ] Create DateExclusionCalendar component
- [ ] Create ReminderTimePicker component

### Phase 3: Form Redesign
- [ ] Update NewHabitForm with new layout
- [ ] Integrate all modal components
- [ ] Update form validation schema
- [ ] Center modal on screen
- [ ] Test all interactions

### Phase 4: Habit Cards
- [ ] Add tracking UI for task-based habits
- [ ] Add tracking UI for count-based habits
- [ ] Add tracking UI for time-based habits
- [ ] Update habit detail view

### Phase 5: API Integration
- [ ] Update habit creation mutation
- [ ] Update habit update mutation
- [ ] Test all API endpoints

### Phase 6: Testing & Deployment
- [ ] Test habit creation flow
- [ ] Test all frequency types
- [ ] Test reminders
- [ ] Test tracking types
- [ ] Deploy to production

---

## Design Specifications

### Colors
- Primary: `#FDB022` (Orange/Yellow)
- Selected State: Orange background with white text
- Unselected State: White background with gray text
- Button Hover: Light gray background

### Typography
- Form Title: 20px, Semibold
- Section Titles: 18px, Semibold
- Labels: 14px, Medium
- Descriptions: 14px, Regular, Gray

### Spacing
- Section Margin: 24px
- Input Padding: 12px
- Button Padding: 12px 24px
- Modal Padding: 24px

### Modal Sizing
- Icon Picker: 600px width
- Color Picker: 600px width
- Frequency Selector: 500px width
- Reminder Picker: 400px width

---

## Notes

This is a comprehensive redesign that will significantly improve the habit creation UX. The modular approach with separate components for icon/color/frequency selection makes the form cleaner and more intuitive.

The new tracking types (task/count/time) provide flexibility for different habit types, and the enhanced frequency options cover virtually every scheduling scenario.

---

## Estimated Time

- Phase 1 (Database): ✅ Complete
- Phase 2 (UI Components): ~4-6 hours
- Phase 3 (Form Redesign): ~2-3 hours
- Phase 4 (Habit Cards): ~2-3 hours
- Phase 5 (API Integration): ~1-2 hours
- Phase 6 (Testing): ~1-2 hours

**Total:** ~10-16 hours of development time

---

## Current Status

✅ Database schema updated  
✅ Migration file created  
⏳ UI components pending  
⏳ Form redesign pending  
⏳ Testing pending  
⏳ Deployment pending
