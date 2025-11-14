# File Storage API

## Overview
Standard Next.js API routes for handling file uploads and downloads. Uses filesystem storage instead of database storage for better performance and scalability.

## Endpoints

### Upload
**POST** `/api/storage/upload`

### Download
**GET** `/api/storage/download/[fileId]`

## Dependencies

```bash
pnpm add formidable fs-extra
pnpm add -D @types/formidable @types/fs-extra
```

## Implementation

### Upload Route
**Location:** `apps/web/src/pages/api/storage/upload.ts`

**Features:**
- ✅ Handles multipart form data
- ✅ Saves files to `/public/uploads/` directory
- ✅ Stores metadata in database (not file content)
- ✅ Supports files up to 100MB
- ✅ Generates unique filenames
- ✅ Validates required fields
- ✅ Cleans up orphaned files on error

### Download Route
**Location:** `apps/web/src/pages/api/storage/download/[fileId].ts`

**Features:**
- ✅ Streams files efficiently
- ✅ Validates file existence
- ✅ Sets proper content headers
- ✅ Supports download progress tracking
- ✅ Secure file access via publicId

## Upload API

### Request Format

#### Headers
```
Content-Type: multipart/form-data
```

#### Form Fields
- `file` (File) - The file to upload
- `workspaceId` (string) - Workspace ID
- `folderId` (string, optional) - Folder ID
- `userId` (string) - User ID (creator)

#### Example Usage

```typescript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('workspaceId', '123');
formData.append('folderId', '456');
formData.append('userId', 'user-uuid');

const response = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData,
});

const fileRecord = await response.json();
```

## Response Format

### Success (200)
```json
{
  "id": 1,
  "publicId": "abc123def456",
  "name": "document.pdf",
  "type": "pdf",
  "workspaceId": 123,
  "folderId": 456,
  "metadata": {
    "path": "/uploads/1731614774000_document.pdf",
    "size": 1024768,
    "mimeType": "application/pdf"
  },
  "createdBy": "user-uuid",
  "createdAt": "2025-11-14T19:32:54.000Z"
}
```

### Error Responses

#### 400 - Missing Required Fields
```json
{
  "error": "Missing required metadata"
}
```

#### 405 - Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```

#### 500 - Server Error
```json
{
  "error": "Internal server error during upload."
}
```

## Download API

### Request Format

#### URL Parameters
- `fileId` (string) - The file's publicId

#### Example Usage

```typescript
// Simple download
window.location.href = `/api/storage/download/${filePublicId}`;

// Or with fetch for more control
const response = await fetch(`/api/storage/download/${filePublicId}`);
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'filename.pdf';
a.click();
```

### Response Format

#### Success (200)
- **Headers:**
  - `Content-Type`: File's MIME type
  - `Content-Disposition`: `attachment; filename="document.pdf"`
  - `Content-Length`: File size in bytes
- **Body:** File stream (binary data)

#### Error Responses

##### 400 - Invalid File ID
```json
{
  "error": "Invalid file ID"
}
```

##### 404 - File Not Found (Database)
```json
{
  "error": "File not found or has no metadata"
}
```

##### 404 - File Not Found (Filesystem)
```json
{
  "error": "File not found on server storage"
}
```

##### 405 - Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```

##### 500 - Server Error
```json
{
  "error": "Internal server error during download."
}
```

## File Storage

### Directory Structure
```
apps/web/public/uploads/
├── README.md
├── 1731614774000_document.pdf
├── 1731614775000_image.jpg
└── 1731614776000_spreadsheet.xlsx
```

### Filename Format
`{timestamp}_{sanitized_original_name}{extension}`

Example: `1731614774000_my_document.pdf`

## Database Schema

Files are stored with metadata only:

```typescript
{
  name: "document.pdf",
  type: "pdf",
  metadata: {
    path: "/uploads/1731614774000_document.pdf",
    size: 1024768,
    mimeType: "application/pdf"
  },
  content: null // No content in DB
}
```

## Supported File Types

- **Editable**: `md`, `docx`, `list` (stored in DB `content` field)
- **Binary**: `pdf`, `jpg`, `png`, `gif`, `epub`, `binary` (stored on filesystem)

## Configuration

### Max File Size
Default: 100MB

To change, modify in `upload.ts`:
```typescript
maxFileSize: 100 * 1024 * 1024, // 100MB
```

### Upload Directory
Default: `public/uploads/`

Files in `public/` are automatically served by Next.js at `/uploads/{filename}`

## Security Considerations

1. **File Size Limits**: Enforced at 100MB
2. **Filename Sanitization**: Spaces replaced with underscores
3. **Unique Filenames**: Timestamp prefix prevents collisions
4. **Orphan Cleanup**: Failed uploads are deleted from filesystem
5. **Validation**: Required fields checked before saving

## Next Steps

1. Add authentication/authorization checks
2. Implement virus scanning
3. Add image thumbnail generation
4. Create download API route
5. Add file deletion cleanup
6. Implement file type validation
7. Add progress tracking for large files

## Related Files

- Schema: `packages/db/src/schema/files.ts`
- Migration: `packages/db/migrations/20251114_add_binary_file_type.sql`
- Documentation: `docs/FILE_STORAGE_REFACTOR.md`
