import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs-extra';
import path from 'path';

import { createDrizzleClient } from '@kan/db/client';
import { files, fileTypes, workspaces } from '@kan/db/schema';
import { generateUID } from '@kan/shared';
import { eq } from 'drizzle-orm';

export const config = {
	api: {
		bodyParser: false, // Disables built-in parser, crucial for file streams
	},
};

// This is the key: We save files to the `public` directory of the Next.js app.
// This makes them publicly accessible for download *and* works perfectly
// on Vercel or any Node.js server.
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists on server start
fs.ensureDirSync(UPLOAD_DIR);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const form = formidable({
		uploadDir: UPLOAD_DIR,
		keepExtensions: true,
		maxFileSize: 100 * 1024 * 1024, // 100MB limit (adjustable)
		filename: (_name, ext, part, _form) => {
			// Create a unique, clean filename
			return `${Date.now()}_${part.originalFilename?.replace(/\s/g, '_') ?? 'file'}${ext}`;
		},
	});

	try {
		// Create database client once at the start
		const db = createDrizzleClient();

		// Use promise wrapper for better error handling
		const [fields, incomingFiles] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) reject(err);
				else resolve([fields, files]);
			});
		});

		const uploadedFile = incomingFiles.file?.[0];
		if (!uploadedFile) throw new Error('No file uploaded');

		// Parse fields (formidable v3 returns arrays for fields)
		const workspacePublicIdRaw = Array.isArray(fields.workspacePublicId) ? fields.workspacePublicId[0] : fields.workspacePublicId;
		const folderIdRaw = Array.isArray(fields.folderId) ? fields.folderId[0] : fields.folderId;
		const userIdRaw = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

		const workspacePublicId = workspacePublicIdRaw;
		const folderId = folderIdRaw ? parseInt(folderIdRaw) : null;
		const createdBy = userIdRaw;

		if (!workspacePublicId || !createdBy) {
			// Clean up orphaned file if validation fails
			await fs.unlink(uploadedFile.filepath);
			return res.status(400).json({ error: 'Missing required metadata (workspacePublicId or userId)' });
		}

		// Get the numeric workspace ID from publicId
		const workspace = await db.query.workspaces.findFirst({
			where: eq(workspaces.publicId, workspacePublicId),
		});

		if (!workspace) {
			await fs.unlink(uploadedFile.filepath);
			return res.status(404).json({ error: 'Workspace not found' });
		}

		const workspaceId = workspace.id;

		// Determine file type from schema enum
		const ext = path
			.extname(uploadedFile.originalFilename || '')
			.toLowerCase()
			.replace('.', '');
		const validTypes: string[] = [...fileTypes];
		const fileType = validTypes.includes(ext) ? ext : 'binary';

		// Get the *relative* path for database storage
		const relativePath = path.join(
			'/uploads',
			path.basename(uploadedFile.filepath)
		);

		// Save reference to Database
		const [newFileRecord] = await db
			.insert(files)
			.values({
				publicId: generateUID(), // Use your 12-char UID generator
				name: uploadedFile.originalFilename || 'Untitled File',
				type: fileType as any, // Cast to 'any' to satisfy enum type
				workspaceId,
				folderId,
				createdBy,
				// Store the storage metadata in the new jsonb column
				metadata: {
					path: relativePath, // Save the path relative to the /public dir
					size: uploadedFile.size,
					mimeType: uploadedFile.mimetype,
				},
				content: null, // Content is on disk, not in DB
			})
			.returning();

		return res.status(200).json(newFileRecord);
	} catch (error) {
		console.error('File upload error:', error);
		return res
			.status(500)
			.json({ error: 'Internal server error during upload.' });
	}
}
