import { Menu, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import {
  HiFolder,
  HiChevronRight,
  HiEllipsisVertical,
  HiPencil,
  HiPaintBrush,
  HiArrowRight,
  HiPlus,
  HiXMark,
  HiTrash,
  HiListBullet,
  HiDocumentText,
  HiDocument,
  HiTableCells,
  HiArrowUpTray,
  HiCloudArrowUp,
  HiPhoto,
} from "react-icons/hi2";
import { twMerge } from "tailwind-merge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";
import { useModal } from "~/providers/modal";
import { api } from "~/utils/api";
import type { FileType } from "~/types/file";
import { useFileUpload } from "~/hooks/useFileUpload";

const fileTypes = ['folder', 'list', 'docx', 'md'] as const;

export default function FoldersListNew({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { showPopup } = usePopup();
  const { workspace } = useWorkspace();
  const { openModal } = useModal();
  const utils = api.useUtils();

  // File upload state and hook
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetFolderId, setTargetFolderId] = useState<number | undefined>(undefined);
  const { uploadFile, downloadFile, progress, isUploading } = useFileUpload();

  // Fetch folders from API
  const { data: folders = [], refetch: refetchFolders } = api.folder.all.useQuery(
    { workspacePublicId: workspace.publicId },
    { enabled: !!workspace.publicId }
  );


  // Create folder mutation
  const createFolderMutation = api.folder.create.useMutation({
    onSuccess: () => {
      utils.folder.all.invalidate();
      showPopup({
        header: "Folder created",
        message: "Folder has been created successfully",
        icon: "success",
      });
    },
  });

  // Create file mutation
  const createFileMutation = api.file.create.useMutation({
    onSuccess: (file) => {
      utils.file.all.invalidate();
      showPopup({
        header: "File created",
        message: `"${file.name}" has been created successfully`,
        icon: "success",
      });
      
      // Open editor for editable file types
      if (['docx', 'md', 'txt', 'xlsx'].includes(file.type)) {
        openModal('FILE_EDITOR_' + file.type.toUpperCase(), file.publicId);
      }
    },
  });

  // Update folder mutation
  const updateFolderMutation = api.folder.update.useMutation({
    onSuccess: () => {
      utils.folder.all.invalidate();
    },
  });

  // Update file mutation
  const updateFileMutation = api.file.update.useMutation({
    onSuccess: () => {
      utils.file.all.invalidate();
      utils.folder.all.invalidate();
    },
  });

  // Delete file mutation
  const deleteFileMutation = api.file.delete.useMutation({
    onSuccess: () => {
      utils.file.all.invalidate();
      utils.folder.all.invalidate();
      showPopup({
        header: "File deleted",
        message: "File has been deleted successfully",
        icon: "success",
      });
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = api.folder.delete.useMutation({
    onSuccess: () => {
      utils.folder.all.invalidate();
      showPopup({
        header: "Folder deleted",
        message: "Folder has been deleted successfully",
        icon: "success",
      });
    },
  });

  // Handle folder color update
  const handleUpdateFolderColor = (folderPublicId: string, color: string | null) => {
    updateFolderMutation.mutate({
      folderPublicId: folderPublicId,
      color: color,
    });
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Check if dragging a file
    const activeFile = folders.flatMap(f => f.files || []).find((file: any) => file.publicId === active.id);
    
    if (activeFile) {
      // Dragging a file
      const targetFolder = folders.find(f => f.publicId === over.id);
      
      if (targetFolder && activeFile.folderId !== targetFolder.id) {
        // Moving file to a different folder
        updateFileMutation.mutate({
          filePublicId: activeFile.publicId,
          folderId: targetFolder.id,
        });
      }
    } else if (active.id !== over.id) {
      // Dragging a folder
      const oldIndex = folders.findIndex((f) => f.publicId === active.id);
      const newIndex = folders.findIndex((f) => f.publicId === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder folders
        const reorderedFolders = arrayMove(folders, oldIndex, newIndex);
        
        // Update indexes in database
        reorderedFolders.forEach((folder, index) => {
          if (folder.index !== index) {
            updateFolderMutation.mutate({
              folderPublicId: folder.publicId,
              index,
            });
          }
        });
      }
    }
  };

  const handleCreateFile = (fileType: FileType, folderId?: number) => {
    const fileTypeNames: Record<FileType, string> = {
      folder: 'Folder',
      list: 'List',
      docx: 'Document',
      md: 'Markdown',
    };

    const fileName = prompt(`Enter ${fileTypeNames[fileType]} name:`, `Untitled ${fileTypeNames[fileType]}`);
    if (!fileName || !fileName.trim()) return;

    createFileMutation.mutate({
      workspacePublicId: workspace.publicId,
      name: fileName.trim(),
      type: fileType,
      folderId,
    });
  };

  const handleCreateFolder = () => {
    const folderName = prompt("Enter folder name:", "New Folder");
    if (!folderName || !folderName.trim()) return;

    createFolderMutation.mutate({
      workspacePublicId: workspace.publicId,
      name: folderName.trim(),
    });
  };

  const handleRenameFolder = (folderPublicId: string, currentName: string) => {
    const newName = prompt("Rename folder", currentName);
    if (!newName || !newName.trim() || newName === currentName) return;

    updateFolderMutation.mutate({
      folderPublicId,
      name: newName.trim(),
    });
  };

  const handleToggleFolder = (folderPublicId: string, isExpanded: boolean) => {
    updateFolderMutation.mutate({
      folderPublicId,
      isExpanded: !isExpanded,
    });
  };

  const handleDeleteFolder = (folderPublicId: string, folderName: string) => {
    if (!confirm(`Are you sure you want to delete "${folderName}"?`)) return;

    deleteFolderMutation.mutate({ folderPublicId });
  };

  const handleDeleteFile = (filePublicId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    deleteFileMutation.mutate({ filePublicId });
  };

  const handleCollapseAll = () => {
    folders.forEach((folder) => {
      if (folder.isExpanded) {
        updateFolderMutation.mutate({
          folderPublicId: folder.publicId,
          isExpanded: false,
        });
      }
    });
  };

  // New upload handlers
  const handleTriggerUpload = (folderId?: number) => {
    setTargetFolderId(folderId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file, targetFolderId);
      // Refresh file list
      utils.file.all.invalidate();
    }
    // Clear the input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileClick = (file: any) => {
    const textTypes = ['list', 'docx', 'md'];
    if (textTypes.includes(file.type)) {
      // Open editor for text-based files
      openModal(`FILE_EDITOR_${file.type.toUpperCase()}`, file.publicId);
    } else {
      // Download binary files
      downloadFile(file.publicId);
    }
  };

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="mb-4">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileSelected} 
      />

      {/* Global Upload Progress Indicator */}
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

      {/* Folders Header with Create New Button */}
      <div className="mb-2 flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-neutral-600 dark:text-dark-700">
          Folders
        </span>
        
        {/* Create New Dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-light-200 hover:text-neutral-900 dark:text-dark-700 dark:hover:bg-dark-200 dark:hover:text-dark-1000">
            <HiPlus size={14} />
            <span>New</span>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-50 mt-1 w-56 max-h-[80vh] overflow-y-auto origin-top-right rounded-md border border-light-300 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-dark-500 dark:bg-dark-200">
              <div className="py-1">
                {/* Folder */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleCreateFolder}
                      className={twMerge(
                        "flex w-full items-center gap-3 px-4 py-2 text-sm",
                        active
                          ? "bg-light-100 dark:bg-dark-300"
                          : "text-neutral-700 dark:text-dark-900"
                      )}
                    >
                      <HiFolder className="h-4 w-4" />
                      <span>Folder</span>
                    </button>
                  )}
                </Menu.Item>

                {/* Upload File */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleTriggerUpload(undefined)}
                      className={twMerge(
                        "flex w-full items-center gap-3 px-4 py-2 text-sm",
                        active
                          ? "bg-light-100 dark:bg-dark-300"
                          : "text-neutral-700 dark:text-dark-900"
                      )}
                    >
                      <HiCloudArrowUp className="h-4 w-4" />
                      <span>Upload File</span>
                    </button>
                  )}
                </Menu.Item>

                <div className="my-1 border-t border-light-300 dark:border-dark-500" />

                {/* List */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleCreateFile('list')}
                      className={twMerge(
                        "flex w-full items-center gap-3 px-4 py-2 text-sm",
                        active
                          ? "bg-light-100 dark:bg-dark-300"
                          : "text-neutral-700 dark:text-dark-900"
                      )}
                    >
                      <HiListBullet className="h-4 w-4" />
                      <span>List</span>
                    </button>
                  )}
                </Menu.Item>

                {/* Doc (DOCX) */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleCreateFile('docx')}
                      className={twMerge(
                        "flex w-full items-center gap-3 px-4 py-2 text-sm",
                        active
                          ? "bg-light-100 dark:bg-dark-300"
                          : "text-neutral-700 dark:text-dark-900"
                      )}
                    >
                      <HiDocumentText className="h-4 w-4" />
                      <span>Doc (.docx)</span>
                    </button>
                  )}
                </Menu.Item>

                {/* Markdown (.md) */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleCreateFile('md')}
                      className={twMerge(
                        "flex w-full items-center gap-3 px-4 py-2 text-sm",
                        active
                          ? "bg-light-100 dark:bg-dark-300"
                          : "text-neutral-700 dark:text-dark-900"
                      )}
                    >
                      <HiDocument className="h-4 w-4" />
                      <span>Markdown (.md)</span>
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Folders List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={folders.map((f) => f.publicId)}
          strategy={verticalListSortingStrategy}
        >
          <ul role="list" className="space-y-1">
            {folders.length === 0 ? (
              <li className="px-2 py-4 text-center">
                <p className="text-xs text-neutral-500 dark:text-dark-700">
                  No folders yet. Click "New" to create one!
                </p>
              </li>
            ) : (
              folders.map((folder) => (
                <SortableFolder
                  key={folder.id}
                  folder={folder}
                  onToggle={() => handleToggleFolder(folder.publicId, folder.isExpanded)}
                  onRename={() => handleRenameFolder(folder.publicId, folder.name)}
                  onDelete={() => handleDeleteFolder(folder.publicId, folder.name)}
                  onCollapseAll={handleCollapseAll}
                  onCreateFile={handleCreateFile}
                  showPopup={showPopup}
                  openModal={openModal}
                >
                  {folder.isExpanded && folder.files && folder.files.length > 0 && (
                    <div className="ml-8 mt-1 space-y-1">
                      <SortableContext
                        items={folder.files.map((f: any) => f.publicId)}
                        strategy={verticalListSortingStrategy}
                      >
                        {folder.files.map((file: any) => (
                          <SortableFile
                            key={file.publicId}
                            file={file}
                            folderId={folder.id}
                            onUpdateFile={(filePublicId, index) => {
                              updateFileMutation.mutate({ filePublicId, index });
                            }}
                            onDeleteFile={handleDeleteFile}
                            openModal={openModal}
                          />
                        ))}
                      </SortableContext>
                    </div>
                  )}
                </SortableFolder>
              ))
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// Sortable Folder Component
function SortableFolder({
  folder,
  onToggle,
  onRename,
  onDelete,
  onCollapseAll,
  onCreateFile,
  showPopup,
  openModal,
  children,
}: {
  folder: any;
  onToggle: () => void;
  onRename: () => void;
  onDelete: () => void;
  onCollapseAll: () => void;
  onCreateFile: (fileType: FileType, folderId?: number) => void;
  showPopup: any;
  openModal: any;
  children?: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.publicId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes}>
      <div className="group relative">
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-2 rounded-md p-1.5 text-sm font-normal hover:bg-light-200 dark:hover:bg-dark-200 text-neutral-600 dark:text-dark-900"
        >
          {/* Drag Handle */}
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              className="h-4 w-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>

          <HiChevronRight
            size={16}
            className={twMerge(
              "flex-shrink-0 transition-transform",
              folder.isExpanded && "rotate-90"
            )}
          />
          <HiFolder 
            size={18} 
            className="flex-shrink-0" 
            style={{ color: folder.color || undefined }}
          />
          <span className="flex-1 truncate text-left">{folder.name}</span>
          
          {/* Settings Menu */}
          <Menu as="div" className="relative">
            {({ open }) => (
              <>
                <Menu.Button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                  }}
                  className={twMerge(
                    "rounded p-1 hover:bg-light-300 dark:hover:bg-dark-300",
                    open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <HiEllipsisVertical size={14} />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-50 mt-1 w-56 max-h-[80vh] overflow-y-auto origin-top-right rounded-md border border-light-300 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-dark-500 dark:bg-dark-200">
                    <div className="py-1">
                      {/* Rename */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRename();
                            }}
                            className={twMerge(
                              "flex w-full items-center gap-3 px-4 py-2 text-sm",
                              active
                                ? "bg-light-100 dark:bg-dark-300"
                                : "text-neutral-700 dark:text-dark-900"
                            )}
                          >
                            <HiPencil className="h-4 w-4" />
                            <span>Rename</span>
                          </button>
                        )}
                      </Menu.Item>

                      {/* Change color */}
                      <Menu as="div" className="relative">
                        <Menu.Button
                          className={({ active }: { active: boolean }) =>
                            twMerge(
                              "flex w-full items-center justify-between px-4 py-2 text-sm",
                              active
                                ? "bg-light-100 dark:bg-dark-300"
                                : "text-neutral-700 dark:text-dark-900"
                            )
                          }
                        >
                          <div className="flex items-center gap-3">
                            <HiPaintBrush className="h-4 w-4" />
                            <span>Change color</span>
                          </div>
                          <HiChevronRight className="h-4 w-4" />
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute left-full top-0 ml-2 w-72 origin-top-left rounded-lg border border-light-300 bg-white p-4 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-dark-500 dark:bg-dark-200">
                            <div className="grid grid-cols-5 gap-3">
                              {[
                                '#10B981', '#84CC16', '#F59E0B', '#F97316', '#FB7185',
                                '#DC2626', '#BE185D', '#E11D48', '#EC4899', '#A855F7',
                                '#7C3AED', '#3B82F6', '#0EA5E9', '#14B8A6', '#06B6D4',
                              ].map((color) => (
                                <Menu.Item key={color}>
                                  {() => (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateFolderColor(folder.publicId, color);
                                      }}
                                      className="h-12 w-12 rounded-full transition-all hover:scale-110 hover:shadow-lg"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  )}
                                </Menu.Item>
                              ))}
                            </div>
                            <div className="mt-4 border-t border-light-300 pt-3 dark:border-dark-500">
                              <Menu.Item>
                                {() => (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateFolderColor(folder.publicId, null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-light-100 dark:text-dark-900 dark:hover:bg-dark-300"
                                  >
                                    <HiXMark className="h-4 w-4" />
                                    <span>Default</span>
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>

                      <div className="my-1 border-t border-light-300 dark:border-dark-500" />

                      {/* Create in folder - Direct menu items */}
                      <div className="my-1 border-t border-light-300 dark:border-dark-500" />
                      
                      <div className="px-2 py-1">
                        <p className="px-2 text-xs font-semibold text-neutral-500 dark:text-dark-700">
                          Create in folder
                        </p>
                      </div>

                      {/* Doc (DOCX) */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateFile('docx', folder.id);
                            }}
                            className={twMerge(
                              "flex w-full items-center gap-3 px-4 py-2 text-sm",
                              active
                                ? "bg-light-100 dark:bg-dark-300"
                                : "text-neutral-700 dark:text-dark-900"
                            )}
                          >
                            <HiDocumentText className="h-4 w-4" />
                            <span>Doc (.docx)</span>
                          </button>
                        )}
                      </Menu.Item>

                      {/* Markdown (.md) */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateFile('md', folder.id);
                            }}
                            className={twMerge(
                              "flex w-full items-center gap-3 px-4 py-2 text-sm",
                              active
                                ? "bg-light-100 dark:bg-dark-300"
                                : "text-neutral-700 dark:text-dark-900"
                            )}
                          >
                            <HiDocument className="h-4 w-4" />
                            <span>Markdown (.md)</span>
                          </button>
                        )}
                      </Menu.Item>

                      <div className="my-1 border-t border-light-300 dark:border-dark-500" />

                      {/* Upload to folder */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTriggerUpload(folder.id);
                            }}
                            className={twMerge(
                              "flex w-full items-center gap-3 px-4 py-2 text-sm",
                              active
                                ? "bg-light-100 dark:bg-dark-300"
                                : "text-neutral-700 dark:text-dark-900"
                            )}
                          >
                            <HiCloudArrowUp className="h-4 w-4" />
                            <span>Upload to folder</span>
                          </button>
                        )}
                      </Menu.Item>

                      <div className="my-1 border-t border-light-300 dark:border-dark-500" />

                      {/* Collapse all folders */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCollapseAll();
                            }}
                            className={twMerge(
                              "flex w-full items-center gap-3 px-4 py-2 text-sm",
                              active
                                ? "bg-light-100 dark:bg-dark-300"
                                : "text-neutral-700 dark:text-dark-900"
                            )}
                          >
                            <HiXMark className="h-4 w-4" />
                            <span>Collapse all folders</span>
                          </button>
                        )}
                      </Menu.Item>

                      {/* Delete */}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete();
                            }}
                            className={twMerge(
                              "flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400",
                              active && "bg-red-50 dark:bg-red-900/20"
                            )}
                          >
                            <HiTrash className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>
        </button>

        {/* Folder content - Files */}
        {children}
      </div>
    </li>
  );
}

