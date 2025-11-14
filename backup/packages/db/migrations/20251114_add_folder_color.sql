-- Add color column to folders table
ALTER TABLE "folders" ADD COLUMN "color" varchar(7);

-- Set default color for existing folders
UPDATE "folders" SET "color" = '#6B7280' WHERE "color" IS NULL;
