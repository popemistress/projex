import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState, useRef } from "react";
import {
  HiFolder,
  HiChevronRight,
  HiEllipsisVertical,
  HiPencil,
  HiPaintBrush,
  HiArrowRight,
  HiCloudArrowUp,
  HiPlus,
  HiXMark,
  HiTrash,
  HiListBullet,
  HiDocumentText,
  HiDocument,
  HiTableCells,
} from "react-icons/hi2";
import { twMerge } from "tailwind-merge";

import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";
import { useModal } from "~/providers/modal";
import { useFileCreation } from "~/hooks/useFileCreation";
import { useFileUpload } from "~/hooks/useFileUpload";
import { api } from "~/utils/api";
import type { FileType } from "~/types/file";

interface Folder {
  id: string;
  name: string;
  createdAt: string;
  isExpanded: boolean;
}

export default function FoldersList({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderFiles, setFolderFiles] = useState<Record<string, any[]>>({});
  const [rootFiles, setRootFiles] = useState<any[]>([]);
  const { showPopup } = usePopup();
  const { workspace } = useWorkspace();
  const { openModal } = useModal();
  const { createFile, getFiles } = useFileCreation();
  const utils = api.useUtils();
  
  // File upload functionality
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetFolderId, setTargetFolderId] = useState<number | undefined>(undefined);
  const { uploadFile, downloadFile, progress, isUploading } = useFileUpload();
  
  // Fetch root files from API
  const { data: apiRootFiles = [], refetch: refetchRootFiles } = api.file.all.useQuery(
    { workspacePublicId: workspace.publicId },
    { enabled: !!workspace.publicId }
  );
  
  // Store queries for each folder
  const [folderQueries, setFolderQueries] = useState<Record<string, any[]>>({});

  const getStorageKey = () => `kan_folders_${workspace.publicId}`;

  const loadFolders = () => {
    if (!workspace.publicId) return;
    const storedFolders = JSON.parse(localStorage.getItem(getStorageKey()) || "[]");
    setFolders(storedFolders);
  };

  useEffect(() => {
    loadFolders();

    // Listen for folder creation events
    const handleFolderCreated = () => {
      loadFolders();
    };

    const handleFileCreated = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { folderId } = customEvent.detail;
      
      // Refetch root files from API if no folderId
      if (!folderId) {
        await refetchRootFiles();
      }
      
      // Reload the appropriate file list
      if (folderId) {
        loadFolderFiles(folderId.toString());
      } else {
        loadRootFiles(); // Load root files when created without folder
      }
    };

    window.addEventListener("folderCreated", handleFolderCreated);
    window.addEventListener("fileCreated", handleFileCreated);
    return () => {
      window.removeEventListener("folderCreated", handleFolderCreated);
      window.removeEventListener("fileCreated", handleFileCreated);
    };
  }, [workspace.publicId]);

  const loadFolderFiles = (folderId: string) => {
    // Load from localStorage for backward compatibility
    const localFiles = getFiles(folderId);
    setFolderFiles((prev) => ({ ...prev, [folderId]: localFiles }));
  };

  const loadRootFiles = () => {
    // Load from localStorage for backward compatibility
    const localFiles = getFiles();
    // Combine with API root files
    const allFiles = [...localFiles, ...apiRootFiles];
    setRootFiles(allFiles);
  };

  useEffect(() => {
    // Load root files on mount
    loadRootFiles();
    
    // Load files for all expanded folders
    folders.forEach((folder) => {
      if (folder.isExpanded) {
        loadFolderFiles(folder.id);
      }
    });
  }, [folders, apiRootFiles]);

  const toggleFolder = (folderId: string) => {
    const updatedFolders = folders.map((folder) =>
      folder.id === folderId
        ? { ...folder, isExpanded: !folder.isExpanded }
        : folder
    );
    setFolders(updatedFolders);
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedFolders));
  };

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    const newName = prompt("Rename folder", folder.name);
    if (newName && newName.trim() && newName !== folder.name) {
      const updatedFolders = folders.map((f) =>
        f.id === folderId ? { ...f, name: newName.trim() } : f
      );
      setFolders(updatedFolders);
      localStorage.setItem(getStorageKey(), JSON.stringify(updatedFolders));
      showPopup({
        header: "Folder renamed",
        message: `Folder renamed to "${newName}"`,
        icon: "success",
      });
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    if (confirm(`Are you sure you want to delete "${folder.name}"?`)) {
      const updatedFolders = folders.filter((f) => f.id !== folderId);
      setFolders(updatedFolders);
      localStorage.setItem(getStorageKey(), JSON.stringify(updatedFolders));
      showPopup({
        header: "Folder deleted",
        message: `"${folder.name}" has been deleted`,
        icon: "success",
      });
    }
  };

  const handleCollapseAll = () => {
    const updatedFolders = folders.map((folder) => ({
      ...folder,
      isExpanded: false,
    }));
    setFolders(updatedFolders);
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedFolders));
  };

  const handleCreateFile = (folderId: string, fileType: FileType) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    const fileTypeNames: Record<FileType, string> = {
      folder: 'Folder',
      list: 'List',
      docx: 'Document',
      md: 'Markdown',
      txt: 'Text File',
      xlsx: 'Spreadsheet',
    };

    const fileName = prompt(`Enter ${fileTypeNames[fileType]} name:`, `Untitled ${fileTypeNames[fileType]}`);
    if (!fileName || !fileName.trim()) return;

    const file = createFile(fileName.trim(), fileType, folderId);
    
    // Open the file editor for editable file types
    if (['docx', 'md', 'txt', 'xlsx'].includes(fileType)) {
      openModal('FILE_EDITOR_' + fileType.toUpperCase(), `${file.id}_${folderId}`);
    }
  };

  // Upload handlers with setTimeout fix for Headless UI Menu
  const handleTriggerUpload = (folderId?: number) => {
    setTargetFolderId(folderId);
    // 100ms delay allows the Menu to close cleanly before opening file dialog
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 100);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file, targetFolderId);
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="mb-4">
      {/* Hidden Input for file upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileSelected} 
      />

      {/* Progress Bar with fixed z-index */}
      {isUploading && (
        <div className="fixed bottom-4 right-4 z-[9999] w-72 rounded-lg border border-light-300 bg-white p-4 shadow-xl dark:border-dark-500 dark:bg-dark-200">
          <div className="mb-2 flex justify-between text-sm font-medium text-neutral-700 dark:text-dark-900">
            <span>Uploading {progress === 100 ? 'Complete!' : '...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-light-200 dark:bg-dark-400">
            <div 
              className="h-full rounded-full bg-primary-500 transition-all duration-300 ease-out" 
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
          {({ open }) => (
            <>
              <Menu.Button
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-light-200 hover:text-neutral-900 dark:text-dark-700 dark:hover:bg-dark-200 dark:hover:text-dark-1000"
              >
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
                <Menu.Items className="absolute right-0 z-50 mt-1 w-56 origin-top-right rounded-md border border-light-300 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-dark-500 dark:bg-dark-200">
                  <div className="py-1">
                    {/* Folder */}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => openModal('NEW_FOLDER')}
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

                    <div className="my-1 border-t border-light-300 dark:border-dark-500" />

                    {/* List */}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            const fileName = prompt('Enter List name:', 'Untitled List');
                            if (fileName && fileName.trim()) {
                              const file = createFile(fileName.trim(), 'list');
                            }
                          }}
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
                          onClick={() => {
                            const fileName = prompt('Enter Document name:', 'Untitled Document');
                            if (fileName && fileName.trim()) {
                              const file = createFile(fileName.trim(), 'docx');
                              openModal('FILE_EDITOR_DOCX', file.id);
                            }
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
                          onClick={() => {
                            const fileName = prompt('Enter Markdown name:', 'Untitled Markdown');
                            if (fileName && fileName.trim()) {
                              const file = createFile(fileName.trim(), 'md');
                              openModal('FILE_EDITOR_MD', file.id);
                            }
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

                    {/* Text File (.txt) */}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            const fileName = prompt('Enter Text File name:', 'Untitled Text');
                            if (fileName && fileName.trim()) {
                              const file = createFile(fileName.trim(), 'txt');
                              openModal('FILE_EDITOR_TXT', file.id);
                            }
                          }}
                          className={twMerge(
                            "flex w-full items-center gap-3 px-4 py-2 text-sm",
                            active
                              ? "bg-light-100 dark:bg-dark-300"
                              : "text-neutral-700 dark:text-dark-900"
                          )}
                        >
                          <HiDocumentText className="h-4 w-4" />
                          <span>Text File (.txt)</span>
                        </button>
                      )}
                    </Menu.Item>

                    {/* Spreadsheet (.xlsx) */}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            const fileName = prompt('Enter Spreadsheet name:', 'Untitled Spreadsheet');
                            if (fileName && fileName.trim()) {
                              const file = createFile(fileName.trim(), 'xlsx');
                              openModal('FILE_EDITOR_XLSX', file.id);
                            }
                          }}
                          className={twMerge(
                            "flex w-full items-center gap-3 px-4 py-2 text-sm",
                            active
                              ? "bg-light-100 dark:bg-dark-300"
                              : "text-neutral-700 dark:text-dark-900"
                          )}
                        >
                          <HiTableCells className="h-4 w-4" />
                          <span>Spreadsheet (.xlsx)</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>

      {/* Root Files (files not in any folder) */}
      {rootFiles.length > 0 && (
        <div className="mb-3">
          <ul role="list" className="space-y-1">
            {rootFiles.map((file) => (
              <li key={file.id}>
                <button
                  onClick={() => {
                    if (['docx', 'md', 'txt', 'xlsx'].includes(file.type)) {
                      openModal('FILE_EDITOR_' + file.type.toUpperCase(), file.id);
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-md p-1.5 text-sm hover:bg-light-200 dark:hover:bg-dark-200 text-neutral-600 dark:text-dark-900"
                >
                  {file.type === 'list' && <HiListBullet className="h-4 w-4 flex-shrink-0" />}
                  {file.type === 'docx' && <HiDocumentText className="h-4 w-4 flex-shrink-0" />}
                  {file.type === 'md' && <HiDocument className="h-4 w-4 flex-shrink-0" />}
                  {file.type === 'txt' && <HiDocumentText className="h-4 w-4 flex-shrink-0" />}
                  {file.type === 'xlsx' && <HiTableCells className="h-4 w-4 flex-shrink-0" />}
                  <span className="flex-1 truncate text-left">{file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Folders List */}
      <ul role="list" className="space-y-1">
        {folders.length === 0 ? (
          <li className="px-2 py-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-dark-700">
              No folders yet. Click "New" to create one!
            </p>
          </li>
        ) : (
          folders.map((folder) => (
          <li key={folder.id}>
            <div className="group relative">
              <button
                onClick={() => toggleFolder(folder.id)}
                className="flex w-full items-center gap-2 rounded-md p-1.5 text-sm font-normal hover:bg-light-200 dark:hover:bg-dark-200 text-neutral-600 dark:text-dark-900"
              >
                <HiChevronRight
                  size={16}
                  className={twMerge(
                    "flex-shrink-0 transition-transform",
                    folder.isExpanded && "rotate-90"
                  )}
                />
                <HiFolder size={18} className="flex-shrink-0" />
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
                        <Menu.Items className="absolute right-0 z-50 mt-1 w-56 origin-top-right rounded-md border border-light-300 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-dark-500 dark:bg-dark-200">
                          <div className="py-1">
                            {/* Rename */}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameFolder(folder.id);
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
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showPopup({
                                      header: "Coming soon",
                                      message: "Color customization will be available soon",
                                      icon: "info",
                                    });
                                  }}
                                  className={twMerge(
                                    "flex w-full items-center justify-between px-4 py-2 text-sm",
                                    active
                                      ? "bg-light-100 dark:bg-dark-300"
                                      : "text-neutral-700 dark:text-dark-900"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <HiPaintBrush className="h-4 w-4" />
                                    <span>Change color</span>
                                  </div>
                                  <HiChevronRight className="h-4 w-4" />
                                </button>
                              )}
                            </Menu.Item>

                            <div className="my-1 border-t border-light-300 dark:border-dark-500" />

                            {/* Move to */}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showPopup({
                                      header: "Coming soon",
                                      message: "Move folder will be available soon",
                                      icon: "info",
                                    });
                                  }}
                                  className={twMerge(
                                    "flex w-full items-center justify-between px-4 py-2 text-sm",
                                    active
                                      ? "bg-light-100 dark:bg-dark-300"
                                      : "text-neutral-700 dark:text-dark-900"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <HiArrowRight className="h-4 w-4" />
                                    <span>Move to</span>
                                  </div>
                                  <HiChevronRight className="h-4 w-4" />
                                </button>
                              )}
                            </Menu.Item>

                            {/* Create in folder - Submenu */}
                            <Menu as="div" className="relative">
                              <Menu.Button
                                className={twMerge(
                                  "flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-light-100 dark:hover:bg-dark-300 text-neutral-700 dark:text-dark-900"
                                )}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-3">
                                  <HiPlus className="h-4 w-4" />
                                  <span>Create in folder</span>
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
                                <Menu.Items className="absolute left-full top-0 ml-1 w-48 origin-top-left rounded-md border border-light-300 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-dark-500 dark:bg-dark-200">
                                  <div className="py-1">
                                    {/* Folder */}
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCreateFile(folder.id, 'folder');
                                          }}
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

                                    {/* List */}
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCreateFile(folder.id, 'list');
                                          }}
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

                                    <div className="my-1 border-t border-light-300 dark:border-dark-500" />

                                    {/* Doc (.docx) */}
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCreateFile(folder.id, 'docx');
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
                                            handleCreateFile(folder.id, 'md');
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

                                    {/* Text File (.txt) */}
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCreateFile(folder.id, 'txt');
                                          }}
                                          className={twMerge(
                                            "flex w-full items-center gap-3 px-4 py-2 text-sm",
                                            active
                                              ? "bg-light-100 dark:bg-dark-300"
                                              : "text-neutral-700 dark:text-dark-900"
                                          )}
                                        >
                                          <HiDocumentText className="h-4 w-4" />
                                          <span>Text File (.txt)</span>
                                        </button>
                                      )}
                                    </Menu.Item>

                                    {/* Spreadsheet (.xlsx) */}
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCreateFile(folder.id, 'xlsx');
                                          }}
                                          className={twMerge(
                                            "flex w-full items-center gap-3 px-4 py-2 text-sm",
                                            active
                                              ? "bg-light-100 dark:bg-dark-300"
                                              : "text-neutral-700 dark:text-dark-900"
                                          )}
                                        >
                                          <HiTableCells className="h-4 w-4" />
                                          <span>Spreadsheet (.xlsx)</span>
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Transition>
                            </Menu>

                            <div className="my-1 border-t border-light-300 dark:border-dark-500" />

                            {/* Upload to folder */}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTriggerUpload(parseInt(folder.id));
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
                                    handleCollapseAll();
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
                                    handleDeleteFolder(folder.id);
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
              {folder.isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {(folderFiles[folder.id]?.length ?? 0) > 0 ? (
                    folderFiles[folder.id]!.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => {
                          if (['docx', 'md', 'txt', 'xlsx'].includes(file.type)) {
                            openModal('FILE_EDITOR_' + file.type.toUpperCase(), `${file.id}_${folder.id}`);
                          }
                        }}
                        className="flex w-full items-center gap-2 rounded-md p-1.5 text-sm hover:bg-light-200 dark:hover:bg-dark-200 text-neutral-600 dark:text-dark-900"
                      >
                        {file.type === 'list' && <HiListBullet className="h-4 w-4 flex-shrink-0" />}
                        {file.type === 'docx' && <HiDocumentText className="h-4 w-4 flex-shrink-0" />}
                        {file.type === 'md' && <HiDocument className="h-4 w-4 flex-shrink-0" />}
                        {file.type === 'txt' && <HiDocumentText className="h-4 w-4 flex-shrink-0" />}
                        {file.type === 'xlsx' && <HiTableCells className="h-4 w-4 flex-shrink-0" />}
                        {file.type === 'folder' && <HiFolder className="h-4 w-4 flex-shrink-0" />}
                        <span className="flex-1 truncate text-left">{file.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-md p-2 text-xs text-neutral-500 dark:text-dark-700">
                      No files in this folder yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
        ))
        )}
      </ul>
    </div>
  );
}
