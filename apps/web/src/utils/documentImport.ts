import JSZip from "jszip";

export interface ImportedFile {
  name: string;
  originalName: string;
  mimeType: string;
  content: string; // Base64 encoded
  size: number;
  path?: string;
}

// Supported file types for document import
const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/json",
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
];

// Get MIME type from file extension
function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();

  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    md: "text/markdown",
    csv: "text/csv",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    json: "application/json",
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "application/javascript",
    ts: "text/plain",
    tsx: "text/plain",
    jsx: "text/plain",
  };

  return mimeMap[ext ?? ""] ?? "application/octet-stream";
}

// Check if file type is supported
function isSupportedFileType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.includes(mimeType);
}

// Process a single file
export async function processFile(file: File): Promise<ImportedFile | null> {
  const mimeType = file.type || getMimeTypeFromExtension(file.name);

  if (!isSupportedFileType(mimeType)) {
    console.warn(`Unsupported file type: ${mimeType} for file: ${file.name}`);
    return null;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64Content = btoa(String.fromCharCode(...uint8Array));

        resolve({
          name: file.name,
          originalName: file.name,
          mimeType,
          content: base64Content,
          size: file.size,
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Unknown error"));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

// Process ZIP file
export async function processZipFile(file: File): Promise<ImportedFile[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);

        // Use a simple ZIP parser (you might want to use a proper ZIP library like JSZip)
        const files = await extractFilesFromZip(uint8Array);

        const processedFiles: ImportedFile[] = [];

        for (const zipEntry of files) {
          const mimeType = getMimeTypeFromExtension(zipEntry.name);

          if (isSupportedFileType(mimeType)) {
            const base64Content = btoa(
              String.fromCharCode(...zipEntry.content),
            );

            processedFiles.push({
              name: zipEntry.name.split("/").pop() ?? zipEntry.name,
              originalName: zipEntry.name,
              mimeType,
              content: base64Content,
              size: zipEntry.content.length,
              path: zipEntry.name,
            });
          }
        }

        resolve(processedFiles);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Unknown error"));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

// ZIP file extraction using JSZip
interface ZipEntry {
  name: string;
  content: Uint8Array;
}

async function extractFilesFromZip(zipData: Uint8Array): Promise<ZipEntry[]> {
  const files: ZipEntry[] = [];

  try {
    const zip = await JSZip.loadAsync(zipData);

    // Extract all files from the ZIP
    for (const [relativePath, zipObject] of Object.entries(zip.files)) {
      // Skip directories
      if (zipObject.dir) continue;

      // Skip hidden files and system files
      if (relativePath.startsWith(".") || relativePath.includes("__MACOSX"))
        continue;

      try {
        const content = await zipObject.async("uint8array");
        files.push({
          name: relativePath,
          content,
        });
      } catch (fileError) {
        console.warn(`Failed to extract file ${relativePath}:`, fileError);
      }
    }
  } catch (error) {
    console.warn("Failed to extract ZIP file:", error);
    throw new Error(
      `Invalid ZIP file: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  return files;
}

// Process folder upload (multiple files)
export async function processFolder(files: FileList): Promise<ImportedFile[]> {
  const processedFiles: ImportedFile[] = [];

  for (const file of files) {
    const processedFile = await processFile(file);
    if (processedFile) {
      processedFiles.push(processedFile);
    }
  }

  return processedFiles;
}

// Validate import data
export function validateImportData(files: ImportedFile[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (files.length === 0) {
    errors.push("No valid files found to import");
  }

  // Check for duplicate file names
  const fileNames = files.map((f) => f.name);
  const duplicates = fileNames.filter(
    (name, index) => fileNames.indexOf(name) !== index,
  );
  if (duplicates.length > 0) {
    errors.push(`Duplicate file names found: ${duplicates.join(", ")}`);
  }

  // Check file sizes (limit to 10MB per file)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const oversizedFiles = files.filter((f) => f.size > MAX_FILE_SIZE);
  if (oversizedFiles.length > 0) {
    errors.push(
      `Files exceed size limit (10MB): ${oversizedFiles.map((f) => f.name).join(", ")}`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
