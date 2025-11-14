# File Creation Feature Documentation

## Overview
This document describes the comprehensive file creation feature that allows users to create and edit various file types within folders in the left navigation menu.

## Features Implemented

### 1. File Types Supported
- **Folder** - Organize content hierarchically
- **List** - Task/item lists
- **Doc (.docx)** - Rich text documents with formatting
- **Markdown (.md)** - Markdown files with live preview
- **Text File (.txt)** - Plain text files
- **Spreadsheet (.xlsx)** - Excel-compatible spreadsheets

### 2. File Creation Menu
Located in the folder's 3-dot menu (ellipsis icon) in the left navigation:
- Click the 3 dots next to any folder
- Select "Create in folder"
- Choose from the submenu of file types
- Each file type has an appropriate icon

### 3. File Editors

#### Text Editor (`TextEditor.tsx`)
- Simple plain text editing
- Monospace font
- Auto-save functionality (3-second debounce)
- Export to .txt file
- Unsaved changes indicator

#### Markdown Editor (`MarkdownEditor.tsx`)
- Three view modes: Edit, Split, Preview
- Live markdown preview with GitHub Flavored Markdown support
- Syntax highlighting
- Auto-save functionality
- Export to .md file
- Supports:
  - Headers, lists, links
  - Code blocks
  - Tables
  - Raw HTML (via rehype-raw)

#### DOCX Editor (`DocxEditor.tsx`)
- Rich text editing powered by TipTap
- Formatting toolbar with:
  - Headings (H1, H2, H3)
  - Bold, Italic
  - Bullet lists, Numbered lists
  - Links
- Auto-save functionality
- Export to .docx (HTML format)
- Keyboard shortcuts (Ctrl+B, Ctrl+I)

#### Spreadsheet Editor (`SpreadsheetEditor.tsx`)
- Grid-based interface
- Add rows and columns dynamically
- Cell editing
- Auto-save functionality
- Export to .xlsx file (Excel format)
- Powered by react-spreadsheet and xlsx libraries

### 4. Technical Implementation

#### File Structure
```
apps/web/src/
├── components/
│   ├── editors/
│   │   ├── TextEditor.tsx
│   │   ├── MarkdownEditor.tsx
│   │   ├── DocxEditor.tsx
│   │   ├── SpreadsheetEditor.tsx
│   │   └── index.ts
│   ├── FileEditorModal.tsx
│   ├── FoldersList.tsx (updated)
│   └── Dashboard.tsx (updated)
├── hooks/
│   ├── useFileCreation.ts
│   └── useAutoSave.ts
├── types/
│   └── file.ts
└── utils/
    └── fileExport.ts
```

#### Key Components

**`useFileCreation` Hook**
- Creates, updates, deletes, and retrieves files
- Stores files in localStorage (workspace-specific)
- Emits custom events for file operations
- Manages file metadata (id, name, type, timestamps, content)

**`useAutoSave` Hook**
- Debounced auto-save (default 3 seconds)
- Tracks content changes
- Prevents unnecessary saves
- Configurable delay and enable/disable

**`fileExport` Utility**
- Exports files to their native formats
- Uses file-saver for downloads
- XLSX library for spreadsheet export
- Handles different file types appropriately

**`FileEditorModal` Component**
- Renders the appropriate editor based on file type
- Manages modal state
- Handles file loading and saving
- Full-screen modal (90vh x 90vw)

#### State Management
- Files stored in localStorage with keys: `kan_files_{workspaceId}_{folderId}`
- Folders stored separately: `kan_folders_{workspaceId}`
- Custom events for cross-component communication:
  - `fileCreated` - Triggered when a file is created
  - `fileUpdated` - Triggered when a file is updated
  - `fileDeleted` - Triggered when a file is deleted
  - `folderCreated` - Triggered when a folder is created

### 5. Dependencies Added
```json
{
  "dependencies": {
    "@monaco-editor/react": "^4.7.0",
    "file-saver": "^2.0.5",
    "react-spreadsheet": "^0.10.1",
    "rehype-raw": "^7.0.0",
    "remark-gfm": "^4.0.1",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7"
  }
}
```

