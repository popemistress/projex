import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { workspaces } from "./workspaces";

export const documents = pgTable("kan_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  originalSize: integer("original_size").notNull(),
  content: text("content"),
  uploadthingUrl: varchar("uploadthing_url", { length: 500 }).notNull(),
  uploadthingKey: varchar("uploadthing_key", { length: 500 }).notNull(),
  sha256Hash: varchar("sha256_hash", { length: 64 }),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  deletedBy: uuid("deleted_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const documentTags = pgTable("kan_document_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id").notNull(), // Reference to tags table when it exists
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documentActivity = pgTable("kan_document_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  event: varchar("event", { length: 50 }).notNull(),
  eventData: text("event_data"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentTag = typeof documentTags.$inferSelect;
export type NewDocumentTag = typeof documentTags.$inferInsert;
export type DocumentActivity = typeof documentActivity.$inferSelect;
export type NewDocumentActivity = typeof documentActivity.$inferInsert;
