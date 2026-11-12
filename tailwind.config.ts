import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0F1110',
          50: '#2A2D2B',
          100: '#222524',
          800: '#151716',
          900: '#0F1110',
          950: '#080908',
        },
        emerald: {
          DEFAULT: '#0D281E',
          deep: '#0D281E',
          dark: '#081A13',
          light: '#14543C',
          accent: '#1D7252',
        },
        gold: {
          DEFAULT: '#C59B47',
          light: '#DFBA6B',
          dark: '#A37D32',
          pale: '#F4E8D1',
        },
        crimson: {
          DEFAULT: '#B8292F',
          hover: '#961D22',
          dark: '#7D161B',
        },
        alabaster: {
          DEFAULT: '#F9F8F4',
          dark: '#F0EFEA',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #DFBA6B 0%, #C59B47 50%, #9D772A 100%)',
        'emerald-dark-gradient': 'linear-gradient(180deg, #0F1110 0%, #0D281E 60%, #081A13 100%)',
        'card-dark-gradient': 'linear-gradient(145deg, rgba(20, 84, 60, 0.15) 0%, rgba(15, 17, 16, 0.8) 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(197, 155, 71, 0.25)',
        'emerald-glow': '0 0 30px rgba(13, 40, 30, 0.5)',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
      },
      animation: {
        'pulse-gold': 'pulseGold 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config

