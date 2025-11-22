import { useRef } from "react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportZip?: (file: File) => void;
  onImportFolder?: (files: FileList) => void;
}

export default function ImportModal({
  isOpen,
  onClose,
  onImportZip,
  onImportFolder,
}: ImportModalProps) {
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleZipSelect = () => {
    zipInputRef.current?.click();
  };

  const handleFolderSelect = () => {
    folderInputRef.current?.click();
  };

  const handleZipChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImportZip) {
      onImportZip(file);
      onClose();
    }
  };

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && onImportFolder) {
      onImportFolder(files);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-96 max-w-md rounded-lg bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Import Files</h2>
          <button
            onClick={onClose}
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
          {/* Import from ZIP Archive */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="font-medium text-gray-900">
                Import from ZIP Archive
              </span>
            </div>
            <p className="mb-3 text-sm text-gray-600">
              Upload a ZIP file to extract and import all contained files
            </p>
            <button
              onClick={handleZipSelect}
              className="w-3/4 rounded-lg border-2 border-dashed border-blue-300 p-3 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <svg
                  className="h-5 w-5"
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
                <span className="font-medium">Select ZIP File</span>
              </div>
            </button>
          </div>

          {/* Import Folder */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-600"
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
              <span className="font-medium text-gray-900">Import Folder</span>
            </div>
            <p className="mb-3 text-sm text-gray-600">
              Select a folder to import all files within it
            </p>
            <button
              onClick={handleFolderSelect}
              className="w-3/4 rounded-lg border border-gray-300 p-3 text-center transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <svg
                  className="h-5 w-5"
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
                <span className="font-medium">Select Folder</span>
              </div>
            </button>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip"
          onChange={handleZipChange}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          {...({
            webkitdirectory: "",
          } as React.InputHTMLAttributes<HTMLInputElement>)}
          onChange={handleFolderChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
