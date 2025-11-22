import { and, desc, eq, isNull, sql } from "drizzle-orm";

import type { Database } from "../db";
import { documentActivity, documents, documentTags } from "../schema";

export interface CreateDocumentInput {
  name: string;
  originalName: string;
  mimeType: string;
  originalSize: number;
  content?: string;
  uploadthingUrl: string;
  uploadthingKey: string;
  sha256Hash?: string;
  workspaceId: string;
  createdBy: string;
  isDeleted?: boolean;
}

export interface UpdateDocumentInput {
  name?: string;
  content?: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  updatedAt?: Date;
}

export interface DocumentFilters {
  workspaceId?: string;
  createdBy?: string;
  isDeleted?: boolean;
  mimeType?: string;
}

// Create a new document
export async function create(db: Database, input: CreateDocumentInput) {
  const [document] = await db
    .insert(documents)
    .values({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return document;
}

// Bulk create documents
export async function bulkCreate(db: Database, inputs: CreateDocumentInput[]) {
  if (inputs.length === 0) return [];

  const documentsData = inputs.map((input) => ({
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return await db.insert(documents).values(documentsData).returning();
}

// Get document by ID
export async function getById(db: Database, id: string) {
  const [document] = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.isDeleted, false)));

  return document;
}

// Get documents by workspace
export async function getByWorkspace(
  db: Database,
  workspaceId: string,
  filters?: Partial<DocumentFilters>,
  limit = 50,
  offset = 0,
) {
  const conditions = [
    eq(documents.workspaceId, workspaceId),
    eq(documents.isDeleted, false),
  ];

  if (filters?.createdBy) {
    conditions.push(eq(documents.createdBy, filters.createdBy));
  }

  if (filters?.mimeType) {
    conditions.push(eq(documents.mimeType, filters.mimeType));
  }

  return await db
    .select()
    .from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.createdAt))
    .limit(limit)
    .offset(offset);
}

// Search documents by name or content
export async function search(
  db: Database,
  workspaceId: string,
  query: string,
  limit = 50,
  offset = 0,
) {
  return await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.workspaceId, workspaceId),
        eq(documents.isDeleted, false),
        sql`(${documents.name} ILIKE ${`%${query}%`} OR ${documents.content} ILIKE ${`%${query}%`})`,
      ),
    )
    .orderBy(desc(documents.createdAt))
    .limit(limit)
    .offset(offset);
}

// Update document
export async function update(
  db: Database,
  id: string,
  input: UpdateDocumentInput,
) {
  const [document] = await db
    .update(documents)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, id))
    .returning();

  return document;
}

// Soft delete document
export async function softDelete(db: Database, id: string, deletedBy: string) {
  const [document] = await db
    .update(documents)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, id))
    .returning();

  return document;
}

// Hard delete document
export async function hardDelete(db: Database, id: string) {
  await db.delete(documents).where(eq(documents.id, id));
}

// Get document statistics
export async function getStats(db: Database, workspaceId: string) {
  const [stats] = await db
    .select({
      totalDocuments: sql<number>`count(*)`,
      totalSize: sql<number>`sum(${documents.originalSize})`,
      documentsByType: sql<
        Record<string, number>
      >`json_object_agg(${documents.mimeType}, count(*))`,
    })
    .from(documents)
    .where(
      and(
        eq(documents.workspaceId, workspaceId),
        eq(documents.isDeleted, false),
      ),
    );

  return stats;
}

// Get recently uploaded documents
export async function getRecent(db: Database, workspaceId: string, limit = 10) {
  return await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.workspaceId, workspaceId),
        eq(documents.isDeleted, false),
      ),
    )
    .orderBy(desc(documents.createdAt))
    .limit(limit);
}

// Check if document exists by hash (for duplicate detection)
export async function getByHash(
  db: Database,
  workspaceId: string,
  sha256Hash: string,
) {
  const [document] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.workspaceId, workspaceId),
        eq(documents.sha256Hash, sha256Hash),
        eq(documents.isDeleted, false),
      ),
    );

  return document;
}

// Add document activity
export async function addActivity(
  db: Database,
  documentId: string,
  event: string,
  eventData?: string,
  userId?: string,
) {
  const [activity] = await db
    .insert(documentActivity)
    .values({
      documentId,
      event,
      eventData,
      userId,
      createdAt: new Date(),
    })
    .returning();

  return activity;
}

// Get document activity
export async function getActivity(
  db: Database,
  documentId: string,
  limit = 50,
  offset = 0,
) {
  return await db
    .select()
    .from(documentActivity)
    .where(eq(documentActivity.documentId, documentId))
    .orderBy(desc(documentActivity.createdAt))
    .limit(limit)
    .offset(offset);
}
