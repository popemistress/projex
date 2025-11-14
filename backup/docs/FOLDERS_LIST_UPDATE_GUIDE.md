# FoldersList Component Update Guide

## Overview
This guide documents the changes needed to integrate the new file upload system into the FoldersList component.

## Key Changes

### 1. Import the New Upload Hook
```typescript
import { useFileUpload } from "~/hooks/useFileUpload";
```

### 2. Add File Input Ref
```typescript
const fileInputRef = useRef<HTMLInputElement>(null);
const [targetFolderId, setTargetFolderId] = useState<number | undefined>(undefined);
```

### 3. Use the Upload Hook
```typescript
const { uploadFile, downloadFile, progress, isUploading } = useFileUpload();
```

### 4. Add Upload Handlers
```typescript
const handleTriggerUpload = (folderId?: number) => {
  setTargetFolderId(folderId);
  fileInputRef.current?.click();
};

const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    await uploadFile(file, targetFolderId);
  }
  // Clear the input to allow re-uploading the same file
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};
```

### 5. Add Hidden File Input
```tsx
<input 
  type="file" 
  ref={fileInputRef} 
  className="hidden" 
  onChange={handleFileSelected} 
/>
```

### 6. Add Progress Indicator
```tsx
{isUploading && (
  <div className="fixed bottom-4 right-4 z-50 w-64 rounded-md border bg-white p-3 shadow-lg dark:border-dark-500 dark:bg-dark-200">
    <div className="mb-1 flex justify-between text-xs font-medium text-neutral-700 dark:text-dark-900">
      <span>Uploading...</span>
      <span>{progress}%</span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-light-200 dark:bg-dark-400">
      <div 
        className="h-1.5 rounded-full bg-primary-500 transition-all duration-150" 
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
)}
```

### 7. Add Upload Button to Menu
```tsx
<Menu.Item>
  {({ active }) => (
    <button
      onClick={() => handleTriggerUpload(undefined)} // Undefined = Root
      className={twMerge(
        "flex w-full items-center gap-3 px-4 py-2 text-sm",
        active ? "bg-light-100 dark:bg-dark-300" : "text-neutral-700 dark:text-dark-900"
      )}
    >
      <HiCloudArrowUp className="h-4 w-4" />
      <span>Upload File</span>
    </button>
  )}
</Menu.Item>
```

### 8. Add Upload to Folder Menu
```tsx
<Menu.Item>
  {({ active }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleTriggerUpload(folder.id as number);
      }}
      className={twMerge(
        "flex w-full items-center gap-3 px-4 py-2 text-sm",
        active ? "bg-light-100 dark:bg-dark-300" : "text-neutral-700 dark:text-dark-900"
      )}
    >
      <HiCloudArrowUp className="h-4 w-4" />
      <span>Upload to folder</span>
    </button>
  )}
</Menu.Item>
```

### 9. Update File Click Handler
```typescript
const handleItemClick = (item: ListItem) => {
  const textTypes = ['list', 'docx', 'md'];
  if (textTypes.includes(item.type)) {
    // Open editor for text-based files
    openModal(`FILE_EDITOR_${item.type.toUpperCase()}`, `${item.publicId}`);
  } else if (item.type !== 'folder') {
    // Download binary files
    downloadFile(item.publicId);
  }
};
```

### 10. Add File Icon Helper
```typescript
const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'list': return <HiListBullet className="h-4 w-4 flex-shrink-0" />;
    case 'docx': return <HiDocumentText className="h-4 w-4 flex-shrink-0" />;
    case 'md': return <HiDocument className="h-4 w-4 flex-shrink-0" />;
    case 'xlsx': return <HiTableCells className="h-4 w-4 flex-shrink-0" />;
    case 'jpg':
    case 'png':
    case 'gif':
      return <HiPhoto className="h-4 w-4 flex-shrink-0" />;
    default:
      return <HiDocument className="h-4 w-4 flex-shrink-0" />;
  }
};
```

## What to Remove

### Remove Old Base64 Upload Logic
Delete the inline file upload code that uses:
- `FileReader` and `readAsDataURL`
- `api.upload.uploadFile.mutate` with base64 data
- The old upload input inside menu items

### Remove Old Upload API References
The old tRPC upload endpoint is no longer needed since we're using standard Next.js API routes.

## Benefits of New Approach

1. **Progress Tracking**: Real-time upload progress indicator
2. **No Size Limits**: No tRPC payload restrictions
3. **Better Performance**: Streaming instead of base64 encoding
4. **Cleaner Code**: Separated upload logic into a reusable hook
5. **Download Support**: Built-in download functionality

## Testing Checklist

- [ ] Upload file to root (no folder)
- [ ] Upload file to specific folder
- [ ] Progress indicator shows during upload
- [ ] Success message appears after upload
- [ ] File list refreshes automatically
- [ ] Download binary files (PDF, images)
- [ ] Open editable files (MD, DOCX, LIST)
- [ ] Multiple uploads work correctly
- [ ] Error handling works (network errors, file too large)

## Next Steps

1. Update FoldersListNew.tsx with the new upload logic
2. Test all upload scenarios
3. Add file type validation if needed
4. Consider adding drag-and-drop upload
5. Add thumbnail generation for images
