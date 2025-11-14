import { useState, useRef, useEffect } from "react";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useWorkspace } from "~/providers/workspace";

interface SearchResult {
  id: string;
  type: "board" | "card" | "workspace";
  title: string;
  description?: string;
  boardSlug?: string;
  workspaceSlug?: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { workspace } = useWorkspace();

  const { data: searchResults, isLoading } = api.search.global.useQuery(
    { query, workspaceId: workspace?.publicId || "" },
    { enabled: query.length > 0 }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to focus search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to close
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "board") {
      router.push(`/${result.workspaceSlug}/${result.boardSlug}`);
    } else if (result.type === "card") {
      router.push(`/cards/${result.id}`);
    } else if (result.type === "workspace") {
      router.push(`/${result.workspaceSlug}`);
    }
    setQuery("");
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div
        className={`relative flex items-center rounded-lg border transition-all ${
          isFocused
            ? "border-neutral-400 ring-2 ring-neutral-200 dark:border-neutral-600 dark:ring-neutral-700"
            : "border-neutral-300 dark:border-neutral-700"
        } bg-white dark:bg-dark-200 overflow-hidden`}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length > 0);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (query.length > 0) setIsOpen(true);
          }}
          placeholder="Search"
          className="w-full bg-transparent px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none dark:text-dark-1000 dark:placeholder-neutral-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="mr-2 rounded p-1 hover:bg-neutral-100 dark:hover:bg-dark-300"
          >
            <HiXMark className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </button>
        )}
        <button
          className="flex items-center justify-center bg-blue-600 px-4 py-2.5 transition-colors hover:bg-blue-700"
          onClick={() => inputRef.current?.focus()}
        >
          <HiMagnifyingGlass className={`h-5 w-5 text-white ${isLoading ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-dark-200">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Searching...
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result: SearchResult) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-dark-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-900 dark:text-dark-1000">
                        {result.title}
                      </span>
                      <span className="rounded bg-coral/10 px-2 py-0.5 text-xs font-medium text-coral">
                        {result.type}
                      </span>
                    </div>
                    {result.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-neutral-600 dark:text-neutral-400">
                        {result.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
