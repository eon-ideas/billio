/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',    // Blue
        secondary: '#6B7280',  // Gray
        danger: '#EF4444',     // Red
        success: '#10B981',    // Green
        warning: '#F59E0B',    // Amber
        dark: '#1F2937',       // Dark gray
        stroke: '#E2E8F0',     // Light gray for borders
        strokedark: '#374151', // Dark gray for borders in dark mode
      },
    },
  },
  plugins: [require("tailgrids/plugin")],
}