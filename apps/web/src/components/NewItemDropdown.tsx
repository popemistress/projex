import { useEffect, useRef } from "react";

interface NewItemDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: () => void;
  onCreateFolder: () => void;
  onCreateMindMap: () => void;
}

export default function NewItemDropdown({
  isOpen,
  onClose,
  onUploadFile,
  onCreateFolder,
  onCreateMindMap,
}: NewItemDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l3 3m0 0l3-3m-3 3V9"
          />
        </svg>
      ),
      label: "Upload File",
      onClick: () => {
        onUploadFile();
        onClose();
      },
    },
    {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
      label: "Create Folder",
      onClick: () => {
        onCreateFolder();
        onClose();
      },
    },
    {
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      label: "Mind Map",
      onClick: () => {
        onCreateMindMap();
        onClose();
      },
    },
  ];

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-gray-200 bg-white shadow-lg"
    >
      <div className="py-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
