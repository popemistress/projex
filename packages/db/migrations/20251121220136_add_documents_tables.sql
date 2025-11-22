-- Create documents table
CREATE TABLE IF NOT EXISTS "kan_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"original_size" integer NOT NULL,
	"content" text,
	"uploadthing_url" varchar(500) NOT NULL,
	"uploadthing_key" varchar(500) NOT NULL,
	"sha256_hash" varchar(64),
	"workspace_id" uuid NOT NULL,
	"created_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);

-- Create document_tags table
CREATE TABLE IF NOT EXISTS "kan_document_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create document_activity table
CREATE TABLE IF NOT EXISTS "kan_document_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"event" varchar(50) NOT NULL,
	"event_data" text,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for documents table
CREATE INDEX IF NOT EXISTS "documents_workspace_id_idx" ON "kan_documents" ("workspace_id");
CREATE INDEX IF NOT EXISTS "documents_created_at_idx" ON "kan_documents" ("created_at");
CREATE INDEX IF NOT EXISTS "documents_is_deleted_idx" ON "kan_documents" ("is_deleted");
CREATE INDEX IF NOT EXISTS "documents_created_by_idx" ON "kan_documents" ("created_by");

-- Create indexes for document_tags table
CREATE INDEX IF NOT EXISTS "document_tags_document_id_idx" ON "kan_document_tags" ("document_id");
CREATE INDEX IF NOT EXISTS "document_tags_tag_id_idx" ON "kan_document_tags" ("tag_id");

-- Create indexes for document_activity table
CREATE INDEX IF NOT EXISTS "document_activity_document_id_idx" ON "kan_document_activity" ("document_id");
CREATE INDEX IF NOT EXISTS "document_activity_user_id_idx" ON "kan_document_activity" ("user_id");
CREATE INDEX IF NOT EXISTS "document_activity_created_at_idx" ON "kan_document_activity" ("created_at");

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "kan_documents" ADD CONSTRAINT "kan_documents_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "kan_documents" ADD CONSTRAINT "kan_documents_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "kan_documents" ADD CONSTRAINT "kan_documents_deleted_by_user_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "kan_document_tags" ADD CONSTRAINT "kan_document_tags_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "kan_documents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "kan_document_activity" ADD CONSTRAINT "kan_document_activity_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "kan_documents"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "kan_document_activity" ADD CONSTRAINT "kan_document_activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
