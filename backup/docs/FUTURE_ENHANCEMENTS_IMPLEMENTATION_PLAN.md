# Future Enhancements - Implementation Plan

## Overview
This document outlines the comprehensive implementation plan for all future enhancements to the file creation feature. Due to the extensive scope of these enhancements, this serves as a detailed roadmap for implementation.

---

## ✅ Phase 1: Backend API Integration (STARTED)

### Database Schema Created
- ✅ Created `/packages/db/src/schema/files.ts` with complete schema
- ✅ Added to schema exports in `/packages/db/src/schema/index.ts`

### Schema Includes:
1. **`folders` table** - Hierarchical folder structure
   - publicId, name, parentId, workspaceId
   - isExpanded, index (for ordering)
   - Soft delete support
   - Relations to workspace, parent/children folders, files

2. **`files` table** - File storage
   - publicId, name, type (enum), content
   - contentCompressed (for large files)
   - metadata (JSONB for extensibility)
   - folderId, workspaceId, index
   - isTemplate, templateCategory
   - Soft delete support

3. **`fileVersions` table** - Version history
   - fileId, content, versionNumber
   - changeDescription
   - Timestamps for each version

4. **`fileShares` table** - File sharing
   - fileId, userId, email
   - permission (view/edit/admin)
   - expiresAt, revokedAt
   - Tracks who shared and who revoked

5. **`fileCollaborators` table** - Real-time collaboration
   - fileId, userId
   - cursorPosition (JSONB)
   - isActive, lastSeenAt
   - Tracks active editors

### Next Steps for Phase 1:
1. **Create Repository Layer** (`/packages/db/src/repository/file.repo.ts`)
   - Follow pattern from `board.repo.ts`
   - All methods receive `db: dbClient` as first parameter
   - Implement CRUD for files, folders, versions, shares, collaborators

2. **Create API Routes** (`/apps/web/src/app/api/files/...`)
   - POST `/api/files` - Create file
   - GET `/api/files/[id]` - Get file
   - PATCH `/api/files/[id]` - Update file
   - DELETE `/api/files/[id]` - Delete file
   - GET `/api/files/search` - Search files
   - POST `/api/files/[id]/versions` - Create version
   - GET `/api/files/[id]/versions` - Get versions
   - POST `/api/files/[id]/share` - Share file
   - GET `/api/folders` - Get folders
   - POST `/api/folders` - Create folder

3. **Update Frontend Hooks**
   - Replace localStorage with API calls in `useFileCreation.ts`
   - Add React Query for caching and optimistic updates
   - Keep localStorage as fallback for offline mode

4. **Migration Strategy**
   - Create migration script to move localStorage data to database
   - Run on first load after update
   - Preserve all existing files and folders

---

## 📦 Phase 2: Real-Time Collaboration

### Dependencies Installed
- ✅ `socket.io-client@^4.8.1`

### Implementation Plan:

#### 1. WebSocket Server Setup
```typescript
// apps/web/src/lib/socket/server.ts
import { Server } from 'socket.io'

export function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_BASE_URL }
  })

  io.on('connection', (socket) => {
    // Join file room
    socket.on('join-file', ({ fileId, userId }) => {
      socket.join(`file:${fileId}`)
      // Broadcast user joined
      socket.to(`file:${fileId}`).emit('user-joined', { userId })
    })

    // Handle content changes
    socket.on('content-change', ({ fileId, content, userId }) => {
      socket.to(`file:${fileId}`).emit('content-updated', { content, userId })
    })

    // Handle cursor position
    socket.on('cursor-move', ({ fileId, position, userId }) => {
      socket.to(`file:${fileId}`).emit('cursor-updated', { position, userId })
    })

    // Leave file room
    socket.on('leave-file', ({ fileId, userId }) => {
      socket.leave(`file:${fileId}`)
      socket.to(`file:${fileId}`).emit('user-left', { userId })
    })
  })

  return io
}
```

#### 2. Client-Side Hook
```typescript
// apps/web/src/hooks/useCollaboration.ts
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useCollaboration(fileId: string, userId: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [activeUsers, setActiveUsers] = useState<string[]>([])

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!)
    setSocket(newSocket)

    newSocket.emit('join-file', { fileId, userId })

    newSocket.on('user-joined', ({ userId }) => {
      setActiveUsers(prev => [...prev, userId])
    })

    newSocket.on('user-left', ({ userId }) => {
      setActiveUsers(prev => prev.filter(id => id !== userId))
    })

    return () => {
      newSocket.emit('leave-file', { fileId, userId })
      newSocket.close()
    }
  }, [fileId, userId])

  return { socket, activeUsers }
}
```

