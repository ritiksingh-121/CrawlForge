/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#171717',
        body: '#4d4d4d',
        mute: '#888888',
        hairline: '#ebebeb',
        'hairline-strong': '#a1a1a1',
        canvas: '#ffffff',
        'canvas-soft': '#fafafa',
        'canvas-soft-2': '#f5f5f5',
        link: '#0070f3',
        'link-deep': '#0761d1',
        'link-bg-soft': '#d3e5ff',
        success: '#0070f3',
        error: '#ee0000',
        'error-soft': '#f7d4d6',
        warning: '#f5a623',
        violet: '#7928ca',
        cyan: '#50e3c2',
        'highlight-pink': '#ff0080',
        glass: 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.18)',
        'glass-dark': 'rgba(0, 0, 0, 0.1)',
        dark: {
          bg: '#0a0a0f',
          surface: '#13131a',
          card: '#1a1a25',
          border: '#2a2a3a',
          text: '#e4e4e7',
          'text-muted': '#7f7f8f',
          accent: '#6366f1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'display-xl': ['48px', { lineHeight: '48px', fontWeight: '600', letterSpacing: '-2.4px' }],
        'display-lg': ['32px', { lineHeight: '40px', fontWeight: '600', letterSpacing: '-1.28px' }],
        'display-md': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.96px' }],
        'display-sm': ['20px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '-0.6px' }],
      },
      borderRadius: {
        pill: '100px',
        'pill-sm': '64px',
      },
      boxShadow: {
        'card': '0px 1px 1px rgba(0,0,0,0.03), 0px 2px 2px rgba(0,0,0,0.05)',
        'card-lg': '0px 2px 2px rgba(0,0,0,0.04), 0px 8px 16px -4px rgba(0,0,0,0.06)',
        'card-xl': '0px 1px 1px rgba(0,0,0,0.03), 0px 8px 16px -4px rgba(0,0,0,0.06), 0px 24px 32px -8px rgba(0,0,0,0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.1)' },
          '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)' },
        },
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
}
