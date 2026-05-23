import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "var(--color-background-primary)",
          surface: "var(--color-background-surface)",
          muted: "var(--color-background-muted)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        border: {
          DEFAULT: "var(--color-border-default)",
          muted: "var(--color-border-muted)",
        },
        action: {
          primary: "var(--color-action-primary)",
          hover: "var(--color-action-primary-hover)",
        },
        "focus-ring": "var(--color-focus-ring)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        destructive: "var(--color-destructive)",
        info: "var(--color-info)",
        brand: {
          sand: "var(--color-brand-sand)",
          sage: "var(--color-brand-sage)",
          teal: "var(--color-brand-teal)",
          cyan: "var(--color-brand-cyan)",
          vibrant: "var(--color-brand-vibrant)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