#### 3. Editor Integration
- Add collaboration indicators to all editors
- Show active users with avatars
- Display cursor positions for other users
- Implement Operational Transformation (OT) or CRDT for conflict resolution
- Add "Someone is typing..." indicator

#### 4. Conflict Resolution
- Use Yjs or Automerge for CRDT-based collaboration
- Or implement custom OT algorithm
- Handle network disconnections gracefully
- Queue changes when offline, sync when reconnected

---

## 📜 Phase 3: Version History

### Implementation Plan:

#### 1. Auto-Versioning System
```typescript
// apps/web/src/hooks/useVersioning.ts
export function useVersioning(fileId: string) {
  const createVersion = async (content: string, description?: string) => {
    const latestVersion = await getLatestVersionNumber(fileId)
    await api.post(`/api/files/${fileId}/versions`, {
      content,
      versionNumber: latestVersion + 1,
      changeDescription: description
    })
  }

  // Auto-create version every N saves or time interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasChanges) {
        createVersion(currentContent, 'Auto-save checkpoint')
      }
    }, 5 * 60 * 1000) // Every 5 minutes

    return () => clearInterval(interval)
  }, [hasChanges, currentContent])

  return { createVersion }
}
```

#### 2. Version History UI
```typescript
// apps/web/src/components/VersionHistory.tsx
export function VersionHistory({ fileId }: { fileId: string }) {
  const { data: versions } = useQuery(['file-versions', fileId], () =>
    api.get(`/api/files/${fileId}/versions`)
  )

  return (
    <div className="version-history">
      <h3>Version History</h3>
      {versions?.map(version => (
        <div key={version.id} className="version-item">
          <div>Version {version.versionNumber}</div>
          <div>{formatDate(version.createdAt)}</div>
          <div>{version.changeDescription}</div>
          <button onClick={() => restoreVersion(version.id)}>
            Restore
          </button>
          <button onClick={() => compareVersions(version.id)}>
            Compare
          </button>
        </div>
      ))}
    </div>
  )
}
```

#### 3. Version Comparison
- Implement diff view showing changes between versions
- Use `diff` library for text comparison
- Highlight additions in green, deletions in red
- Side-by-side or inline diff view

#### 4. Version Restoration
- Allow restoring to any previous version
- Create new version when restoring (don't overwrite)
- Show confirmation dialog before restoring
- Preserve all versions (never delete)

---

## 🔍 Phase 4: File Search

### Implementation Plan:

#### 1. Search API
```typescript
// apps/web/src/app/api/files/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const workspaceId = searchParams.get('workspaceId')

  const results = await db
    .select()
    .from(files)
    .where(
      and(
        eq(files.workspaceId, workspaceId),
        or(
          sql`${files.name} ILIKE ${`%${query}%`}`,
          sql`${files.content} ILIKE ${`%${query}%`}`
        )
      )
    )
    .limit(50)

  return Response.json(results)
}
```

#### 2. Search Component
```typescript
// apps/web/src/components/FileSearch.tsx
export function FileSearch() {
  const [query, setQuery] = useState('')
  const { data: results, isLoading } = useQuery(
    ['file-search', query],
    () => api.get(`/api/files/search?q=${query}`),
    { enabled: query.length > 2 }
  )

  return (
    <div className="file-search">
      <input
        type="search"
        placeholder="Search files..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isLoading && <div>Searching...</div>}
      {results?.map(file => (
        <FileSearchResult key={file.id} file={file} />
      ))}
    </div>
  )
}
```

#### 3. Advanced Search Features
- Filter by file type
- Filter by date range
- Filter by author
- Search within specific folders
- Recent files list
- Frequently accessed files

#### 4. Search Optimization
- Add full-text search index in database
- Use PostgreSQL's `ts_vector` for better search
- Implement search result highlighting
- Add search history
- Implement fuzzy search

---

## 📊 Phase 5: Advanced Spreadsheet Features

### Dependencies Installed
- ✅ `recharts@^3.4.1` (for charts)

### Implementation Plan:

#### 1. Formula Engine
```typescript
// apps/web/src/utils/spreadsheetFormulas.ts
export class FormulaEngine {
  evaluate(formula: string, data: SpreadsheetData): any {
    // Parse formula (e.g., "=SUM(A1:A10)")
    // Support functions: SUM, AVERAGE, COUNT, MIN, MAX, IF, etc.
    // Handle cell references
    // Handle ranges
    // Return calculated value
  }

  getCellValue(ref: string, data: SpreadsheetData): any {
    // Parse cell reference (e.g., "A1")
    // Return cell value
  }

  getRange(range: string, data: SpreadsheetData): any[] {
    // Parse range (e.g., "A1:A10")
    // Return array of values
  }
}
```

#### 2. Enhanced Spreadsheet Editor
```typescript
// Update SpreadsheetEditor.tsx
- Add formula bar
- Add function autocomplete
- Add cell formatting options (bold, italic, colors)
- Add number formatting (currency, percentage, decimals)
- Add cell borders
- Add cell merging
- Add freeze panes
- Add sorting
- Add filtering
```

#### 3. Charts Integration
```typescript
// apps/web/src/components/SpreadsheetChart.tsx
import { LineChart, BarChart, PieChart } from 'recharts'

export function SpreadsheetChart({ data, type }: Props) {
  switch (type) {
    case 'line':
      return <LineChart data={data} />
    case 'bar':
      return <BarChart data={data} />
    case 'pie':
      return <PieChart data={data} />
  }
}
```

#### 4. Advanced Features
- Conditional formatting
- Data validation
- Pivot tables
- Named ranges
- Cell comments
- Protected sheets
- Import/export CSV

---

## 📄 Phase 6: True DOCX Export

### Dependencies Installed
- ✅ `docx@^9.5.1`

### Implementation Plan:

#### 1. DOCX Export Utility
```typescript
// apps/web/src/utils/docxExport.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

export async function exportToDocx(content: string, filename: string) {
  // Parse TipTap JSON content
  const doc = new Document({
    sections: [{
      properties: {},
      children: parseContent(content)
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${filename}.docx`)
}

