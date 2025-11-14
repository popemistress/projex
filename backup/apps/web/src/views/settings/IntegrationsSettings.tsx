import { useEffect } from "react";
import { HiMiniArrowTopRightOnSquare } from "react-icons/hi2";

import Button from "~/components/Button";
import FeedbackModal from "~/components/FeedbackModal";
import Modal from "~/components/modal";
import { NewWorkspaceForm } from "~/components/NewWorkspaceForm";
import { PageHead } from "~/components/PageHead";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

export default function IntegrationsSettings() {
  const { modalContentType, isOpen } = useModal();
  const { showPopup } = usePopup();

  const {
    data: integrations,
    refetch: refetchIntegrations,
    isLoading: integrationsLoading,
  } = api.integration.providers.useQuery();

  const hasTrelloIntegration = integrations?.some(
    (integration) => integration.provider === "trello",
  );

  const { data: trelloUrl, refetch: refetchTrelloUrl } =
    api.integration.getAuthorizationUrl.useQuery(
      { provider: "trello" },
      {
        enabled: !integrationsLoading && !hasTrelloIntegration,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: false,
      },
    );

  useEffect(() => {
    const handleFocus = () => {
      refetchIntegrations();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetchIntegrations]);

  const { mutateAsync: disconnectTrello } =
    api.integration.disconnect.useMutation({
      onSuccess: () => {
        refetchIntegrations();
        refetchTrelloUrl();
        showPopup({
          header: "Trello disconnected",
          message: "Your Trello account has been disconnected.",
          icon: "success",
        });
      },
      onError: () => {
        showPopup({
          header: "Error disconnecting Trello",
          message: "An error occurred while disconnecting your Trello account.",
          icon: "error",
        });
      },
    });

  return (
    <>
      <PageHead title={"Settings | Integrations"} />

      <div className="mb-8 border-t border-light-300 dark:border-dark-300">
        <h2 className="mb-4 mt-8 text-[14px] font-bold text-neutral-900 dark:text-dark-1000">
          {"Trello"}
        </h2>
        {!integrations?.some(
          (integration) => integration.provider === "trello",
        ) && trelloUrl ? (
          <>
            <p className="mb-8 text-sm text-neutral-500 dark:text-dark-900">
              {"Connect your Trello account to import boards."}
            </p>
            <Button
              variant="primary"
              iconRight={<HiMiniArrowTopRightOnSquare />}
              onClick={() =>
                window.open(
                  trelloUrl.url,
                  "trello_auth",
                  "height=800,width=600",
                )
              }
            >
              {"Connect Trello"}
            </Button>
          </>
        ) : (
          integrations?.some(
            (integration) => integration.provider === "trello",
          ) && (
            <>
              <p className="mb-8 text-sm text-neutral-500 dark:text-dark-900">
                {"Your Trello account is connected."}
              </p>
              <Button
                variant="secondary"
                onClick={() => disconnectTrello({ provider: "trello" })}
              >
                {"Disconnect Trello"}
              </Button>
            </>
          )
        )}
      </div>

      {/* Global modals */}
      <Modal
        modalSize="md"
        isVisible={isOpen && modalContentType === "NEW_FEEDBACK"}
      >
        <FeedbackModal />
      </Modal>
      <Modal
        modalSize="sm"
        isVisible={isOpen && modalContentType === "NEW_WORKSPACE"}
      >
        <NewWorkspaceForm />
      </Modal>
    </>
  );
}
