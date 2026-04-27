/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "InterVariable",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      colors: {
        /* JaiVeeru navy — primary accent */
        brand: {
          50: "#eef0fa",
          100: "#d9dcee",
          200: "#b3b9dd",
          300: "#8c94cc",
          500: "#3b46a0",
          600: "#1e2875",
          700: "#171e5a",
          800: "#101540",
          900: "#0a0d29",
          DEFAULT: "#1e2875",
        },
        /* JaiVeeru tricolor accents (used as category indicators) */
        mustard: "#f5c518",
        vermilion: "#e63946",
        fresh: "#3db04c",
      },
      boxShadow: {
        card: "0 1px 0 rgba(15, 23, 42, 0.04), 0 4px 16px -8px rgba(15, 23, 42, 0.08)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(3px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
