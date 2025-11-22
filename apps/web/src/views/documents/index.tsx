import { useRef, useState } from "react";

import CreateFolderModal from "~/components/CreateFolderModal";
import ImportModal from "~/components/ImportModal";
import NewItemDropdown from "~/components/NewItemDropdown";
import UploadFilesModal from "~/components/UploadFilesModal";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";

export default function DocumentsView() {
  const { workspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewItemDropdown, setShowNewItemDropdown] = useState(false);
  const [showUploadFilesModal, setShowUploadFilesModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "preview" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: Fetch documents from API once the endpoint is available
  // const { data: documentsData, isLoading, refetch } = api.documents.getByWorkspace.useQuery(
  //   {
  //     workspacePublicId: workspace.publicId,
  //     limit: itemsPerPage,
  //     offset: 0,
  //     search: searchQuery || undefined,
  //   },
  //   {
  //     enabled: !!workspace.publicId,
  //   }
  // );

  // Temporary placeholder data until API endpoint is built and deployed
  const documents: any[] = [];
  const totalDocuments = 0;
  const isLoading = false;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert(`Successfully uploaded ${files.length} file(s)!`);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    }
  };

  const handleImportZip = async (file: File) => {
    try {
      // Simulate ZIP import
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(`Successfully imported ZIP file: ${file.name}`);
    } catch (error) {
      console.error("ZIP import failed:", error);
      alert("ZIP import failed. Please try again.");
    }
  };

  const handleImportFolder = async (files: FileList) => {
    try {
      // Simulate folder import
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert(`Successfully imported ${files.length} files from folder`);
    } catch (error) {
      console.error("Folder import failed:", error);
      alert("Folder import failed. Please try again.");
    }
  };

  const handleUploadFiles = async (files: FileList) => {
    // Handle file upload
    console.log("Uploading files:", files);

    try {
      // TODO: Implement actual file upload using the API
      // For now, simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(`Successfully uploaded ${files.length} file(s)!`);

      // TODO: Refetch documents after upload
      // refetch();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    }
  };

  const handleCreateFolder = (name: string, color: string) => {
    // Handle folder creation
    console.log("Creating folder:", name, "with color:", color);
    alert(`Successfully created folder: ${name} (${color})`);
  };

  const handleCreateMindMap = () => {
    // Placeholder for create mind map functionality
    alert("Create mind map functionality to be implemented");
  };

  const handleNewItemUploadFile = () => {
    setShowUploadFilesModal(true);
    setShowNewItemDropdown(false);
  };

  const handleNewItemCreateFolder = () => {
    setShowCreateFolderModal(true);
    setShowNewItemDropdown(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F8FA" }}>
      <main className="w-full">
        {/* Header */}
        <div className="bg-white px-8 pb-3 pt-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
              aria-label="Import files"
            >
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Import
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b bg-white px-8 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents and content"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {isLoading ? "Loading..." : `${totalDocuments} documents`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* New Item Button with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNewItemDropdown(!showNewItemDropdown)}
                className="flex items-center gap-2 rounded bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 focus:outline-none"
              >
                + New Item
                <span className="text-blue-300">|</span>
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <NewItemDropdown
                isOpen={showNewItemDropdown}
                onClose={() => setShowNewItemDropdown(false)}
                onUploadFile={handleNewItemUploadFile}
                onCreateFolder={handleNewItemCreateFolder}
                onCreateMindMap={handleCreateMindMap}
              />
            </div>

            {/* View Toggle with Tooltips */}
            <div className="flex overflow-hidden rounded border-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`border border-gray-300 px-2 py-1.5 text-xs transition-colors hover:border-gray-400 ${
                  viewMode === "grid"
                    ? "border-green-500 bg-green-500 text-white"
                    : "bg-white hover:bg-gray-50"
                } rounded-l`}
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                title="Preview View"
                className={`border-b border-t border-gray-300 px-2 py-1.5 text-xs transition-colors hover:border-gray-400 ${
                  viewMode === "preview"
                    ? "border-green-500 bg-green-500 text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="List View"
                className={`border border-gray-300 px-2 py-1.5 text-xs transition-colors hover:border-gray-400 ${
                  viewMode === "list"
                    ? "border-green-500 bg-green-500 text-white"
                    : "bg-white hover:bg-gray-50"
                } rounded-r`}
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <svg
                className="pointer-events-none absolute left-2 z-10 h-3 w-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer appearance-none rounded border-0 bg-white py-1.5 pl-7 pr-6 text-xs transition-colors hover:border hover:border-gray-300 focus:border focus:border-blue-500 focus:outline-none"
              >
                <option value="date-desc">Sort ↓</option>
                <option value="date-asc">Sort ↑</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
              <svg
                className="pointer-events-none absolute right-2 z-10 h-3 w-3 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              className="flex items-center gap-1 rounded border-0 bg-white px-2 py-1.5 text-xs transition-colors hover:border hover:border-gray-300"
              onClick={() => {
                setSearchQuery("");
                setSortBy("date-desc");
              }}
            >
              <svg
                className="h-3 w-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset
            </button>

            {/* Items per page */}
            <div className="relative flex items-center">
              <svg
                className="pointer-events-none absolute left-2 z-10 h-3 w-3 text-gray-500"
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
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="cursor-pointer appearance-none rounded border-0 bg-white py-1.5 pl-7 pr-6 text-xs transition-colors hover:border hover:border-gray-300 focus:border focus:border-blue-500 focus:outline-none"
              >
                <option value={20}>20 per page</option>
                <option value={10}>10 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <svg
                className="pointer-events-none absolute right-2 z-10 h-3 w-3 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <section className="p-8">
          {documents.length > 0 ? (
            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
                  : viewMode === "list"
                    ? "grid-cols-1"
                    : "grid-cols-2 md:grid-cols-3"
              }`}
            >
              {documents.map((document: any) => (
                <div
                  key={document.id}
                  className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex h-16 items-center justify-center rounded bg-gray-50">
                    {document.mimeType?.startsWith("image/") ? (
                      <img
                        src={document.uploadthingUrl}
                        alt={document.name}
                        className="h-full w-full rounded object-cover"
                      />
                    ) : (
                      <div className="text-2xl">
                        {document.mimeType?.includes("pdf")
                          ? "📄"
                          : document.mimeType?.includes("doc")
                            ? "📝"
                            : document.mimeType?.includes("image")
                              ? "🖼️"
                              : document.mimeType?.includes("video")
                                ? "🎥"
                                : document.mimeType?.includes("audio")
                                  ? "🎵"
                                  : "📄"}
                      </div>
                    )}
                  </div>
                  <h4 className="truncate text-sm font-medium text-gray-900">
                    {document.name}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">
                    {(document.originalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 text-7xl">📁</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                No documents found
              </h3>
              <p className="text-gray-600">
                Upload your first document to get started
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
        className="hidden"
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportZip={handleImportZip}
        onImportFolder={handleImportFolder}
      />

      {/* Upload Files Modal */}
      <UploadFilesModal
        isOpen={showUploadFilesModal}
        onClose={() => setShowUploadFilesModal(false)}
        onUpload={handleUploadFiles}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
}
