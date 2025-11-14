import Link from "next/link";
import { HiOutlineRectangleStack, HiOutlineTrash, HiArchiveBox, HiPhoto, HiPencil, HiLockClosed } from "react-icons/hi2";
import { useState } from "react";

import Button from "~/components/Button";
import PatternedBackground from "~/components/PatternedBackground";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";

// Default cover image if none is set
const DEFAULT_COVER_IMAGE = 'https://picsum.photos/seed/default/800/400';

export function BoardsList({ isTemplate }: { isTemplate?: boolean }) {
  const { workspace } = useWorkspace();
  const { openModal } = useModal();
  const { showPopup } = usePopup();
  const utils = api.useUtils();
  const [uploadingBoardId, setUploadingBoardId] = useState<string | null>(null);

  const { data, isLoading } = api.board.all.useQuery(
    {
      workspacePublicId: workspace.publicId,
      type: isTemplate ? "template" : "regular",
    },
    { enabled: !!workspace.publicId && workspace.publicId.length >= 12 },
  );

  // Update board cover image mutation
  const updateBoardMutation = api.board.update.useMutation({
    onSuccess: async () => {
      showPopup({
        header: "Cover image updated",
        message: "The board cover image has been updated.",
        icon: "success",
      });
      await utils.board.invalidate();
      setUploadingBoardId(null);
    },
    onError: () => {
      showPopup({
        header: "Unable to update cover image",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
      setUploadingBoardId(null);
    },
  });

  // Permanently delete board mutation
  const deleteBoardMutation = api.board.hardDelete.useMutation({
    onSuccess: async () => {
      showPopup({
        header: "Board deleted",
        message: "The board has been permanently deleted.",
        icon: "success",
      });
      await utils.board.invalidate();
    },
    onError: () => {
      showPopup({
        header: "Unable to delete board",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  // Close (archive) board mutation
  const closeBoardMutation = api.board.delete.useMutation({
    onSuccess: async () => {
      showPopup({
        header: "Board closed",
        message: "The board has been moved to closed boards.",
        icon: "success",
      });
      await utils.board.invalidate();
    },
    onError: () => {
      showPopup({
        header: "Unable to close board",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  const handleDeleteBoard = (e: React.MouseEvent, boardPublicId: string, boardName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to permanently delete "${boardName}"? This action cannot be undone.`)) {
      deleteBoardMutation.mutate({ boardPublicId });
    }
  };

  const handleCloseBoard = (e: React.MouseEvent, boardPublicId: string, boardName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to close "${boardName}"? You can reopen it from the Closed Boards section.`)) {
      closeBoardMutation.mutate({ boardPublicId });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, boardPublicId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showPopup({
        header: "File too large",
        message: "Please select an image smaller than 5MB.",
        icon: "error",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      showPopup({
        header: "Invalid file type",
        message: "Please select an image file.",
        icon: "error",
      });
      return;
    }

    setUploadingBoardId(boardPublicId);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateBoardMutation.mutate({
          boardPublicId,
          coverImage: base64String,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showPopup({
        header: "Upload failed",
        message: "Failed to upload image. Please try again.",
        icon: "error",
      });
      setUploadingBoardId(null);
    }
  };

  if (isLoading)
    return (
      <div className="3xl:grid-cols-4 grid h-fit w-full grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
        <div className="mr-5 flex h-[150px] w-full animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
        <div className="mr-5 flex h-[150px] w-full animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
        <div className="mr-5 flex h-[150px] w-full animate-pulse rounded-md bg-light-200 dark:bg-dark-100" />
      </div>
    );

  if (data?.length === 0)
    return (
      <div className="w-full">
        {/* Workspace Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {/* Workspace Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-coral to-coral-600 text-white font-bold text-lg shadow-md">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Workspace Name and Edit Icon */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-coral dark:text-coral">
                {workspace.name}
              </h1>
              <button
                onClick={() => openModal("WORKSPACE_SETTINGS")}
                className="rounded p-1 transition-colors hover:bg-light-200 dark:hover:bg-dark-300"
                title="Edit workspace name"
              >
                <HiPencil className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>
          </div>
          
          {/* Privacy Status */}
          <div className="flex items-center gap-1.5 ml-[60px] text-sm text-neutral-600 dark:text-neutral-400">
            <HiLockClosed className="h-3.5 w-3.5" />
            <span>Private</span>
          </div>
          
          {/* Divider */}
          <div className="mt-4 border-t border-light-300 dark:border-dark-600" />
        </div>

        {/* Empty State */}
        <div className="z-10 flex h-full w-full items-center justify-center pb-[150px]">
          <div className="rounded-xl border-2 border-light-400 bg-white px-16 py-12 shadow-lg dark:border-dark-500 dark:bg-dark-100">
            <div className="flex flex-col items-center space-y-8">
              <div className="flex flex-col items-center">
                <HiOutlineRectangleStack className="h-10 w-10 text-light-800 dark:text-dark-800" />
                <p className="mb-2 mt-4 text-[14px] font-bold text-light-1000 dark:text-dark-950">
                  No {isTemplate ? "templates" : "boards"}
                </p>
                <p className="text-[14px] text-light-900 dark:text-dark-900">
                  Get started by creating a new {isTemplate ? "template" : "board"}
                </p>
              </div>
              <Button onClick={() => openModal("NEW_BOARD")}>
                Create new {isTemplate ? "template" : "board"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="w-full">
      {/* Workspace Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {/* Workspace Avatar */}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-coral to-coral-600 text-white font-bold text-lg shadow-md">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          
          {/* Workspace Name and Edit Icon */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-coral dark:text-coral">
              {workspace.name}
            </h1>
            <button
              onClick={() => openModal("WORKSPACE_SETTINGS")}
              className="rounded p-1 transition-colors hover:bg-light-200 dark:hover:bg-dark-300"
              title="Edit workspace name"
            >
              <HiPencil className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>
        
        {/* Privacy Status */}
        <div className="flex items-center gap-1.5 ml-[60px] text-sm text-neutral-600 dark:text-neutral-400">
          <HiLockClosed className="h-3.5 w-3.5" />
          <span>Private</span>
        </div>
        
        {/* Divider */}
        <div className="mt-4 border-t border-light-300 dark:border-dark-600" />
      </div>

      {/* Boards Grid */}
      <div className="3xl:grid-cols-4 grid h-fit w-full grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
      {data?.map((board) => {
        const coverImageUrl = (board as any).coverImage || DEFAULT_COVER_IMAGE;
        
        return (
          <div key={board.publicId} className="group relative mr-5">
            <Link href={`/${isTemplate ? "templates" : "boards"}/${board.publicId}`}>
              <div className="overflow-hidden rounded-lg border border-light-300 bg-white shadow-sm hover:shadow-md transition-shadow dark:border-dark-600 dark:bg-dark-100">
                {/* Cover Image Section */}
                <div className="relative h-[120px] w-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600">
                  <div 
                    className="h-full w-full bg-cover bg-center transition-transform group-hover:scale-105"
                    style={{ backgroundImage: `url(${coverImageUrl})` }}
                  />
                </div>
                
                {/* Board Name Section */}
                <div className="p-3">
                  <p className="text-[14px] font-semibold text-neutral-900 dark:text-dark-1000 truncate">
                    {board.name}
                  </p>
                </div>
              </div>
            </Link>
            
            {/* Upload Icon - Top Left of Image */}
            <div className="absolute left-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
              <label
                htmlFor={`upload-${board.publicId}`}
                className="flex cursor-pointer items-center justify-center rounded-md bg-white/90 backdrop-blur-sm p-2 shadow-md transition-colors hover:bg-white dark:bg-dark-200/90 dark:hover:bg-dark-200"
                title="Upload cover image"
                onClick={(e) => e.stopPropagation()}
              >
                <HiPhoto className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                <input
                  id={`upload-${board.publicId}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, board.publicId)}
                  disabled={uploadingBoardId === board.publicId}
                />
              </label>
            </div>

            {/* Action Buttons - Top Right of Image */}
            <div className="absolute right-2 top-2 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              {/* Close Button */}
              <button
                onClick={(e) => handleCloseBoard(e, board.publicId, board.name)}
                className="rounded-md bg-white/90 backdrop-blur-sm p-2 shadow-md transition-colors hover:bg-white dark:bg-dark-200/90 dark:hover:bg-dark-200"
                title="Close board"
                disabled={closeBoardMutation.isPending}
              >
                <HiArchiveBox className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </button>
              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteBoard(e, board.publicId, board.name)}
                className="rounded-md bg-white/90 backdrop-blur-sm p-2 shadow-md transition-colors hover:bg-white dark:bg-dark-200/90 dark:hover:bg-dark-200"
                title="Delete board permanently"
                disabled={deleteBoardMutation.isPending}
              >
                <HiOutlineTrash className="h-4 w-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
