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
        "primary": "#133bec",
        "background-light": "#FFFFFF",
        "background-dark": "#101422",
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
        display: ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "2.5rem",
        "2xl": "1.5rem",
        "3xl": "3rem",
        "full": "9999px"
      },
      boxShadow: {
        "airy": "0 20px 40px -10px rgba(19, 59, 236, 0.1)",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "soft": "0 10px 30px -5px rgba(0, 0, 0, 0.03)",
      }
    },
  },
  plugins: [],
}