function parseContent(content: string): Paragraph[] {
  const json = JSON.parse(content)
  const paragraphs: Paragraph[] = []

  // Convert TipTap nodes to docx paragraphs
  json.content.forEach(node => {
    if (node.type === 'heading') {
      paragraphs.push(new Paragraph({
        text: node.content[0].text,
        heading: HeadingLevel[`HEADING_${node.attrs.level}`]
      }))
    } else if (node.type === 'paragraph') {
      const runs = node.content.map(inline => 
        new TextRun({
          text: inline.text,
          bold: inline.marks?.some(m => m.type === 'bold'),
          italics: inline.marks?.some(m => m.type === 'italic')
        })
      )
      paragraphs.push(new Paragraph({ children: runs }))
    }
  })

  return paragraphs
}
```

#### 2. Enhanced Features
- Support for images
- Support for tables
- Support for lists (bullet/numbered)
- Support for links
- Support for text formatting (colors, fonts, sizes)
- Page layout options
- Headers and footers

---

## 🔐 Phase 7: File Sharing & Permissions

### Implementation Plan:

#### 1. Share Dialog Component
```typescript
// apps/web/src/components/ShareFileDialog.tsx
export function ShareFileDialog({ fileId }: Props) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'view' | 'edit'>('view')
  const [expiresIn, setExpiresIn] = useState<number | null>(null)

  const shareFile = async () => {
    await api.post(`/api/files/${fileId}/share`, {
      email,
      permission,
      expiresAt: expiresIn ? addDays(new Date(), expiresIn) : null
    })
  }

  return (
    <Dialog>
      <input
        type="email"
        placeholder="Enter email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select value={permission} onChange={(e) => setPermission(e.target.value)}>
        <option value="view">Can view</option>
        <option value="edit">Can edit</option>
        <option value="admin">Can admin</option>
      </select>
      <select value={expiresIn} onChange={(e) => setExpiresIn(Number(e.target.value))}>
        <option value="">Never expires</option>
        <option value="1">1 day</option>
        <option value="7">7 days</option>
        <option value="30">30 days</option>
      </select>
      <button onClick={shareFile}>Share</button>
    </Dialog>
  )
}
```

#### 2. Permission Checking
```typescript
// apps/web/src/utils/permissions.ts
export async function checkFilePermission(
  fileId: string,
  userId: string,
  requiredPermission: 'view' | 'edit' | 'admin'
): Promise<boolean> {
  const share = await api.get(`/api/files/${fileId}/share/${userId}`)
  
  if (!share) return false
  if (share.revokedAt) return false
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) return false

  const permissionLevels = { view: 1, edit: 2, admin: 3 }
  return permissionLevels[share.permission] >= permissionLevels[requiredPermission]
}
```

#### 3. Shared Files View
- List of files shared with user
- List of files user has shared
- Ability to revoke access
- Notification when file is shared
- Public link generation (optional)

---

## 📋 Phase 8: File Templates

### Implementation Plan:

#### 1. Template Creation
```typescript
// apps/web/src/components/CreateTemplate.tsx
export function CreateTemplate({ fileId }: Props) {
  const [category, setCategory] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const createTemplate = async () => {
    await api.post(`/api/files/${fileId}/template`, {
      category,
      isPublic
    })
  }

  return (
    <Dialog>
      <input
        placeholder="Template category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Make public
      </label>
      <button onClick={createTemplate}>Create Template</button>
    </Dialog>
  )
}
```

#### 2. Template Library
```typescript
// apps/web/src/components/TemplateLibrary.tsx
export function TemplateLibrary() {
  const { data: templates } = useQuery(['templates'], () =>
    api.get('/api/templates')
  )

  const categories = groupBy(templates, 'templateCategory')

  return (
    <div className="template-library">
      {Object.entries(categories).map(([category, templates]) => (
        <div key={category}>
          <h3>{category}</h3>
          <div className="template-grid">
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => createFromTemplate(template.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### 3. Pre-built Templates
- Meeting Notes
- Project Plan
- Weekly Report
- Invoice
- Resume
- Budget Spreadsheet
- Task List
- Technical Documentation
- Product Requirements
- Design Brief

---

## 🗜️ Phase 9: File Compression

### Dependencies Installed
- ✅ `pako@^2.1.0` (gzip compression)

### Implementation Plan:

#### 1. Compression Utility
```typescript
// apps/web/src/utils/compression.ts
import pako from 'pako'

export function compressContent(content: string): string {
  const compressed = pako.deflate(content, { level: 9 })
  return btoa(String.fromCharCode(...compressed))
}

export function decompressContent(compressed: string): string {
  const binary = atob(compressed)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const decompressed = pako.inflate(bytes, { to: 'string' })
  return decompressed
}
```

#### 2. Auto-Compression
```typescript
// Automatically compress files over certain size
const COMPRESSION_THRESHOLD = 100 * 1024 // 100KB

export async function saveFile(fileId: string, content: string) {
  const size = new Blob([content]).size

  if (size > COMPRESSION_THRESHOLD) {
    const compressed = compressContent(content)
    await api.patch(`/api/files/${fileId}`, {
      contentCompressed: compressed,
      content: null, // Clear uncompressed
      metadata: { originalSize: size, compressed: true }
    })
  } else {
    await api.patch(`/api/files/${fileId}`, {
      content,
      contentCompressed: null
    })
  }
}
```

#### 3. Transparent Decompression
- Automatically decompress when loading
- Show compression ratio in file metadata
- Option to manually compress/decompress
- Compression statistics dashboard

---

## 🎯 Phase 10: Drag & Drop Reordering

### Dependencies Installed
- ✅ `@dnd-kit/core@^6.3.1`
- ✅ `@dnd-kit/sortable@^10.0.0`
- ✅ `@dnd-kit/utilities@^3.2.2`

### Implementation Plan:

#### 1. Sortable Files
```typescript
// apps/web/src/components/SortableFileList.tsx
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export function SortableFileList({ files, onReorder }: Props) {
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = files.findIndex(f => f.id === active.id)
      const newIndex = files.findIndex(f => f.id === over.id)
      onReorder(oldIndex, newIndex)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={files} strategy={verticalListSortingStrategy}>
        {files.map(file => (
          <SortableFileItem key={file.id} file={file} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

#### 2. Sortable Folders
- Drag files between folders
- Drag folders to reorder
- Drag folders into other folders (nesting)
- Visual feedback during drag
- Prevent invalid drops

#### 3. Persistence
- Save new order to database
- Update `index` field on files/folders
- Optimistic updates in UI
- Handle conflicts gracefully

---

## 📈 Implementation Timeline

### Sprint 1 (Week 1-2): Backend Foundation
- ✅ Database schema
- Repository layer
- API routes
- Migration from localStorage

### Sprint 2 (Week 3-4): Real-Time Collaboration
- WebSocket server setup
- Client-side collaboration hooks
- Cursor tracking
- Conflict resolution

### Sprint 3 (Week 5-6): Version History & Search
- Version creation and storage
- Version history UI
- Version comparison
- File search implementation

### Sprint 4 (Week 7-8): Advanced Features Part 1
- Spreadsheet formulas
- Charts integration
- True DOCX export
- File compression

### Sprint 5 (Week 9-10): Advanced Features Part 2
- File sharing system
- Permissions management
- Template library
- Drag & drop reordering

### Sprint 6 (Week 11-12): Polish & Testing
- Performance optimization
- Bug fixes
- Comprehensive testing
- Documentation updates

---

## 🧪 Testing Strategy

### Unit Tests
- Test all repository methods
- Test formula engine
- Test compression/decompression
- Test permission checking

### Integration Tests
- Test API endpoints
- Test WebSocket connections
- Test file operations end-to-end
- Test collaboration scenarios

### E2E Tests
- Test complete user workflows
- Test multi-user collaboration
- Test version restoration
- Test file sharing

### Performance Tests
- Load testing with large files
- Concurrent user testing
- Database query optimization
- WebSocket scalability

---

## 📊 Success Metrics

### Performance
- File save time < 500ms
- Search results < 200ms
- Collaboration latency < 100ms
- Page load time < 2s

### Reliability
- 99.9% uptime
- Zero data loss
- Automatic conflict resolution
- Graceful error handling

### User Experience
- Intuitive UI/UX
- Smooth animations
- Clear feedback
- Helpful error messages

---

## 🚀 Deployment Strategy

### Phase 1: Beta Release
- Deploy to staging environment
- Invite beta testers
- Gather feedback
- Fix critical bugs

### Phase 2: Gradual Rollout
- Deploy to 10% of users
- Monitor performance and errors
- Increase to 50% if stable
- Full rollout if no issues

### Phase 3: Post-Launch
- Monitor metrics
- Gather user feedback
- Iterate on features
- Plan next enhancements

---

## 📚 Documentation Needed

### Developer Documentation
- API reference
- Database schema documentation
- WebSocket protocol documentation
- Deployment guide

### User Documentation
- Feature guides
- Video tutorials
- FAQ
- Troubleshooting guide

### Admin Documentation
- Configuration guide
- Monitoring setup
- Backup procedures
- Security best practices

---

## 🎯 Next Immediate Steps

1. **Complete Repository Layer**
   - Create `file.repo.ts` with all CRUD methods
   - Follow existing patterns from `board.repo.ts`
   - Add proper TypeScript types

2. **Create API Routes**
   - Start with basic CRUD operations
   - Add authentication/authorization
   - Implement rate limiting

3. **Update Frontend**
   - Replace localStorage with API calls
   - Add React Query for caching
   - Implement optimistic updates

4. **Testing**
   - Write unit tests for repositories
   - Write integration tests for APIs
   - Test migration from localStorage

---

## 💡 Additional Considerations

### Security
- Implement proper authentication
- Add authorization checks
- Sanitize all inputs
- Prevent SQL injection
- Rate limit API calls
- Encrypt sensitive data

### Scalability
- Use database indexes
- Implement caching (Redis)
- Use CDN for static assets
- Optimize database queries
- Consider sharding for large datasets

### Monitoring
- Add error tracking (Sentry)
- Add performance monitoring
- Add usage analytics
- Set up alerts for issues
- Create dashboards

### Backup & Recovery
- Automated database backups
- Point-in-time recovery
- Disaster recovery plan
- Data retention policy

---

## 📝 Conclusion

This comprehensive plan outlines all future enhancements for the file creation feature. Each phase builds upon the previous one, creating a robust, scalable, and feature-rich file management system.

The implementation will transform the basic file creation feature into a powerful, collaborative document management platform comparable to industry leaders like Notion, Google Docs, and Confluence.

**Estimated Total Development Time**: 12-16 weeks with a dedicated team

**Priority Order**:
1. Backend API Integration (Foundation for everything else)
2. Version History (Data safety)
3. File Search (Usability)
4. Real-Time Collaboration (Competitive advantage)
5. Advanced Spreadsheet (Power user feature)
6. File Sharing (Team collaboration)
7. True DOCX Export (Professional output)
8. Templates (User convenience)
9. Compression (Performance)
10. Drag & Drop (UX polish)

---

**Status**: 📋 Planning Complete - Ready for Implementation
**Last Updated**: November 13, 2025
