import type { NextPageWithLayout } from "../_app";
import { getDashboardLayout } from "~/components/Dashboard";
import Popup from "~/components/Popup";
import BoardsListView from "~/views/boards/BoardsListView";

const BoardsListPage: NextPageWithLayout = () => {
  return (
    <>
      <BoardsListView />
      <Popup />
    </>
  );
};

BoardsListPage.getLayout = (page) => getDashboardLayout(page);

export default BoardsListPage;
