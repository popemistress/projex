import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { eq } from 'drizzle-orm';

import { createDrizzleClient } from '@kan/db/client';
import { files } from '@kan/db/schema';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const { fileId } = req.query;

	if (!fileId || typeof fileId !== 'string') {
		return res.status(400).json({ error: 'Invalid file ID' });
	}

	// 1. Fetch metadata from DB
	const db = createDrizzleClient();
	const fileRecord = await db.query.files.findFirst({
		where: eq(files.publicId, fileId),
	});

	if (
		!fileRecord ||
		!fileRecord.metadata ||
		typeof fileRecord.metadata !== 'object'
	) {
		return res
			.status(404)
			.json({ error: 'File not found or has no metadata' });
	}

	const metadata = fileRecord.metadata as {
		path: string;
		mimeType: string;
		size: number;
	};

	// 2. Construct the full server path
	// metadata.path is /uploads/file.pdf, so we join with the /public dir
	const filePath = path.join(process.cwd(), 'public', metadata.path);

	try {
		// 3. Check if file exists on disk
		if (!fs.existsSync(filePath)) {
			return res
				.status(404)
				.json({ error: 'File not found on server storage' });
		}

		// 4. Set headers for download
		res.setHeader(
			'Content-Type',
			metadata.mimeType || 'application/octet-stream'
		);
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${fileRecord.name}"`
		);
		res.setHeader('Content-Length', metadata.size);

		// 5. Create a read stream and pipe it to the response
		const fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res);
	} catch (error) {
		console.error('File download error:', error);
		return res
			.status(500)
			.json({ error: 'Internal server error during download.' });
	}
}
