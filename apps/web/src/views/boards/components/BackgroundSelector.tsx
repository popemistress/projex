import { HiXMark, HiArrowPath } from "react-icons/hi2";
import { useState, useEffect } from "react";

interface BackgroundSelectorProps {
  selectedBackground: string;
  onSelectBackground: (url: string) => void;
  onClose: () => void;
}

// Function to validate if an image can be loaded
const validateImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    // Timeout after 1.25 seconds
    setTimeout(() => resolve(false), 1250);
  });
};

// Function to get random photo IDs and validate them in parallel
const getValidatedPhotoIds = async (count: number): Promise<string[]> => {
  // Generate more candidates than needed
  const candidates = new Set<number>();
  while (candidates.size < count * 2) {
    candidates.add(Math.floor(Math.random() * 1000) + 1);
  }
  
  // Create URLs from candidates
  const candidateUrls = Array.from(candidates).map(id => 
    `https://picsum.photos/id/${id}/400/200`
  );
  
  // Validate all candidates in parallel
  const validationPromises = candidateUrls.map(async (url) => {
    const isValid = await validateImage(url);
    return { url, isValid };
  });
  
  // Wait for all validations to complete
  const results = await Promise.all(validationPromises);
  
  // Filter valid URLs and take only what we need
  const validUrls = results
    .filter(result => result.isValid)
    .map(result => result.url)
    .slice(0, count);
  
  // If we couldn't get enough valid images, fill with fallbacks
  while (validUrls.length < count) {
    const fallbackId = 100 + validUrls.length * 100;
    validUrls.push(`https://picsum.photos/id/${fallbackId}/400/200`);
  }
  
  return validUrls;
};

// Gradient colors
const GRADIENT_COLORS = [
  { from: "rgb(219, 234, 254)", to: "rgb(219, 234, 254)" }, // Light blue
  { from: "rgb(59, 130, 246)", to: "rgb(37, 99, 235)" }, // Blue gradient
  { from: "rgb(29, 78, 216)", to: "rgb(30, 64, 175)" }, // Dark blue gradient
  { from: "rgb(88, 28, 135)", to: "rgb(109, 40, 217)" }, // Purple gradient
  { from: "rgb(168, 85, 247)", to: "rgb(192, 132, 252)" }, // Light purple gradient
  { from: "rgb(249, 115, 22)", to: "rgb(251, 146, 60)" }, // Orange gradient
];

export function BackgroundSelector({
  selectedBackground,
  onSelectBackground,
  onClose,
}: BackgroundSelectorProps) {
  // Generate and validate 20 random photo URLs on mount
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  
  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoadingImages(true);
      const validUrls = await getValidatedPhotoIds(20);
      setPhotoUrls(validUrls);
      setIsLoadingImages(false);
    };
    loadPhotos();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-dark-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-light-300 px-5 py-4 dark:border-dark-600">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-dark-1000">
            Board background
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-light-200 dark:hover:bg-dark-300"
          >
            <HiXMark className="h-5 w-5 text-neutral-600 dark:text-dark-900" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[600px] overflow-y-auto p-5">
          {/* Photos Section */}
          <div className="mb-6">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-dark-1000">
                Photos
              </h4>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-2">
              {isLoadingImages ? (
                // Loading spinner
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`loading-${index}`}
                    className="flex h-20 items-center justify-center rounded-lg bg-light-200 dark:bg-dark-300"
                  >
                    <HiArrowPath className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                ))
              ) : (
                photoUrls.map((imageUrl: string, index: number) => {
                return (
                  <button
                    key={`photo-${index}`}
                    type="button"
                    onClick={() => onSelectBackground(imageUrl)}
                    className={`relative h-20 overflow-hidden rounded-lg transition-all hover:ring-2 hover:ring-blue-500 ${
                      selectedBackground === imageUrl
                        ? "ring-2 ring-blue-600"
                        : ""
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt="Background option"
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })
              )}
            </div>
          </div>

          {/* Colors Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-dark-1000">
                Colors
              </h4>
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_COLORS.map((color, index) => {
                const gradientStyle = `linear-gradient(135deg, ${color.from}, ${color.to})`;
                const colorKey = `${color.from}-${color.to}`;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onSelectBackground(gradientStyle)}
                    className={`h-16 overflow-hidden rounded-lg transition-all hover:ring-2 hover:ring-blue-500 ${
                      selectedBackground === gradientStyle
                        ? "ring-2 ring-blue-600"
                        : ""
                    }`}
                    style={{ background: gradientStyle }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
