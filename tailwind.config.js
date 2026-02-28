/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        "primary": "#1A56DB", // Updated to bright blue from reference
        "background-light": "#FAFAFA",
        "background-dark": "#121212",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E1E1E",
        "sage-light": "#E8F5E9",
        "sage-dark": "#2E3B32",
        "blue-light": "#E3F2FD",
        "blue-dark": "#1E2A38",
        "peach-light": "#FFF3E0",
        "peach-dark": "#3E2723",
        "lavender-light": "#F3E5F5",
        "lavender-dark": "#2A1B2E",
        "accent-lemon": "#FEF9C3",
        "accent-periwinkle": "#E0E7FF",
        "accent-seafoam": "#D1FAE5",
        "accent-mint": "#E0F2F1",
        "accent-mint-dark": "#B2DFDB",
        "input-bg": "#F3F4F6",
        "lavender-start": "#A5B4FC",
        "lavender-end": "#818CF8",
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "3rem",
        "full": "9999px"
      },
      boxShadow: {
        "airy": "0 20px 40px -10px rgba(19, 59, 236, 0.1)",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "soft": "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        "glow": "0 0 15px rgba(26, 86, 219, 0.3)",
      }
    },
  },
  plugins: [],
}
