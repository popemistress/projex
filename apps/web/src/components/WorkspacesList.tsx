import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { HiCheck, HiEllipsisHorizontal, HiMagnifyingGlass, HiPlus, HiFolderPlus } from "react-icons/hi2";
import { TbChevronDown, TbChevronUp, TbGridDots } from "react-icons/tb";
import { twMerge } from "tailwind-merge";

import { useModal } from "~/providers/modal";
import { useWorkspace } from "~/providers/workspace";

export default function WorkspacesList({
  isCollapsed = false,
  onCloseSideNav,
}: {
  isCollapsed?: boolean;
  onCloseSideNav?: () => void;
}) {
  const { workspace, isLoading, isWorkspaceReady, availableWorkspaces, switchWorkspace } =
    useWorkspace();
  const { openModal } = useModal();
  const [searchQuery, setSearchQuery] = useState("");

  // Show loading state
  if (isLoading) {
    return (
      <div className="mb-4">
        <div className="mb-2 px-2">
          <span className="text-xs font-medium text-neutral-500 dark:text-dark-700">Workspaces</span>
        </div>
        <div className="px-2 py-2 text-sm text-neutral-400 dark:text-dark-600">
          Loading...
        </div>
      </div>
    );
  }

  // Show collapsed version
  if (isCollapsed) {
    return null;
  }

  // Show "Create workspace" link if no workspaces or workspace not ready
  if (!isWorkspaceReady || !availableWorkspaces || availableWorkspaces.length === 0) {
    return (
      <div className="mb-4">
        <div className="mb-2 px-2">
          <span className="text-xs font-medium text-neutral-500 dark:text-dark-700">Workspaces</span>
        </div>
        <button
          onClick={() => openModal("NEW_WORKSPACE")}
          className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 dark:text-dark-700 dark:hover:text-dark-1000"
        >
          <HiPlus className="h-4 w-4" />
          <span>Create workspace</span>
        </button>
      </div>
    );
  }

  const filteredWorkspaces = availableWorkspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="mb-4">
      {/* Workspaces Header with Workspace Name and Add Button */}
      <div className="mb-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-red-500">
            <span className="text-xs font-bold leading-none text-white">
              {workspace.name.charAt(0).toUpperCase()}
            </span>
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900 dark:text-dark-1000">
            {workspace.name}
          </span>
        </div>
        <button
          onClick={() => openModal("NEW_WORKSPACE")}
          className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 hover:bg-light-200 dark:border-dark-500 dark:hover:bg-dark-200"
          title="Add workspace"
        >
          <HiPlus className="h-4 w-4 text-neutral-600 dark:text-dark-700" />
        </button>
      </div>

      {/* Workspace Switcher Dropdown */}
      <Menu as="div" className="relative mb-3">
        {({ open }) => (
          <>
            <Menu.Button className="flex w-full items-center justify-between rounded-md p-2 text-xs text-neutral-600 hover:bg-light-200 dark:text-dark-700 dark:hover:bg-dark-200">
              <span>Switch workspace</span>
              {open ? (
                <TbChevronUp className="h-3 w-3 flex-shrink-0" />
              ) : (
                <TbChevronDown className="h-3 w-3 flex-shrink-0" />
              )}
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 z-10 mt-1 w-full origin-top-left rounded-md border border-light-600 bg-light-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-dark-600 dark:bg-dark-300">
                {/* Search Input */}
                <div className="p-3">
                  <div className="relative">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-dark-700" />
                    <input
                      type="text"
                      placeholder="Search for a workspace"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-light-400 bg-light-50 py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-200 dark:text-dark-1000 dark:placeholder-dark-700"
                    />
                  </div>
                </div>

                {/* My workspaces Section */}
                <div className="px-3 pb-2">
                  <div className="mb-2 text-xs font-medium text-neutral-600 dark:text-dark-700">
                    My workspaces
                  </div>
                  <div className="space-y-1">
                    {filteredWorkspaces.map((availableWorkspace) => {
                      const isActive =
                        workspace.publicId === availableWorkspace.publicId;
                      return (
                        <Menu.Item key={availableWorkspace.publicId}>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                switchWorkspace(availableWorkspace);
                                onCloseSideNav?.();
                                setSearchQuery("");
                              }}
                              className={twMerge(
                                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm",
                                isActive
                                  ? "bg-blue-100 dark:bg-blue-900/30"
                                  : active
                                    ? "bg-light-200 dark:bg-dark-400"
                                    : "text-neutral-900 dark:text-dark-1000",
                              )}
                            >
                              <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-red-500">
                                <span className="text-xs font-medium leading-none text-white">
                                  {availableWorkspace.name.charAt(0).toUpperCase()}
                                </span>
                              </span>
                              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                {availableWorkspace.name}
                              </span>
                            </button>
                          )}
                        </Menu.Item>
                      );
                    })}
                  </div>
                </div>

              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>

    </div>
  );
}
