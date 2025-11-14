-- Add S3 storage fields to files table
ALTER TABLE "files" ADD COLUMN "s3Key" varchar(500);
ALTER TABLE "files" ADD COLUMN "s3Url" varchar(1000);
ALTER TABLE "files" ADD COLUMN "fileSize" bigint;
ALTER TABLE "files" ADD COLUMN "mimeType" varchar(100);
