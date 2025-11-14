import { useState } from "react";
import { HiChevronDown, HiInformationCircle } from "react-icons/hi2";

import { useWorkspace } from "~/providers/workspace";

export function MyWorkspaces() {
  const { availableWorkspaces, switchWorkspace, workspace: currentWorkspace } = useWorkspace();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!availableWorkspaces || availableWorkspaces.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-light-300 bg-white p-6 shadow-sm dark:border-dark-400 dark:bg-dark-100">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-4 flex w-full items-center gap-2 text-left"
      >
        <HiChevronDown
          className={`h-5 w-5 text-neutral-600 transition-transform dark:text-dark-700 ${
            isExpanded ? "" : "-rotate-90"
          }`}
        />
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-dark-1000">
          My workspaces
        </h2>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-light-200 text-xs text-neutral-600 dark:bg-dark-300 dark:text-dark-800">
          {availableWorkspaces?.length || 0}
        </span>
      </button>
      {isExpanded && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {availableWorkspaces.map((ws) => {
          const isActive = currentWorkspace.publicId === ws.publicId;
          const bgColor = ws.name === "Main workspace" ? "bg-red-500" : "bg-yellow-500";
          
          return (
            <button
              key={ws.publicId}
              onClick={() => switchWorkspace(ws)}
              className={`group rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                isActive
                  ? "border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                  : "border-light-300 bg-white hover:border-light-400 dark:border-dark-400 dark:bg-dark-100 dark:hover:border-dark-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${bgColor}`}>
                  <span className="text-lg font-bold text-white">
                    {ws.name.charAt(0).toUpperCase()}
                  </span>
                  {ws.name === "Main workspace" && (
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-neutral-900 dark:text-dark-1000">
                    {ws.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-dark-700">
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                    </svg>
                    <span>Workspaces</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        </div>
      )}
    </div>
  );
}
