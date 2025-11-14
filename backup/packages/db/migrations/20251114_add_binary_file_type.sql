-- Add 'binary' file type to the file_type enum
ALTER TYPE file_type ADD VALUE IF NOT EXISTS 'binary';
