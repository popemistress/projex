# File Storage Refactor

## Overview
Updated the file storage system to use filesystem-based storage with metadata tracking instead of storing file content directly in the database.

## Changes Made

### 1. Schema Updates (`packages/db/src/schema/files.ts`)

#### Added 'binary' File Type
```typescript
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
  'binary', // NEW: Generic type for any file
] as const
```

#### Updated Files Table Structure
```typescript
export const files = pgTable('files', {
  // ... existing fields ...
  
  // Text content for *editable* files (md, docx, lists)
  content: text('content'),
  contentCompressed: text('contentCompressed'),
  
  // NEW: Metadata stores physical storage info
  // e.g., { path: "/uploads/my_file.pdf", size: 1024768, mimeType: "application/pdf" }
  metadata: jsonb('metadata'),
  
  // ... rest of fields ...
})
```

### 2. Database Migration
Created migration: `packages/db/migrations/20251114_add_binary_file_type.sql`
- Adds 'binary' value to the `file_type` enum

### 3. Storage Strategy

#### For Editable Files (md, docx, list)
- **Store in DB**: Use `content` or `contentCompressed` fields
- **Reason**: Need direct access for editing, searching, versioning

#### For Binary/Media Files (pdf, images, binary)
- **Store on Filesystem**: Save to `/storage/uploads/` directory
- **Store in DB**: Only metadata in `metadata` jsonb field
- **Metadata Format**:
  ```json
  {
    "path": "/storage/uploads/workspace_123/file_abc.pdf",
    "size": 1024768,
    "mimeType": "application/pdf"
  }
  ```

## Benefits

1. **Performance**: Database stays lean, queries are faster
2. **Scalability**: Files can be moved to CDN/cloud storage easily
3. **Efficiency**: No base64 encoding overhead
4. **Size Limits**: No tRPC payload size restrictions
5. **Flexibility**: Easy to add file processing (thumbnails, compression, etc.)

## Next Steps

1. Create upload API endpoint that saves files to filesystem
2. Update file retrieval to serve from filesystem
3. Implement file cleanup on deletion
4. Add file size validation
5. Consider adding virus scanning for uploads

## Migration Path

For existing files in the database:
1. Extract files from `content` field
2. Save to filesystem
3. Update `metadata` field with file path
4. Clear `content` field for binary files