// Sortable File Component
function SortableFile({
  file,
  folderId,
  onUpdateFile,
  onDeleteFile,
  openModal,
}: {
  file: any;
  folderId: number;
  onUpdateFile: (filePublicId: string, index: number) => void;
  onDeleteFile: (filePublicId: string, fileName: string) => void;
  openModal: any;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.publicId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="group flex items-center gap-1">
      {/* Drag Handle */}
      <button
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 opacity-0 hover:opacity-100 group-hover:opacity-100"
      >
        <svg className="h-3 w-3 text-neutral-400" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
        </svg>
      </button>

      {/* File Button */}
      <button
        onClick={() => {
          if (['docx', 'md', 'list'].includes(file.type)) {
            openModal('FILE_EDITOR_' + file.type.toUpperCase(), file.publicId);
          }
        }}
        className="flex flex-1 items-center gap-2 rounded-md p-1.5 text-sm hover:bg-light-200 dark:hover:bg-dark-200 text-neutral-600 dark:text-dark-900"
      >
        {file.type === 'list' && <HiListBullet className="h-4 w-4 flex-shrink-0" />}
        {file.type === 'docx' && <HiDocumentText className="h-4 w-4 flex-shrink-0" />}
        {file.type === 'md' && <HiDocument className="h-4 w-4 flex-shrink-0" />}
        <span className="flex-1 truncate text-left">{file.name}</span>
      </button>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteFile(file.publicId, file.name);
        }}
        className="p-1 opacity-0 hover:opacity-100 group-hover:opacity-100 text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
        title="Delete file"
      >
        <HiTrash className="h-4 w-4" />
      </button>
    </div>
  );
}
