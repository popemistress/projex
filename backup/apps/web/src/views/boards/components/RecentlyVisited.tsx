import Link from "next/link";
import { useState } from "react";
import { HiChevronDown, HiOutlineStar } from "react-icons/hi2";

import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";

export function RecentlyVisited() {
  const { workspace } = useWorkspace();
  const [isExpanded, setIsExpanded] = useState(true);

  const { data: boards, isLoading } = api.board.all.useQuery(
    {
      workspacePublicId: workspace.publicId,
      type: "regular",
    },
    { enabled: !!workspace.publicId && workspace.publicId.length >= 12 },
  );

  // Show only first 3 boards as recently visited
  const recentBoards = boards?.slice(0, 3) || [];

  if (isLoading) {
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
            Recently visited
          </h2>
        </button>
        {isExpanded && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-[180px] animate-pulse rounded-lg bg-light-200 dark:bg-dark-200" />
            <div className="h-[180px] animate-pulse rounded-lg bg-light-200 dark:bg-dark-200" />
            <div className="h-[180px] animate-pulse rounded-lg bg-light-200 dark:bg-dark-200" />
          </div>
        )}
      </div>
    );
  }

  if (recentBoards.length === 0) {
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
          Recently visited
        </h2>
      </button>
      {isExpanded && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentBoards.map((board) => (
          <Link
            key={board.publicId}
            href={`/boards/${board.publicId}`}
            className="group"
          >
            <div className="overflow-hidden rounded-lg border border-light-300 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dark-400 dark:bg-dark-100">
              {/* Board Preview */}
              <div className="relative h-32 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-900/20 dark:to-blue-800/20">
                {/* Board Icon and Progress Bars */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-500">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[60, 40, 80].map((width, idx) => (
                      <div key={idx} className="h-2 overflow-hidden rounded-full bg-white/30">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column Chart */}
                <div className="absolute bottom-2 right-2 flex items-end gap-1">
                  <div className="h-8 w-2 rounded-t bg-green-500" />
                  <div className="h-6 w-2 rounded-t bg-yellow-500" />
                  <div className="h-10 w-2 rounded-t bg-yellow-500" />
                </div>
              </div>

              {/* Board Info */}
              <div className="border-t border-light-300 p-3 dark:border-dark-400">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-neutral-400 dark:text-dark-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-900 dark:text-dark-1000">
                      {board.name}
                    </span>
                  </div>
                  <button className="text-neutral-400 hover:text-yellow-500 dark:text-dark-700">
                    <HiOutlineStar className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500 dark:text-dark-700">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                  </svg>
                  <span>Workspaces</span>
                  <span>•</span>
                  <span>{workspace.name}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        </div>
      )}
    </div>
  );
}
