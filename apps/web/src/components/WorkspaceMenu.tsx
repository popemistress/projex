import { Button, Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { HiCheck, HiMagnifyingGlass } from "react-icons/hi2";
import { twMerge } from "tailwind-merge";

import { useModal } from "~/providers/modal";
import { useWorkspace } from "~/providers/workspace";
import CommandPallette from "./CommandPallette";

export default function WorkspaceMenu({
  isCollapsed = false,
}: {
  isCollapsed?: boolean;
}) {
  const { workspace, isLoading, availableWorkspaces, switchWorkspace } =
    useWorkspace();
  const { openModal } = useModal();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <CommandPallette isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <div className="pb-3">
        {/* Only show search button */}
        {!isCollapsed && (
          <Button
            className="mb-1 flex h-[34px] w-full items-center justify-center gap-2 rounded-lg bg-light-200 p-2 text-sm text-neutral-600 hover:bg-light-300 focus:outline-none dark:bg-dark-200 dark:text-dark-900 dark:hover:bg-dark-300"
            onClick={() => setIsOpen(true)}
          >
            <HiMagnifyingGlass className="h-4 w-4" aria-hidden="true" />
            <span>Quick search</span>
            <span className="ml-auto text-xs text-neutral-400 dark:text-dark-700">
              Ctrl+K
            </span>
          </Button>
        )}
      </div>
      <Menu as="div" className="relative inline-block w-full text-left" style={{ display: 'none' }}>
        <div>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={twMerge(
              "absolute left-0 z-10 origin-top-left rounded-md border border-light-600 bg-light-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-dark-600 dark:bg-dark-300",
              isCollapsed ? "w-48" : "w-full",
            )}
          >
            <div className="p-1">
              {availableWorkspaces.map((availableWorkspace) => (
                <div key={availableWorkspace.publicId} className="flex">
                  <Menu.Item>
                    <button
                      onClick={() => switchWorkspace(availableWorkspace)}
                      className="flex w-full items-center justify-between rounded-[5px] px-3 py-2 text-left text-sm text-neutral-900 hover:bg-light-200 dark:text-dark-1000 dark:hover:bg-dark-400"
                    >
                      <div className="flex min-w-0 flex-1 items-center">
                        <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[5px] bg-indigo-700">
                          <span className="text-xs font-medium leading-none text-white">
                            {availableWorkspace.name.charAt(0).toUpperCase()}
                          </span>
                        </span>
                        <span className="ml-2 truncate text-xs font-medium">
                          {availableWorkspace.name}
                        </span>
                      </div>
                      {workspace.publicId === availableWorkspace.publicId && (
                        <span>
                          <HiCheck className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  </Menu.Item>
                </div>
              ))}
            </div>
            <div className="border-t-[1px] border-light-600 p-1 dark:border-dark-500">
              <Menu.Item>
                <button
                  onClick={() => openModal("NEW_WORKSPACE")}
                  className="flex w-full items-center justify-between rounded-[5px] px-3 py-2 text-left text-xs text-neutral-900 hover:bg-light-200 dark:text-dark-1000 dark:hover:bg-dark-400"
                >
                  {"Create workspace"}
                </button>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}
