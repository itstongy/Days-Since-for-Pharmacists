/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    // toggled dynamically in src/main.ts for decision card tinting
    'border-emerald-300/70',
    'bg-emerald-50/70',
    'dark:border-emerald-500/40',
    'dark:bg-emerald-950/30',
    'border-amber-300/70',
    'bg-amber-50/70',
    'dark:border-amber-500/40',
    'dark:bg-amber-950/30',
    'border-rose-300/70',
    'bg-rose-50/70',
    'dark:border-rose-500/40',
    'dark:bg-rose-950/30',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 14px 40px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
};
