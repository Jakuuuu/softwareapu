/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2463eb",
          "dark": "#1d4ed8",
          // Legacy support (optional)
          50: '#eff6ff',
          500: '#2463eb', // Matched to default
          700: '#1d4ed8',
        },
        secondary: "#64748b",
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b",
        "warning-bg": "#fffbeb",
        "warning-border": "#fcd34d",
        "warning-text": "#92400e",
        // Legacy
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Stitch uses Inter too
        display: ["Inter", "sans-serif"],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        nav: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        footer: "0 -4px 6px -1px rgba(0, 0, 0, 0.05), 0 -2px 4px -1px rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [],
}
