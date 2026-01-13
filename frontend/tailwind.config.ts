import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium midnight blue palette
        midnight: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
          lighter: '#334155',
          dark: '#020617',
        },
        // Premium gold accents
        gold: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FCD34D',
          hover: '#D97706',
        },
        // Cream/light backgrounds
        cream: '#FFFBEB',
        // Legacy colors (keep for backward compatibility)
        primary: {
          DEFAULT: '#3b82f6',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      boxShadow: {
        'gold': '0 0 20px rgba(245, 158, 11, 0.3)',
        'gold-lg': '0 10px 40px rgba(245, 158, 11, 0.2)',
        'premium': '0 20px 50px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(to right, #F59E0B, #FBBF24)',
        'gradient-gold-hover': 'linear-gradient(to right, #FBBF24, #FCD34D)',
        'gradient-midnight': 'linear-gradient(to bottom right, #0F172A, #1E293B)',
      },
    },
  },
  plugins: [],
}
export default config
