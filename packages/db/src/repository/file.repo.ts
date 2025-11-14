import { and, desc, eq, isNull, or, sql } from 'drizzle-orm'

import type { dbClient } from '@kan/db/client'
import {
	type FileType,
	files,
	fileVersions,
	fileShares,
	fileCollaborators,
	folders,
} from '@kan/db/schema'
import { generateUID } from '@kan/shared/utils'

// File Repository
export const createFile = async (
	db: dbClient,
	data: {
		name: string
		type: FileType
		content?: string
		folderId?: number
		workspaceId: number
		createdBy: string
		index?: number
		isTemplate?: boolean
		templateCategory?: string
	}
) => {
	const [file] = await db
		.insert(files)
		.values({
			publicId: generateUID(),
			...data,
		})
		.returning()
	return file
}

export const getFileByPublicId = async (db: dbClient, publicId: string) => {
	return db.query.files.findFirst({
		where: and(eq(files.publicId, publicId), isNull(files.deletedAt)),
		with: {
			folder: true,
			workspace: true,
			createdByUser: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
	})
}

export const getFilesByFolder = async (db: dbClient, folderId: number) => {
	return db.query.files.findMany({
		where: and(eq(files.folderId, folderId), isNull(files.deletedAt)),
		orderBy: [files.index, files.createdAt],
		with: {
			createdByUser: {
				columns: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	})
}

export const getFilesByWorkspace = async (db: dbClient, workspaceId: number) => {
	return db.query.files.findMany({
		where: and(eq(files.workspaceId, workspaceId), isNull(files.deletedAt)),
		orderBy: [desc(files.updatedAt)],
		with: {
			folder: true,
			createdByUser: {
				columns: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	})
}

export const getRootFilesByWorkspace = async (db: dbClient, workspaceId: number) => {
	return db.query.files.findMany({
		where: and(
			eq(files.workspaceId, workspaceId),
			isNull(files.folderId),
			isNull(files.deletedAt)
		),
		orderBy: [files.index, files.createdAt],
		with: {
			createdByUser: {
				columns: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	})
}

export const updateFile = async (
	db: dbClient,
	publicId: string,
	data: {
		name?: string
		content?: string
		contentCompressed?: string
		metadata?: any
		index?: number
	}
) => {
	const [file] = await db
		.update(files)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(files.publicId, publicId))
		.returning()
	return file
}

export const deleteFile = async (
	db: dbClient,
	publicId: string,
	deletedBy: string
) => {
	// Hard delete - permanently remove from database
	const [file] = await db
		.delete(files)
		.where(eq(files.publicId, publicId))
		.returning()
	return file
}

export const searchFiles = async (
	db: dbClient,
	workspaceId: number,
	query: string
) => {
	return db
		.select()
		.from(files)
		.where(
			and(
				eq(files.workspaceId, workspaceId),
				isNull(files.deletedAt),
				or(
					sql`${files.name} ILIKE ${`%${query}%`}`,
					sql`${files.content} ILIKE ${`%${query}%`}`
				)
			)
		)
		.orderBy(desc(files.updatedAt))
		.limit(50)
}

export const getTemplates = async (db: dbClient, category?: string) => {
	const conditions = [eq(files.isTemplate, true), isNull(files.deletedAt)]
	if (category) {
		conditions.push(eq(files.templateCategory, category))
	}
	return db.query.files.findMany({
		where: and(...conditions),
		orderBy: [files.name],
	})
}

export const createFromTemplate = async (
	db: dbClient,
	templatePublicId: string,
	data: {
		name: string
		folderId?: number
		workspaceId: number
		createdBy: string
	}
) => {
	const template = await db.query.files.findFirst({
		where: eq(files.publicId, templatePublicId),
	})

	if (!template) throw new Error('Template not found')

	const [file] = await db
		.insert(files)
		.values({
			publicId: generateUID(),
			...data,
			type: template.type,
			content: template.content,
			isTemplate: false,
		})
		.returning()

	return file
}

// File Version Repository
export const createFileVersion = async (
	db: dbClient,
	data: {
		fileId: number
		content: string
		contentCompressed?: string
		versionNumber: number
		changeDescription?: string
		createdBy: string
	}
) => {
	const [version] = await db
		.insert(fileVersions)
		.values({
			publicId: generateUID(),
			...data,
		})
		.returning()
	return version
}

export const getFileVersions = async (
	db: dbClient,
	fileId: number,
	limit = 50
) => {
	return db.query.fileVersions.findMany({
		where: eq(fileVersions.fileId, fileId),
		orderBy: [desc(fileVersions.versionNumber)],
		limit,
		with: {
			createdByUser: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
	})
}

export const getFileVersionByPublicId = async (
	db: dbClient,
	publicId: string
) => {
	return db.query.fileVersions.findFirst({
		where: eq(fileVersions.publicId, publicId),
	})
}

export const getLatestVersionNumber = async (db: dbClient, fileId: number) => {
	const [result] = await db
		.select({ maxVersion: sql<number>`MAX(${fileVersions.versionNumber})` })
		.from(fileVersions)
		.where(eq(fileVersions.fileId, fileId))
	return result?.maxVersion ?? 0
}

// File Share Repository
export const createFileShare = async (
	db: dbClient,
	data: {
		fileId: number
		userId?: string
		email?: string
		permission: 'view' | 'edit' | 'admin'
		expiresAt?: Date
		sharedBy: string
	}
) => {
	const [share] = await db
		.insert(fileShares)
		.values({
			publicId: generateUID(),
			...data,
		})
		.returning()
	return share
}

export const getFileShares = async (db: dbClient, fileId: number) => {
	return db.query.fileShares.findMany({
		where: and(eq(fileShares.fileId, fileId), isNull(fileShares.revokedAt)),
		with: {
			user: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
			sharedByUser: {
				columns: {
					id: true,
					name: true,
					email: true,
				},
			},
		},
	})
}

export const getUserFileShares = async (db: dbClient, userId: string) => {
	return db.query.fileShares.findMany({
		where: and(eq(fileShares.userId, userId), isNull(fileShares.revokedAt)),
		with: {
			file: {
				with: {
					folder: true,
					workspace: true,
				},
			},
		},
	})
}

export const revokeFileShare = async (
	db: dbClient,
	publicId: string,
	revokedBy: string
) => {
	const [share] = await db
		.update(fileShares)
		.set({ revokedAt: new Date(), revokedBy })
		.where(eq(fileShares.publicId, publicId))
		.returning()
	return share
}

export const checkFileAccess = async (
	db: dbClient,
	fileId: number,
	userId: string
) => {
	const share = await db.query.fileShares.findFirst({
		where: and(
			eq(fileShares.fileId, fileId),
			eq(fileShares.userId, userId),
			isNull(fileShares.revokedAt)
		),
	})
	return !!share
}

// File Collaborator Repository
export const addFileCollaborator = async (
	db: dbClient,
	data: {
		fileId: number
		userId: string
		cursorPosition?: any
	}
) => {
	const [collaborator] = await db
		.insert(fileCollaborators)
		.values(data)
		.returning()
	return collaborator
}

export const getActiveCollaborators = async (db: dbClient, fileId: number) => {
	return db.query.fileCollaborators.findMany({
		where: and(
			eq(fileCollaborators.fileId, fileId),
			eq(fileCollaborators.isActive, true)
		),
		with: {
			user: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true,
				},
			},
		},
	})
}

export const updateCollaboratorCursor = async (
	db: dbClient,
	fileId: number,
	userId: string,
	cursorPosition: any
) => {
	const [collaborator] = await db
		.update(fileCollaborators)
		.set({ cursorPosition, lastSeenAt: new Date() })
		.where(
			and(
				eq(fileCollaborators.fileId, fileId),
				eq(fileCollaborators.userId, userId)
			)
		)
		.returning()
	return collaborator
}

export const setCollaboratorInactive = async (
	db: dbClient,
	fileId: number,
	userId: string
) => {
	const [collaborator] = await db
		.update(fileCollaborators)
		.set({ isActive: false })
		.where(
			and(
				eq(fileCollaborators.fileId, fileId),
				eq(fileCollaborators.userId, userId)
			)
		)
		.returning()
	return collaborator
}

export const cleanupInactiveCollaborators = async (
	db: dbClient,
	fileId: number,
	olderThan: Date
) => {
	await db
		.delete(fileCollaborators)
		.where(
			and(
				eq(fileCollaborators.fileId, fileId),
				eq(fileCollaborators.isActive, false),
				sql`${fileCollaborators.lastSeenAt} < ${olderThan}`
			)
		)
}

// Folder Repository
export const createFolder = async (
	db: dbClient,
	data: {
		name: string
		parentId?: number
		workspaceId: number
		createdBy: string
		index?: number
	}
) => {
	const [folder] = await db
		.insert(folders)
		.values({
			publicId: generateUID(),
			...data,
		})
		.returning()
	return folder
}

export const getFolderByPublicId = async (db: dbClient, publicId: string) => {
	return db.query.folders.findFirst({
		where: and(eq(folders.publicId, publicId), isNull(folders.deletedAt)),
		with: {
			workspace: true,
			parent: true,
			children: true,
			files: {
				where: isNull(files.deletedAt),
				orderBy: [files.index, files.createdAt],
			},
		},
	})
}

export const getFoldersByWorkspace = async (
	db: dbClient,
	workspaceId: number
) => {
	return db.query.folders.findMany({
		where: and(eq(folders.workspaceId, workspaceId), isNull(folders.deletedAt)),
		orderBy: [folders.index, folders.createdAt],
		with: {
			parent: true,
			children: {
				where: isNull(folders.deletedAt),
			},
			files: {
				where: isNull(files.deletedAt),
				orderBy: [files.index, files.createdAt],
			},
		},
	})
}

export const getChildFolders = async (db: dbClient, parentId: number) => {
	return db.query.folders.findMany({
		where: and(eq(folders.parentId, parentId), isNull(folders.deletedAt)),
		orderBy: [folders.index, folders.createdAt],
	})
}

export const updateFolder = async (
	db: dbClient,
	publicId: string,
	data: {
		name?: string
		color?: string | null
		isExpanded?: boolean
		index?: number
		parentId?: number
	}
) => {
	const [folder] = await db
		.update(folders)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(folders.publicId, publicId))
		.returning()
	return folder
}

export const deleteFolder = async (
	db: dbClient,
	publicId: string,
	deletedBy: string
) => {
	// Hard delete - permanently remove from database
	// First delete all files in the folder
	await db
		.delete(files)
		.where(eq(files.folderId, db.select({ id: folders.id }).from(folders).where(eq(folders.publicId, publicId))))
	
	// Then delete the folder itself
	const [folder] = await db
		.delete(folders)
		.where(eq(folders.publicId, publicId))
		.returning()
	return folder
}
