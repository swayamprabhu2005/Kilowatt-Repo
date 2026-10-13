import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm Ivory and Stone backgrounds
        surface: {
          DEFAULT: '#FAF8F6',
          muted: '#F4F0EB',
          subtle: '#EFEAE2',
          card: '#FFFFFF',
          border: '#E6E0D8',
          'border-strong': '#D5CCC0',
        },
        // Ink / Charcoal typography
        ink: {
          DEFAULT: '#181615',
          secondary: '#5E5955',
          muted: '#8A847E',
          subtle: '#B5AEA6',
        },
        // Terracotta & Ochre Accents (Strictly non-blue, non-green)
        terracotta: {
          50: '#FDF7F4',
          100: '#F9ECE5',
          200: '#F2D4C6',
          300: '#E7B5A0',
          400: '#DA8C6E',
          500: '#C85A32', // Primary
          600: '#B54D28', // Hover
          700: '#9E3F1D', // Active
          800: '#7F3318',
          900: '#54220F',
        },
        // Warm Alert Colors
        warning: {
          DEFAULT: '#D97706',
          subtle: '#FEF3C7',
          border: '#FDE68A',
        },
        danger: {
          DEFAULT: '#DC2626',
          subtle: '#FEE2E2',
          border: '#FECACA',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      boxShadow: {
        warm: '0 1px 3px rgba(24, 22, 21, 0.05), 0 1px 2px rgba(24, 22, 21, 0.03)',
        'warm-md': '0 4px 6px -1px rgba(24, 22, 21, 0.06), 0 2px 4px -1px rgba(24, 22, 21, 0.04)',
        'warm-lg': '0 10px 15px -3px rgba(24, 22, 21, 0.08), 0 4px 6px -2px rgba(24, 22, 21, 0.04)',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #FAF8F6 0%, #F5EFEB 50%, #ECE4D8 100%)',
        'terracotta-gradient': 'linear-gradient(135deg, #DA8C6E 0%, #C85A32 50%, #9E3F1D 100%)',
        'terracotta-subtle': 'linear-gradient(135deg, rgba(200, 90, 50, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
        'warm-card-glow': 'radial-gradient(ellipse at top, rgba(200, 90, 50, 0.06), transparent 70%)',
        'warm-radial': 'radial-gradient(circle at 50% 0%, rgba(200, 90, 50, 0.09) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
