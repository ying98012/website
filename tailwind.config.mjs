/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          bg: "#131313",
          surface: "#20201f",
          card: "#2a2a2a",
          text: "#e5e2e1",
          muted: "#c4c7c7",
          outline: "#444748",
          neonBlue: "#00d2fd",
          neonPurple: "#edb1ff",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.35)",
        "neon-blue": "0 0 18px rgba(0, 210, 253, 0.45)",
        "neon-purple": "0 0 18px rgba(237, 177, 255, 0.35)",
      },
      maxWidth: {
        container: "1280px",
      },
      spacing: {
        section: "7.5rem",
        stack: "1.5rem",
      },
      backgroundImage: {
        "vibrant-accent":
          "linear-gradient(135deg, rgba(0,210,253,0.22), rgba(237,177,255,0.18))",
      },
    },
  },
  plugins: [],
};
