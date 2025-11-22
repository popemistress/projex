import Image from "next/image";
import { useState } from "react";

import { generateUID } from "@kan/shared/utils";

import Button from "~/components/Button";
import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";
import { getAvatarUrl } from "~/utils/helpers";

interface AvatarProps {
  userId?: string;
  userImage?: string | null;
  userName?: string | null;
}

export default function Avatar({ userId, userImage, userName }: AvatarProps) {
  const utils = api.useUtils();
  const { showPopup } = usePopup();
  const [uploading, setUploading] = useState(false);

  const updateUser = api.user.update.useMutation({
    onSuccess: async () => {
      showPopup({
        header: "Profile image updated",
        message: "Your profile image has been updated.",
        icon: "success",
      });
      try {
        await utils.user.getUser.refetch();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    onError: () => {
      showPopup({
        header: "Error updating profile image",
        message: "Please try again later, or contact customer support.",
        icon: "error",
      });
    },
  });

  const avatarUrl = userImage ? getAvatarUrl(userImage) : undefined;

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0] ?? null;
    if (!file || !userId) {
      return showPopup({
        header: "Error uploading profile image",
        message: "Please select a file to upload.",
        icon: "error",
      });
    }

    setUploading(true);
    try {
      // Create form data for upload
      const formData = new FormData();
      const filename = `${generateUID()}.${file.name.split(".").pop()}`;
      formData.append("file", file, filename);

      // Upload to your file service or S3
      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url } = (await response.json()) as { url: string };

      // Update user with new image URL
      await updateUser.mutateAsync({
        image: url,
      });
    } catch (error) {
      console.error("Upload error:", error);
      showPopup({
        header: "Error uploading profile image",
        message: "Please try again later.",
        icon: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-light-200 dark:bg-dark-200">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={userName ?? "User avatar"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-light-700 dark:text-dark-700">
            {userName?.charAt(0).toUpperCase() ?? "?"}
          </div>
        )}
      </div>
      <div>
        <label htmlFor="avatar-upload">
          <Button as="span" variant="secondary" size="sm" disabled={uploading}>
            {uploading ? "Uploading..." : "Change Avatar"}
          </Button>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
