import { HiArrowDownTray, HiOutlinePlusSmall } from "react-icons/hi2";

import Button from "~/components/Button";
import FeedbackModal from "~/components/FeedbackModal";
import Modal from "~/components/modal";
import { NewWorkspaceForm } from "~/components/NewWorkspaceForm";
import { PageHead } from "~/components/PageHead";
import { useModal } from "~/providers/modal";
import { useWorkspace } from "~/providers/workspace";
import { BoardsList } from "./components/BoardsList";
import { ImportBoardsForm } from "./components/ImportBoardsForm";
import { NewBoardForm } from "./components/NewBoardForm";

export default function BoardsListView({ isTemplate }: { isTemplate?: boolean }) {
  const { openModal, modalContentType, isOpen } = useModal();
  const { workspace } = useWorkspace();

  return (
    <>
      <PageHead
        title={`${isTemplate ? "Templates" : "Boards"} | ${workspace.name ?? "Workspace"}`}
      />
      <div className="m-auto h-full max-w-[1100px] p-6 px-5 md:px-28 md:py-12">
        {/* Header Card */}
        <div className="relative z-10 mb-6 rounded-lg border-2 border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-700 dark:bg-dark-100">
          <div className="flex w-full items-center justify-between">
            <h1 className="font-bold tracking-tight text-coral dark:text-coral sm:text-[1.2rem]">
              {isTemplate ? "Templates" : "Boards"}
            </h1>
            <div className="flex gap-2">
              {!isTemplate && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => openModal("IMPORT_BOARDS")}
                  iconLeft={
                    <HiArrowDownTray aria-hidden="true" className="h-4 w-4" />
                  }
                >
                  {"Import"}
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                onClick={() => openModal("NEW_BOARD")}
                iconLeft={
                  <HiOutlinePlusSmall aria-hidden="true" className="h-4 w-4" />
                }
              >
                {"New"}
              </Button>
            </div>
          </div>
        </div>

        <>
          <Modal
            modalSize="md"
            isVisible={isOpen && modalContentType === "NEW_FEEDBACK"}
          >
            <FeedbackModal />
          </Modal>

          <Modal
            modalSize="sm"
            isVisible={isOpen && modalContentType === "NEW_BOARD"}
          >
            <NewBoardForm isTemplate={!!isTemplate} />
          </Modal>

          <Modal
            modalSize="sm"
            isVisible={isOpen && modalContentType === "IMPORT_BOARDS"}
          >
            <ImportBoardsForm />
          </Modal>

          <Modal
            modalSize="sm"
            isVisible={isOpen && modalContentType === "NEW_WORKSPACE"}
          >
            <NewWorkspaceForm />
          </Modal>
        </>

        {/* Boards List Card */}
        <div className="rounded-lg border-2 border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-700 dark:bg-dark-100">
          <BoardsList isTemplate={!!isTemplate} />
        </div>
      </div>
    </>
  );
}
