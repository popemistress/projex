import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HiMoon, HiSun } from "react-icons/hi2";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="rounded-full p-2 transition-all hover:bg-light-200 dark:hover:bg-dark-200">
        <div className="h-5 w-5" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full p-2 transition-all hover:bg-light-200 dark:hover:bg-dark-200"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <HiSun className="h-5 w-5 text-yellow-500" />
      ) : (
        <HiMoon className="h-5 w-5 text-neutral-700" />
      )}
    </button>
  );
}
