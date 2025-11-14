import { useRouter } from "next/router";
import { HiArchiveBox, HiOutlineTrash } from "react-icons/hi2";

import Button from "~/components/Button";
import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";

export function ClosedBoards() {
  const { workspace } = useWorkspace();
  const { showPopup } = usePopup();
  const router = useRouter();
  const utils = api.useUtils();

  // Query for closed/archived boards
  const { data: closedBoards, isLoading } = api.board.archived.useQuery(
    {
      workspacePublicId: workspace.publicId,
      type: "regular",
    },
    { enabled: !!workspace.publicId && workspace.publicId.length >= 12 },
  );

  // Restore (reopen) board mutation
  const restoreBoardMutation = api.board.restore.useMutation({
    onSuccess: async () => {
      showPopup({
        header: "Board reopened",
        message: "The board has been successfully reopened.",
        icon: "success",
      });
      // Invalidate all board queries to refresh the UI
      await utils.board.invalidate();
    },
    onError: () => {
      showPopup({
        header: "Unable to reopen board",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
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
      // Invalidate all board queries to refresh the UI
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

  const boards = closedBoards || [];

  if (isLoading) {
    return (
      <div className="mb-6 rounded-lg border border-light-300 bg-white p-6 shadow-sm dark:border-dark-400 dark:bg-dark-100">
        <div className="mb-4 flex items-center gap-2">
          <HiArchiveBox className="h-5 w-5 text-neutral-600 dark:text-dark-700" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-dark-1000">
            Closed boards
          </h2>
        </div>
        <p className="text-sm text-neutral-500 dark:text-dark-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-light-300 bg-white p-6 shadow-sm dark:border-dark-400 dark:bg-dark-100">
      <div className="mb-4 flex items-center gap-2">
        <HiArchiveBox className="h-5 w-5 text-neutral-600 dark:text-dark-700" />
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-dark-1000">
          Closed boards
        </h2>
      </div>

      {boards.length === 0 ? (
        <div className="rounded-lg border border-light-300 bg-white p-8 text-center dark:border-dark-400 dark:bg-dark-100">
          <HiArchiveBox className="mx-auto h-12 w-12 text-neutral-400 dark:text-dark-700" />
          <p className="mt-2 text-sm text-neutral-600 dark:text-dark-700">
            No closed boards
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {boards.map((board) => (
            <div
              key={board.publicId}
              className="flex items-center justify-between rounded-lg border border-light-300 bg-white p-4 dark:border-dark-400 dark:bg-dark-100"
            >
              <div className="flex items-center gap-3">
                {/* Board Thumbnail */}
                <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded bg-gradient-to-br from-purple-500 to-blue-500" />
                
                <div>
                  <h3 className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                    {board.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-dark-700">
                    {workspace.name}
                  </p>
                </div>
              </div>

              <div 
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none disabled:opacity-50"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    restoreBoardMutation.mutate({
                      boardPublicId: board.publicId,
                    });
                  }}
                  disabled={restoreBoardMutation.isPending}
                >
                  {restoreBoardMutation.isPending ? "Reopening..." : "Reopen"}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-red-600 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100 focus-visible:outline-none disabled:opacity-50 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to permanently delete "${board.name}"? This action cannot be undone.`)) {
                      deleteBoardMutation.mutate({
                        boardPublicId: board.publicId,
                      });
                    }
                  }}
                  disabled={deleteBoardMutation.isPending}
                >
                  <HiOutlineTrash className="h-4 w-4" />
                  {deleteBoardMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
