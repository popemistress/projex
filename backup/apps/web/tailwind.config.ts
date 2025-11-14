import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import baseConfig from "@kan/tailwind-config/web";

export default {
  darkMode: "class",
  content: [...baseConfig.content],
  plugins: [require("@tailwindcss/typography")],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
      colors: {
        coral: {
          DEFAULT: 'hsl(6, 93%, 67%)',
          50: 'hsl(6, 93%, 97%)',
          100: 'hsl(6, 93%, 90%)',
          200: 'hsl(6, 93%, 80%)',
          300: 'hsl(6, 93%, 70%)',
          400: 'hsl(6, 93%, 67%)',
          500: 'hsl(6, 93%, 60%)',
          600: 'hsl(6, 93%, 50%)',
          700: 'hsl(6, 93%, 40%)',
          800: 'hsl(6, 93%, 30%)',
          900: 'hsl(6, 93%, 20%)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
    },
  },
} satisfies Config;
