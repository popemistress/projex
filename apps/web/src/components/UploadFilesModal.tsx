import { useRef, useState } from "react";

interface UploadFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (files: FileList) => void;
}

export default function UploadFilesModal({
  isOpen,
  onClose,
  onUpload,
}: UploadFilesModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0 && onUpload) {
      const fileList = fileInputRef.current?.files;
      if (fileList) {
        onUpload(fileList);
      }
    }
    onClose();
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-[500px] max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upload Files</h2>
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

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {selectedFiles.length}/10 files selected
          </p>
        </div>

        {/* Drag and Drop Area */}
        <div
          className={`rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleFileSelect}
        >
          <div className="flex flex-col items-center">
            <svg
              className="mb-4 h-12 w-12 text-gray-400"
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
            <p className="mb-2 font-medium text-gray-600">
              Drag & drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Max 10 files • Max 100MB • PDF, DOC, DOCX, TXT, JPG, PNG, GIF,
              WEBP, SVG, MP4, MP3, ZIP, RAR
            </p>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 max-h-32 overflow-y-auto">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Selected files:
            </p>
            <ul className="space-y-1">
              {selectedFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm text-gray-600"
                >
                  <span className="truncate">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Upload {selectedFiles.length} files
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.mp3,.zip,.rar"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
