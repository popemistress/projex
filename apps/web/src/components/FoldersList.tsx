import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
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
} from "react-icons/hi2";
import { twMerge } from "tailwind-merge";

import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";

interface Folder {
  id: string;
  name: string;
  createdAt: string;
  isExpanded: boolean;
}

export default function FoldersList({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const { showPopup } = usePopup();
  const { workspace } = useWorkspace();

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

    window.addEventListener("folderCreated", handleFolderCreated);
    return () => window.removeEventListener("folderCreated", handleFolderCreated);
  }, [workspace.publicId]);

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

  if (folders.length === 0 || isCollapsed) {
    return null;
  }

  return (
    <div className="mb-4">
      {/* Folders Header */}
      <div className="mb-2 px-2">
        <span className="text-xs font-semibold text-neutral-600 dark:text-dark-700">
          Folders
        </span>
      </div>

      {/* Folders List */}
      <ul role="list" className="space-y-1">
        {folders.map((folder) => (
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

                            {/* Create in folder */}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showPopup({
                                      header: "Coming soon",
                                      message: "Create board in folder will be available soon",
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
                                    <HiPlus className="h-4 w-4" />
                                    <span>Create in folder</span>
                                  </div>
                                  <HiChevronRight className="h-4 w-4" />
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

              {/* Folder content (placeholder for future boards) */}
              {folder.isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  <div className="rounded-md p-2 text-xs text-neutral-500 dark:text-dark-700">
                    No boards in this folder yet
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
