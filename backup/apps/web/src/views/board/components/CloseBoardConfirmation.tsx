import { useRouter } from "next/router";

import Button from "~/components/Button";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

export function CloseBoardConfirmation({
  boardPublicId,
}: {
  boardPublicId: string;
}) {
  const router = useRouter();
  const { closeModal } = useModal();
  const { showPopup } = usePopup();
  const utils = api.useUtils();

  // Close board by soft deleting it (setting deletedAt)
  const closeBoardMutation = api.board.delete.useMutation({
    onSuccess: async () => {
      showPopup({
        header: "Board closed",
        message: "The board has been closed successfully.",
        icon: "success",
      });
      closeModal();
      // Invalidate all board queries to refresh the UI
      await utils.board.invalidate();
      void router.push("/boards");
    },
    onError: () => {
      showPopup({
        header: "Unable to close board",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  const handleCloseBoard = () => {
    closeBoardMutation.mutate({
      boardPublicId,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
        Close board?
      </h2>
      <p className="text-sm text-neutral-600 dark:text-dark-700">
        This board will be closed and moved to your closed boards. You can reopen it anytime.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCloseBoard}
          isLoading={closeBoardMutation.isPending}
        >
          Close board
        </Button>
      </div>
    </div>
  );
}