### 6. User Experience Features

#### Auto-Save
- All editors auto-save after 3 seconds of inactivity
- Visual indicator shows unsaved changes
- Prevents data loss

#### Unsaved Changes Protection
- Confirmation dialog when closing with unsaved changes
- Applies to all editor types

#### File Organization
- Files displayed under their parent folder when expanded
- Appropriate icons for each file type
- Click to open in editor
- Smooth animations and transitions

#### Export Functionality
- Export button in each editor
- Downloads file in native format
- Preserves file name and extension

### 7. UI/UX Highlights

#### Responsive Design
- Full-screen modal editors (90% viewport)
- Works on desktop and mobile
- Touch-friendly interface

#### Dark Mode Support
- All editors support dark mode
- Consistent theming with the application
- Proper contrast ratios

#### Keyboard Shortcuts
- **Ctrl+B** - Bold (DOCX editor)
- **Ctrl+I** - Italic (DOCX editor)
- Standard text editing shortcuts in all editors

#### Smooth Animations
- Menu transitions (100ms ease-out)
- Hover states on all interactive elements
- Loading states (where applicable)

### 8. Future Enhancements

Potential improvements for future iterations:

1. **Real-time Collaboration**
   - Multiple users editing simultaneously
   - Cursor presence indicators
   - Conflict resolution

2. **Version History**
   - Track file changes over time
   - Restore previous versions
   - Compare versions

3. **Advanced Spreadsheet Features**
   - Formulas and calculations
   - Cell formatting (colors, borders)
   - Charts and graphs
   - Data validation

4. **Enhanced DOCX Export**
   - True DOCX format (using docx.js)
   - Image embedding
   - Tables support
   - Page layout options

5. **File Search**
   - Search within files
   - Filter by file type
   - Recent files list

6. **File Sharing**
   - Share files with team members
   - Permission management
   - Public links

7. **Cloud Storage Integration**
   - Replace localStorage with API
   - Sync across devices
   - Backup and restore

8. **Templates**
   - Pre-built file templates
   - Custom template creation
   - Template library

### 9. Testing Recommendations

#### Manual Testing Checklist
- [ ] Create each file type in a folder
- [ ] Edit and save content in each editor
- [ ] Verify auto-save works (wait 3+ seconds)
- [ ] Test export functionality for each file type
- [ ] Confirm unsaved changes warning works
- [ ] Test dark mode in all editors
- [ ] Verify files persist after page refresh
- [ ] Test with multiple folders and files
- [ ] Check responsive behavior on mobile
- [ ] Verify keyboard shortcuts work

#### Automated Testing
Consider adding:
- Unit tests for hooks (useFileCreation, useAutoSave)
- Integration tests for file operations
- E2E tests for complete user workflows
- Snapshot tests for editor components

### 10. Known Limitations

1. **Storage**: Files stored in localStorage (5-10MB limit per domain)
2. **DOCX Export**: Currently exports as HTML, not true DOCX format
3. **Spreadsheet**: Basic functionality only, no formulas or advanced features
4. **File Size**: Large files may cause performance issues
5. **Browser Compatibility**: Requires modern browser with localStorage support

### 11. Troubleshooting

**Files not appearing after creation:**
- Check browser console for errors
- Verify localStorage is enabled
- Ensure workspace.publicId is set correctly

**Auto-save not working:**
- Check that content is actually changing
- Verify 3-second delay has passed
- Look for console errors

**Export not downloading:**
- Check browser's download settings
- Verify file-saver library is loaded
- Check for popup blockers

**Editor not opening:**
- Verify modal system is working
- Check that file ID is correct
- Ensure FileEditorModal is rendered in Dashboard

## Conclusion

This file creation feature provides a comprehensive solution for creating and editing various file types within the application. It follows modern UX patterns similar to Notion and ClickUp, with auto-save, export capabilities, and a clean, intuitive interface.

The implementation is modular, extensible, and follows React best practices with TypeScript for type safety. The feature is production-ready with room for future enhancements based on user feedback and requirements.
