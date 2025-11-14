import { relations } from 'drizzle-orm'
import {
	bigint,
	bigserial,
	boolean,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

import { users } from './users'
import { workspaces } from './workspaces'

// Updated Enum to include 'binary' for generic uploads
export const fileTypes = [
	'folder',
	'list',
	'docx',
	'md',
	'pdf',
	'jpg',
	'png',
	'gif',
	'epub',
	'binary', // Added generic type for any file
] as const
export type FileType = (typeof fileTypes)[number]
export const fileTypeEnum = pgEnum('file_type', fileTypes)

// Permission levels enum
export const permissionLevels = ['view', 'edit', 'admin'] as const
export type PermissionLevel = (typeof permissionLevels)[number]
export const permissionLevelEnum = pgEnum('permission_level', permissionLevels)

// Folders table
export const folders = pgTable('folders', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	color: varchar('color', { length: 7 }),
	parentId: bigint('parentId', { mode: 'number' }).references(
		(): any => folders.id,
		{ onDelete: 'cascade' }
	),
	workspaceId: bigint('workspaceId', { mode: 'number' })
		.notNull()
		.references(() => workspaces.id, { onDelete: 'cascade' }),
	isExpanded: boolean('isExpanded').default(false).notNull(),
	index: bigint('index', { mode: 'number' }).default(0).notNull(),
	createdBy: uuid('createdBy')
		.notNull()
		.references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt'),
	deletedBy: uuid('deletedBy').references(() => users.id, {
		onDelete: 'set null',
	}),
}).enableRLS()

// Files table
export const files = pgTable('files', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	name: varchar('name', { length: 255 }).notNull(),
	type: fileTypeEnum('type').notNull(),
	
	// Text content for *editable* files (md, docx, lists)
	content: text('content'),
	contentCompressed: text('contentCompressed'),
	
	// NEW: Metadata stores physical storage info
	// e.g., { path: "/uploads/my_file.pdf", size: 1024768, mimeType: "application/pdf" }
	metadata: jsonb('metadata'),
	folderId: bigint('folderId', { mode: 'number' }).references(() => folders.id, {
		onDelete: 'cascade',
	}),
	workspaceId: bigint('workspaceId', { mode: 'number' })
		.notNull()
		.references(() => workspaces.id, { onDelete: 'cascade' }),
	index: bigint('index', { mode: 'number' }).default(0).notNull(),
	isTemplate: boolean('isTemplate').default(false).notNull(),
	templateCategory: varchar('templateCategory', { length: 100 }),
	createdBy: uuid('createdBy')
		.notNull()
		.references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	updatedAt: timestamp('updatedAt'),
	deletedAt: timestamp('deletedAt'),
	deletedBy: uuid('deletedBy').references(() => users.id, {
		onDelete: 'set null',
	}),
}).enableRLS()

// File versions table (for version history)
export const fileVersions = pgTable('file_versions', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	fileId: bigint('fileId', { mode: 'number' })
		.notNull()
		.references(() => files.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	contentCompressed: text('contentCompressed'),
	versionNumber: bigint('versionNumber', { mode: 'number' }).notNull(),
	changeDescription: text('changeDescription'),
	createdBy: uuid('createdBy')
		.notNull()
		.references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
}).enableRLS()

// File shares table (for sharing files with specific users)
export const fileShares = pgTable('file_shares', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	publicId: varchar('publicId', { length: 12 }).notNull().unique(),
	fileId: bigint('fileId', { mode: 'number' })
		.notNull()
		.references(() => files.id, { onDelete: 'cascade' }),
	userId: uuid('userId').references(() => users.id, { onDelete: 'cascade' }),
	email: varchar('email', { length: 255 }), // For sharing with non-users
	permission: permissionLevelEnum('permission').notNull().default('view'),
	expiresAt: timestamp('expiresAt'),
	sharedBy: uuid('sharedBy')
		.notNull()
		.references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('createdAt').defaultNow().notNull(),
	revokedAt: timestamp('revokedAt'),
	revokedBy: uuid('revokedBy').references(() => users.id, {
		onDelete: 'set null',
	}),
}).enableRLS()

// File collaborators table (for real-time collaboration tracking)
export const fileCollaborators = pgTable('file_collaborators', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	fileId: bigint('fileId', { mode: 'number' })
		.notNull()
		.references(() => files.id, { onDelete: 'cascade' }),
	userId: uuid('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	cursorPosition: jsonb('cursorPosition'), // Cursor position in the document
	isActive: boolean('isActive').default(true).notNull(),
	lastSeenAt: timestamp('lastSeenAt').defaultNow().notNull(),
	joinedAt: timestamp('joinedAt').defaultNow().notNull(),
}).enableRLS()

// Relations
export const foldersRelations = relations(folders, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [folders.workspaceId],
		references: [workspaces.id],
	}),
	parent: one(folders, {
		fields: [folders.parentId],
		references: [folders.id],
		relationName: 'folderParent',
	}),
	children: many(folders, { relationName: 'folderParent' }),
	files: many(files),
	createdByUser: one(users, {
		fields: [folders.createdBy],
		references: [users.id],
		relationName: 'folderCreatedBy',
	}),
	deletedByUser: one(users, {
		fields: [folders.deletedBy],
		references: [users.id],
		relationName: 'folderDeletedBy',
	}),
}))

export const filesRelations = relations(files, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [files.workspaceId],
		references: [workspaces.id],
	}),
	folder: one(folders, {
		fields: [files.folderId],
		references: [folders.id],
	}),
	versions: many(fileVersions),
	shares: many(fileShares),
	collaborators: many(fileCollaborators),
	createdByUser: one(users, {
		fields: [files.createdBy],
		references: [users.id],
		relationName: 'fileCreatedBy',
	}),
	deletedByUser: one(users, {
		fields: [files.deletedBy],
		references: [users.id],
		relationName: 'fileDeletedBy',
	}),
}))

export const fileVersionsRelations = relations(fileVersions, ({ one }) => ({
	file: one(files, {
		fields: [fileVersions.fileId],
		references: [files.id],
	}),
	createdByUser: one(users, {
		fields: [fileVersions.createdBy],
		references: [users.id],
	}),
}))

export const fileSharesRelations = relations(fileShares, ({ one }) => ({
	file: one(files, {
		fields: [fileShares.fileId],
		references: [files.id],
	}),
	user: one(users, {
		fields: [fileShares.userId],
		references: [users.id],
		relationName: 'fileShareUser',
	}),
	sharedByUser: one(users, {
		fields: [fileShares.sharedBy],
		references: [users.id],
		relationName: 'fileShareSharedBy',
	}),
	revokedByUser: one(users, {
		fields: [fileShares.revokedBy],
		references: [users.id],
		relationName: 'fileShareRevokedBy',
	}),
}))

export const fileCollaboratorsRelations = relations(
	fileCollaborators,
	({ one }) => ({
		file: one(files, {
			fields: [fileCollaborators.fileId],
			references: [files.id],
		}),
		user: one(users, {
			fields: [fileCollaborators.userId],
			references: [users.id],
		}),
	})
)
