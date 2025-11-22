import { HiArrowDownTray, HiOutlinePlusSmall } from "react-icons/hi2";

import { authClient } from "@kan/auth/client";

import Button from "~/components/Button";
import FeedbackModal from "~/components/FeedbackModal";
import Modal from "~/components/modal";
import { NewWorkspaceForm } from "~/components/NewWorkspaceForm";
import { PageHead } from "~/components/PageHead";
import { useModal } from "~/providers/modal";
import { useWorkspace } from "~/providers/workspace";
import { ClosedBoards } from "./components/ClosedBoards";
import { ImportBoardsForm } from "./components/ImportBoardsForm";
import { MyWorkspaces } from "./components/MyWorkspaces";
import { NewBoardForm } from "./components/NewBoardForm";
import { RecentlyVisited } from "./components/RecentlyVisited";
import { RightSidebar } from "./components/RightSidebar";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "night";
}

export default function BoardsPage({ isTemplate }: { isTemplate?: boolean }) {
  const { openModal, modalContentType, isOpen } = useModal();
  const { workspace } = useWorkspace();
  const { data: session } = authClient.useSession();

  const greeting = getGreeting();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <>
      <PageHead
        title={`${isTemplate ? "Templates" : "Home"} | ${workspace.name ?? "Workspace"}`}
      />
      <div className="h-full w-full bg-light-50 dark:bg-dark-50">
        {/* Header Section */}
        <div className="border-b border-light-300 bg-white px-8 py-6 dark:border-dark-400 dark:bg-dark-100">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-dark-1000">
            Good {greeting}, {firstName}!
          </h1>
          <p className="text-sm text-neutral-600 dark:text-dark-700">
            Quickly access your recent boards, Inbox and workspaces
          </p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="mx-auto flex max-w-[1600px] gap-6 p-8">
          {/* Left Content Area */}
          <div className="flex-1">
            {/* Recently Visited Section */}
            <RecentlyVisited />

            {/* My Workspaces Section */}
            <MyWorkspaces />

            {/* Closed Boards Section */}
            <ClosedBoards />
          </div>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>

        {/* Modals */}
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
      </div>
    </>
  );
}
