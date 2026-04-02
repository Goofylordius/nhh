import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      colors: {
        ink: {
          50: "#f6f5f1",
          100: "#ebe7db",
          200: "#d6ccb3",
          300: "#bfa77a",
          400: "#ad8f59",
          500: "#9a7a42",
          600: "#795e33",
          700: "#584424",
          800: "#362a16",
          900: "#181107",
        },
        mint: {
          50: "#eefcf8",
          100: "#d4f6ec",
          200: "#a9ebd8",
          300: "#73dbbe",
          400: "#40cba6",
          500: "#22b58e",
          600: "#19886b",
          700: "#115d49",
          800: "#093126",
          900: "#04150f",
        },
        clay: {
          50: "#fcf5f0",
          100: "#f8e6d8",
          200: "#f2ceb4",
          300: "#e8ab85",
          400: "#dc875b",
          500: "#cf6a3e",
          600: "#aa4f2a",
          700: "#79361b",
          800: "#4b2010",
          900: "#1f0c04",
        },
      },
      boxShadow: {
        card: "0 24px 80px -28px rgba(22, 28, 36, 0.25)",
      },
      backgroundImage: {
        "dashboard-glow":
          "radial-gradient(circle at top left, rgba(34,181,142,0.22), transparent 42%), radial-gradient(circle at right center, rgba(207,106,62,0.18), transparent 32%), linear-gradient(180deg, rgba(247,243,234,0.96), rgba(244,240,232,0.96))",
      },
    },
  },
  plugins: [],
};

export default config;

