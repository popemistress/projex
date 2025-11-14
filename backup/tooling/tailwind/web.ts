import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import scrollbar from "tailwind-scrollbar";

export default {
  content: ["./src/**/*.tsx"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans), Plus Jakarta Sans"],
      },
      fontSize: {
        sm: "0.8rem",
      },
      boxShadow: {
        "3xl-dark": "0px 16px 70px rgba(0, 0, 0, 0.5)",
        "3xl-light":
          "rgba(0, 0, 0, 0.12) 0px 4px 30px, rgba(0, 0, 0, 0.04) 0px 3px 17px, rgba(0, 0, 0, 0.04) 0px 2px 8px, rgba(0, 0, 0, 0.04) 0px 1px 1px",
      },
      animation: {
        "border-spin": "border-spin 4s linear infinite",
        "fade-down": "fade-down 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        scroll: "scroll 40s linear infinite",
      },

      keyframes: {
        "border-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "fade-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        scroll: {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(calc(-50% - 1.5rem))",
          },
        },
      },
      colors: {
        // NeuroFlow-inspired color scheme
        "dark-50": "#14141a",  // Main dark background
        "dark-100": "#1c1c23", // Card background
        "dark-200": "#1f1f23", // Secondary background
        "dark-300": "#282833", // Border/divider
        "dark-400": "#2e2e38",
        "dark-500": "#34343e",
        "dark-600": "#3e3e48",
        "dark-700": "#505058",
        "dark-800": "#707078",
        "dark-900": "#7e7e86",
        "dark-950": "#bbb",
        "dark-1000": "#fafafa", // Text color
        "light-50": "#ffffff",  // Pure white background
        "light-100": "#fafafa", // Slightly off-white
        "light-200": "#f5f5f7", // Light gray background
        "light-300": "#e4e4e7", // Border color
        "light-400": "#d4d4d8",
        "light-500": "#a1a1aa",
        "light-600": "#71717a", // Muted text
        "light-700": "#52525b",
        "light-800": "#3f3f46",
        "light-900": "#27272a",
        "light-950": "#18181b",
        "light-1000": "#1f1f23", // Dark text
        // Accent colors
        "coral": {
          DEFAULT: "#FF6D5A", // Primary coral/pink
          light: "#FF8A7A",
          dark: "#E85A48",
        },
      },
      screens: {
        "2xl": "1600px",
      },
    },
  },
  plugins: [forms, scrollbar],
} satisfies Config;
