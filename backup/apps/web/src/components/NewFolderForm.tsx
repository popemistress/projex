import { useState } from "react";
import { HiFolder } from "react-icons/hi2";

import Button from "~/components/Button";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";

export function NewFolderForm() {
  const { closeModal } = useModal();
  const { showPopup } = usePopup();
  const { workspace } = useWorkspace();
  const [folderName, setFolderName] = useState("");
  const utils = api.useUtils();

  const createFolderMutation = api.folder.create.useMutation({
    onSuccess: () => {
      utils.folder.all.invalidate();
      showPopup({
        header: "Folder created",
        message: `"${folderName}" has been created successfully.`,
        icon: "success",
      });
      closeModal();
    },
    onError: () => {
      showPopup({
        header: "Unable to create folder",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      showPopup({
        header: "Folder name required",
        message: "Please enter a name for your folder.",
        icon: "error",
      });
      return;
    }

    createFolderMutation.mutate({
      workspacePublicId: workspace.publicId,
      name: folderName.trim(),
    });
  };

  const isCreating = createFolderMutation.isPending;

  const handleCancel = () => {
    if (!isCreating) {
      closeModal();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="folderName"
          className="block text-sm font-medium text-neutral-700 dark:text-dark-900"
        >
          Folder Name
        </label>
        <div className="mt-1 flex items-center gap-2">
          <HiFolder className="h-5 w-5 text-neutral-400 dark:text-dark-700" />
          <input
            type="text"
            id="folderName"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name"
            className="block w-full rounded-md border border-light-300 bg-white px-3 py-2 text-sm placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-500 dark:bg-dark-100 dark:text-dark-1000 dark:placeholder-dark-700"
            autoFocus
            disabled={isCreating}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancel}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isCreating || !folderName.trim()}
        >
          {isCreating ? "Creating..." : "Create Folder"}
        </Button>
      </div>
    </form>
  );
}

// Keep the rest of the component unchanged
export function OldNewFolderForm() {
  const { closeModal } = useModal();
  const { showPopup } = usePopup();
  const { workspace } = useWorkspace();
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      showPopup({
        header: "Folder name required",
        message: "Please enter a name for your folder.",
        icon: "error",
      });
      return;
    }

    setIsCreating(true);

    try {
      // OLD localStorage code - keeping for reference
      const storageKey = `kan_folders_${workspace.publicId}`;
      const existingFolders = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const newFolder = {
        id: `folder_${Date.now()}`,
        name: folderName,
        createdAt: new Date().toISOString(),
        isExpanded: false,
      };
      
      existingFolders.push(newFolder);
      localStorage.setItem(storageKey, JSON.stringify(existingFolders));

      showPopup({
        header: "Folder created",
        message: `"${folderName}" has been created successfully.`,
        icon: "success",
      });

      closeModal();
      
      window.dispatchEvent(new CustomEvent("folderCreated"));
    } catch (error) {
      showPopup({
        header: "Unable to create folder",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coral/10 dark:bg-coral/20">
          <HiFolder className="h-6 w-6 text-coral" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
            Create new folder
          </h2>
          <p className="text-sm text-neutral-600 dark:text-dark-700">
            Organize your boards into folders
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="folderName"
            className="mb-2 block text-sm font-medium text-neutral-700 dark:text-dark-900"
          >
            Folder name
          </label>
          <input
            id="folderName"
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g., Marketing, Development, Personal"
            className="w-full rounded-md border border-light-400 bg-light-50 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral dark:border-dark-500 dark:bg-dark-200 dark:text-dark-1000 dark:placeholder-dark-700"
            autoFocus
            maxLength={50}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={closeModal}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || !folderName.trim()}>
            {isCreating ? "Creating..." : "Create folder"}
          </Button>
        </div>
      </form>
    </div>
  );
}
