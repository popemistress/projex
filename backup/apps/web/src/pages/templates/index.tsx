import type { NextPageWithLayout } from "~/pages/_app";
import { getDashboardLayout } from "~/components/Dashboard";
import Popup from "~/components/Popup";
import BoardsListView from "~/views/boards/BoardsListView";

const TemplatesPage: NextPageWithLayout = () => {
  return (
    <>
      <BoardsListView isTemplate />
      <Popup />
    </>
  );
};

TemplatesPage.getLayout = (page) => getDashboardLayout(page);

export default TemplatesPage;
