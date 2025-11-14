-- Add new file types to the file_type enum
ALTER TYPE file_type ADD VALUE IF NOT EXISTS 'pdf';
ALTER TYPE file_type ADD VALUE IF NOT EXISTS 'jpg';
ALTER TYPE file_type ADD VALUE IF NOT EXISTS 'png';
ALTER TYPE file_type ADD VALUE IF NOT EXISTS 'gif';
ALTER TYPE file_type ADD VALUE IF NOT EXISTS 'epub';
