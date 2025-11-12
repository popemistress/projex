import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { HiArrowPath, HiXMark, HiEllipsisHorizontal } from "react-icons/hi2";

import type { Template } from "./TemplateBoards";
import Button from "~/components/Button";
import Input from "~/components/Input";
import Toggle from "~/components/Toggle";
import { useModal } from "~/providers/modal";
import { usePopup } from "~/providers/popup";
import { useWorkspace } from "~/providers/workspace";
import { api } from "~/utils/api";
import TemplateBoards from "./TemplateBoards";
import { BackgroundSelector } from "./BackgroundSelector";

const schema = z.object({
  name: z
    .string()
    .min(1, { message: "Board name is required" })
    .max(100, { message: "Board name cannot exceed 100 characters" }),
  workspacePublicId: z.string(),
  template: z.custom<Template | null>(),
  coverImage: z.string().optional(),
});

interface NewBoardInputWithTemplate {
  name: string;
  workspacePublicId: string;
  template: Template | null;
  coverImage?: string;
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

export function NewBoardForm({ isTemplate }: { isTemplate?: boolean }) {
  const utils = api.useUtils();
  const { closeModal } = useModal();
  const router = useRouter();
  const { showPopup } = usePopup();
  const { workspace } = useWorkspace();
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [backgroundOptions, setBackgroundOptions] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  
  const [selectedBackground, setSelectedBackground] = useState<string>(
    `https://picsum.photos/id/100/800/400`
  );
  
  const { data: templates } = api.board.all.useQuery(
    { workspacePublicId: workspace.publicId ?? "", type: "template" },
    { enabled: !!workspace.publicId },
  );

  const formattedTemplates = templates?.map((template) => ({
    id: template.publicId,
    sourceBoardPublicId: template.publicId,
    name: template.name,
    lists: template.lists.map((list) => list.name),
    labels: template.labels.map((label) => label.name),
  }));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewBoardInputWithTemplate>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      workspacePublicId: workspace.publicId || "",
      template: null,
      coverImage: backgroundOptions[0] || `https://picsum.photos/id/100/800/400`,
    },
  });

  const currentTemplate = watch("template");

  const refetchBoards = () => utils.board.all.refetch();

  const createBoard = api.board.create.useMutation({
    onSuccess: async (board) => {
      if (!board) {
        showPopup({
          header: "Error",
          message: "Failed to create board",
          icon: "error",
        });
      } else {
        router.push(
          `${isTemplate ? "/templates" : "/boards"}/${board.publicId}`,
        );
      }
      closeModal();

      await refetchBoards();
    },
    onError: () => {
      showPopup({
        header: "Error",
        message: "Failed to create board",
        icon: "error",
      });
    },
  });

  const onSubmit = (data: NewBoardInputWithTemplate) => {
    createBoard.mutate({
      name: data.name,
      workspacePublicId: data.workspacePublicId,
      sourceBoardPublicId: data.template?.sourceBoardPublicId ?? undefined,
      lists: data.template?.lists ?? [],
      labels: data.template?.labels ?? [],
      type: isTemplate ? "template" : "regular",
      coverImage: selectedBackground,
    });
  };

  // Load and validate background options on mount
  useEffect(() => {
    const loadBackgrounds = async () => {
      setIsLoadingImages(true);
      const validUrls = await getValidatedPhotoIds(4);
      setBackgroundOptions(validUrls);
      if (validUrls[0]) {
        setSelectedBackground(validUrls[0]);
        setValue("coverImage", validUrls[0]);
      }
      setIsLoadingImages(false);
    };
    loadBackgrounds();
  }, [setValue]);

  useEffect(() => {
    const titleElement: HTMLElement | null =
      document.querySelector<HTMLElement>("#name");
    if (titleElement) titleElement.focus();
  }, []);

  const gradientOptions = [
    "linear-gradient(135deg, rgb(219, 234, 254), rgb(219, 234, 254))",
    "linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))",
    "linear-gradient(135deg, rgb(29, 78, 216), rgb(30, 64, 175))",
    "linear-gradient(135deg, rgb(88, 28, 135), rgb(109, 40, 217))",
    "linear-gradient(135deg, rgb(168, 85, 247), rgb(192, 132, 252))",
  ];

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="px-5 pt-5">
          <div className="text-neutral-9000 flex w-full items-center justify-between pb-4 dark:text-dark-1000">
            <h2 className="text-sm font-bold">Create board</h2>
            <button
              type="button"
              className="hover:bg-light-300 rounded p-1 focus:outline-none dark:hover:bg-dark-300"
              onClick={(e) => {
                e.preventDefault();
                closeModal();
              }}
            >
              <HiXMark size={18} className="dark:text-dark-9000 text-light-900" />
            </button>
          </div>

          {/* Background Preview */}
          <div className="mb-4 relative h-32 w-full overflow-hidden rounded-lg">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                background: selectedBackground.startsWith("linear-gradient")
                  ? selectedBackground
                  : `url(${selectedBackground})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>

          {/* Background Options */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-dark-900">
              Background
            </label>
            <div className="grid grid-cols-5 gap-2">
              {/* Loading State */}
              {isLoadingImages ? (
                <>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`loading-${index}`}
                      className="flex h-12 items-center justify-center rounded-md bg-light-200 dark:bg-dark-300"
                    >
                      <HiArrowPath className="h-5 w-5 animate-spin text-neutral-400" />
                    </div>
                  ))}
                </>
              ) : (
                <>
              {/* Photo Thumbnails */}
              {backgroundOptions.map((bg, index) => (
                <button
                  key={`photo-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedBackground(bg);
                    setValue("coverImage", bg);
                  }}
                  className={`h-12 overflow-hidden rounded-md transition-all hover:ring-2 hover:ring-blue-500 ${
                    selectedBackground === bg ? "ring-2 ring-blue-600" : "ring-1 ring-light-300 dark:ring-dark-600"
                  }`}
                >
                  <img src={bg} alt="Background" className="h-full w-full object-cover" />
                </button>
              ))}

              {/* Gradient Thumbnails */}
              {gradientOptions.map((gradient, index) => (
                <button
                  key={`gradient-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedBackground(gradient);
                    setValue("coverImage", gradient);
                  }}
                  className={`h-12 overflow-hidden rounded-md transition-all hover:ring-2 hover:ring-blue-500 ${
                    selectedBackground === gradient ? "ring-2 ring-blue-600" : "ring-1 ring-light-300 dark:ring-dark-600"
                  }`}
                  style={{ background: gradient }}
                />
              ))}

              {/* More Options Button */}
              <button
                type="button"
                onClick={() => setShowBackgroundSelector(true)}
                className="flex h-12 items-center justify-center rounded-md border-2 border-dashed border-light-300 hover:border-light-400 dark:border-dark-600 dark:hover:border-dark-500"
              >
                <HiEllipsisHorizontal className="h-5 w-5 text-neutral-400" />
              </button>
              </>
              )}
            </div>
          </div>

          {/* Board Title */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-dark-900">
              Board title <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              placeholder=""
              {...register("name", { required: true })}
              errorMessage={errors.name?.message}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  await handleSubmit(onSubmit)();
                }
              }}
            />
          </div>

          {/* Visibility */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold text-neutral-700 dark:text-dark-900">
              Visibility
            </label>
            <select
              className="w-full rounded-md border border-light-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-600 dark:bg-dark-200 dark:text-dark-1000"
              defaultValue="workspace"
            >
              <option value="private">Private</option>
              <option value="workspace">Workspace</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>
      <TemplateBoards
        currentBoard={currentTemplate}
        setCurrentBoard={(t) => setValue("template", t)}
        showTemplates={showTemplates}
        customTemplates={formattedTemplates ?? []}
      />
      <div className="mt-12 flex items-center justify-end border-t border-light-600 px-5 pb-5 pt-5 dark:border-dark-600">
        {!isTemplate && (
          <Toggle
            label={"Use template"}
            isChecked={showTemplates}
            onChange={() => {
              setShowTemplates(!showTemplates);
              if (!showTemplates && !currentTemplate) {
                setValue("template", (templates?.[0] as any) ?? null);
              }
            }}
          />
        )}
        <div>
          <Button type="submit" isLoading={createBoard.isPending}>
            Create {isTemplate ? "template" : "board"}
          </Button>
        </div>
      </div>
    </form>

    {/* Background Selector Modal */}
    {showBackgroundSelector && (
      <BackgroundSelector
        selectedBackground={selectedBackground}
        onSelectBackground={(bg) => {
          setSelectedBackground(bg);
          setValue("coverImage", bg);
          setShowBackgroundSelector(false);
        }}
        onClose={() => setShowBackgroundSelector(false)}
      />
    )}
  </>
  );
}
