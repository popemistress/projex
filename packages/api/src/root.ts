import { boardRouter } from "./routers/board";
import { cardRouter } from "./routers/card";
import { checklistRouter } from "./routers/checklist";
import { feedbackRouter } from "./routers/feedback";
import { fileRouter } from "./routers/file";
import { folderRouter } from "./routers/folder";
import { goalRouter } from "./routers/goal";
import { habitRouter } from "./routers/habit";
import { importRouter } from "./routers/import";
import { integrationRouter } from "./routers/integration";
import { labelRouter } from "./routers/label";
import { listRouter } from "./routers/list";
import { memberRouter } from "./routers/member";
import { searchRouter } from "./routers/search";
import { timeTrackingRouter } from "./routers/timeTracking";
import { userRouter } from "./routers/user";
import { workspaceRouter } from "./routers/workspace";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  board: boardRouter,
  card: cardRouter,
  checklist: checklistRouter,
  feedback: feedbackRouter,
  file: fileRouter,
  folder: folderRouter,
  goal: goalRouter,
  habit: habitRouter,
  label: labelRouter,
  list: listRouter,
  member: memberRouter,
  import: importRouter,
  search: searchRouter,
  timeTracking: timeTrackingRouter,
  user: userRouter,
  workspace: workspaceRouter,
  integration: integrationRouter,
});

export type AppRouter = typeof appRouter;
