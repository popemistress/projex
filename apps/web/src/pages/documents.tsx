import type { NextPageWithLayout } from "./_app";
import { getDashboardLayout } from "~/components/Dashboard";
import Popup from "~/components/Popup";
import DocumentsView from "~/views/documents";

const DocumentsPage: NextPageWithLayout = () => {
  return (
    <>
      <DocumentsView />
      <Popup />
    </>
  );
};

DocumentsPage.getLayout = (page) => getDashboardLayout(page);

export default DocumentsPage;
