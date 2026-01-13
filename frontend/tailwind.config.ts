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
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        // Premium gold accents
        gold: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        // Text colors
        text: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          muted: '#94A3B8',
        },
        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
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
        'gold': '0 0 20px rgba(245, 158, 11, 0.5)',
        'gold-lg': '0 10px 40px rgba(245, 158, 11, 0.3)',
        'premium': '0 20px 50px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(to right, #F59E0B, #FBBF24)',
        'gradient-gold-hover': 'linear-gradient(to right, #FBBF24, #FCD34D)',
      },
    },
  },
  plugins: [],
}
export default config
