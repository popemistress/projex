import Link from "next/link";
import { twMerge } from "tailwind-merge";

import LoadingSpinner from "./LoadingSpinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  href?: string;
  fullWidth?: boolean;
  openInNewTab?: boolean;
  iconOnly?: boolean;
}

const Button = ({
  children,
  size = "md",
  iconLeft,
  iconRight,
  isLoading,
  variant = "primary",
  href,
  fullWidth,
  openInNewTab,
  iconOnly,
  ...props
}: ButtonProps) => {
  const classes = twMerge(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    size === "xs" && "text-xs px-3 py-1.5",
    size === "sm" && "text-sm px-3 py-2",
    size === "lg" && "text-base px-5 py-3",
    fullWidth && "w-full",
    iconOnly && "p-0",
    iconOnly &&
      (size === "xs"
        ? "h-7 w-7"
        : size === "sm"
          ? "h-9 w-9"
          : size === "lg"
            ? "h-11 w-11"
            : "h-10 w-10"),
    variant === "primary" &&
      "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700",
    variant === "secondary" &&
      "border border-blue-600 bg-white text-blue-600 hover:bg-blue-50 active:bg-blue-100 dark:border-blue-500 dark:bg-dark-100 dark:text-blue-400 dark:hover:bg-dark-200",
    variant === "danger" &&
      "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700",
    variant === "ghost" &&
      "bg-transparent text-neutral-700 hover:bg-light-100 active:bg-light-200 dark:text-dark-900 dark:hover:bg-dark-200",
    props.disabled && "opacity-50 cursor-not-allowed",
  );

  const content = (
    <span className="relative flex items-center justify-center">
      {isLoading && (
        <span className="absolute">
          <LoadingSpinner size={size === "xs" ? "sm" : size} />
        </span>
      )}
      {iconOnly ? (
        <div
          className={twMerge(
            "flex items-center",
            isLoading ? "invisible" : "visible",
          )}
        >
          {iconLeft ?? iconRight}
        </div>
      ) : (
        <div
          className={twMerge(
            fullWidth
              ? "grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-2"
              : "flex items-center",
            isLoading ? "invisible" : "visible",
          )}
        >
          {fullWidth && !iconLeft && iconRight && (
            <span className="col-start-1 opacity-0">{iconRight}</span>
          )}
          {iconLeft && (
            <span
              className={twMerge(
                fullWidth ? "col-start-1 justify-self-start" : "mr-2",
              )}
            >
              {iconLeft}
            </span>
          )}
          <span
            className={twMerge(
              fullWidth ? "col-start-2 justify-self-center text-center" : "",
            )}
          >
            {children}
          </span>
          {iconRight && (
            <span
              className={twMerge(
                fullWidth ? "col-start-3 justify-self-end" : "ml-1",
              )}
            >
              {iconRight}
            </span>
          )}
          {fullWidth && !iconRight && iconLeft && (
            <span className="col-start-3 opacity-0">{iconLeft}</span>
          )}
        </div>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={isLoading ?? props.disabled}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
