import { useState } from "react";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder?: (name: string, color: string) => void;
}

export default function CreateFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState("blue");

  if (!isOpen) return null;

  const colors = [
    {
      name: "blue",
      label: "Blue",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      name: "green",
      label: "Green",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      name: "purple",
      label: "Purple",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      name: "orange",
      label: "Orange",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      name: "pink",
      label: "Pink",
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600",
    },
    {
      name: "red",
      label: "Red",
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      name: "yellow",
      label: "Yellow",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      name: "gray",
      label: "Gray",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-600",
    },
  ];

  const handleCreate = () => {
    if (folderName.trim() && onCreateFolder) {
      onCreateFolder(folderName.trim(), selectedColor);
    }
    handleClose();
  };

  const handleClose = () => {
    setFolderName("");
    setSelectedColor("blue");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-96 max-w-md rounded-lg bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-600"
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
            <h2 className="text-lg font-semibold text-gray-900">
              Create New Folder
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Folder Name Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Folder Color Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Folder Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`flex flex-col items-center rounded-lg border-2 p-3 transition-colors ${
                    selectedColor === color.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded ${color.bgColor} mb-1 flex items-center justify-center`}
                  >
                    <svg
                      className={`h-5 w-5 ${color.iconColor}`}
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
                  </div>
                  <span className="text-xs text-gray-600">{color.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!folderName.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create Folder
          </button>
        </div>
      </div>
    </div>
  );
}
