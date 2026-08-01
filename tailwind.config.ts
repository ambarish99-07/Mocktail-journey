import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- The Blenders Club brand palette ---
        'tbc-black': {
          DEFAULT: '#0A0A0B', // primary background — matte black
          soft: '#0F0F11',
        },
        'tbc-charcoal': {
          DEFAULT: '#18191C', // secondary background
          light: '#222327', // card / surface
          border: '#2C2D32',
        },
        'tbc-emerald': {
          50: '#E6F5EE',
          100: '#C2E7D6',
          200: '#8FD1B3',
          300: '#5CBB90',
          400: '#2FA575',
          500: '#0E8F5D', // accent
          600: '#0B7A4E',
          700: '#0A6642',
          800: '#0C4F35',
          900: '#0A3D2A',
        },
        'tbc-gold': {
          50: '#FBF6E7',
          100: '#F3E4B4',
          200: '#EAD283',
          300: '#DFBE5C',
          400: '#D4AF37', // premium highlight
          500: '#C29A24',
          600: '#A17E1B',
          700: '#7C6115',
          800: '#584511',
          900: '#3A2E0C',
        },
        'tbc-cream': {
          DEFAULT: '#F4EDE0', // primary text on dark surfaces
          muted: '#C9C1B2',
          dim: '#8F897C',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 0 1px rgba(212,175,55,0.35), 0 8px 30px -8px rgba(212,175,55,0.25)',
        'emerald-glow': '0 0 0 1px rgba(14,143,93,0.4), 0 8px 30px -8px rgba(14,143,93,0.35)',
        premium: '0 20px 60px -20px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F3E4B4 0%, #D4AF37 45%, #A17E1B 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #2FA575 0%, #0E8F5D 55%, #0A3D2A 100%)',
        'noise-overlay':
          "radial-gradient(circle at 20% 20%, rgba(212,175,55,0.06), transparent 40%), radial-gradient(circle at 80% 60%, rgba(14,143,93,0.08), transparent 45%)",
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
