import Link from "next/link";
import { useState } from "react";
import { HiCheckCircle, HiXMark } from "react-icons/hi2";

import { authClient } from "@kan/auth/client";

export function RightSidebar() {
  const { data: session } = authClient.useSession();
  const [isProfileVisible, setIsProfileVisible] = useState(true);

  // Profile completion checklist items
  const profileItems = [
    { id: "account", label: "Setup Account", completed: true },
    { id: "photo", label: "Upload Your Photo", completed: false },
    { id: "notifications", label: "Enable Desktop Notifications", completed: false },
    { id: "team", label: "Invite Team Members", completed: true },
    { id: "profile", label: "Complete Profile", completed: false },
    { id: "mobile", label: "Install Our Mobile App", completed: false },
  ];

  const completedCount = profileItems.filter((item) => item.completed).length;
  const totalCount = profileItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  if (!isProfileVisible) {
    return null;
  }

  return (
    <div className="w-80 space-y-6">
      {/* Complete Your Profile Section */}
      <div className="rounded-lg border border-light-300 bg-white p-6 shadow-sm dark:border-dark-400 dark:bg-dark-100">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-dark-1000">
            Complete Your Profile
          </h3>
          <button
            onClick={() => setIsProfileVisible(false)}
            className="text-neutral-400 hover:text-neutral-600 dark:text-dark-700 dark:hover:text-dark-900"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Checklist */}
        <div className="mb-4 space-y-3">
          {profileItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              {item.completed ? (
                <HiCheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
              ) : (
                <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-neutral-300 dark:border-dark-600" />
              )}
              <span
                className={`text-sm ${
                  item.completed
                    ? "text-neutral-500 line-through dark:text-dark-700"
                    : "text-neutral-700 dark:text-dark-900"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-dark-300">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500 dark:text-dark-700">
            {completedCount} of {totalCount} completed
          </p>
        </div>
      </div>

      {/* Templates Section */}
      <div className="rounded-lg border border-light-300 bg-white p-6 shadow-sm dark:border-dark-400 dark:bg-dark-100">
        {/* Template Preview Image */}
        <div className="mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-4">
          <div className="space-y-2">
            {/* Mock template preview */}
            <div className="flex gap-2">
              <div className="h-16 w-1/3 rounded bg-white/20 p-2">
                <div className="mb-1 h-2 w-3/4 rounded bg-white/40" />
                <div className="h-1 w-full rounded bg-white/30" />
                <div className="mt-1 h-1 w-2/3 rounded bg-white/30" />
              </div>
              <div className="h-16 w-1/3 rounded bg-white/20 p-2">
                <div className="mb-1 h-2 w-3/4 rounded bg-white/40" />
                <div className="h-1 w-full rounded bg-white/30" />
                <div className="mt-1 h-1 w-2/3 rounded bg-white/30" />
              </div>
              <div className="h-16 w-1/3 rounded bg-white/20 p-2">
                <div className="mb-1 h-2 w-3/4 rounded bg-white/40" />
                <div className="h-1 w-full rounded bg-white/30" />
                <div className="mt-1 h-1 w-2/3 rounded bg-white/30" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-12 w-1/4 rounded bg-green-400/60" />
              <div className="h-12 w-1/4 rounded bg-blue-400/60" />
              <div className="h-12 w-1/4 rounded bg-yellow-400/60" />
              <div className="h-12 w-1/4 rounded bg-red-400/60" />
            </div>
          </div>
        </div>

        {/* Template Text */}
        <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-dark-1000">
          Boost your workflow in minutes with ready-made templates
        </h3>

        {/* Explore Templates Button */}
        <Link href="/templates">
          <button className="w-full rounded-md border border-light-400 bg-light-50 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-light-100 dark:border-dark-600 dark:bg-dark-200 dark:text-dark-1000 dark:hover:bg-dark-300">
            Explore templates
          </button>
        </Link>
      </div>
    </div>
  );
}
