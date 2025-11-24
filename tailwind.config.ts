import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
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
        medical: {
          blue: '#0066FF',
          'blue-light': '#4D94FF',
          'blue-dark': '#0052CC',
          'blue-50': '#E6F0FF',
          'blue-100': '#CCE0FF',
          'blue-200': '#99C2FF',
          'blue-300': '#66A3FF',
          'blue-400': '#3385FF',
          'blue-500': '#0066FF',
          'blue-600': '#0052CC',
          'blue-700': '#003D99',
          'blue-800': '#002966',
          'blue-900': '#001433',
        },
        airbnb: {
          red: '#FF385C',
          'red-dark': '#E31C5F',
          gray: '#717171',
          'gray-light': '#DDDDDD',
          light: '#F7F7F7',
          hover: '#F1F1F1',
          dark: '#222222',
        }
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      height: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      borderRadius: {
        'airbnb': '12px',
        'airbnb-lg': '16px',
        'airbnb-xl': '24px',
      },
      boxShadow: {
        'airbnb': '0 6px 16px rgba(0,0,0,0.12)',
        'airbnb-card': '0 2px 4px rgba(0,0,0,0.08)',
        'airbnb-hover': '0 6px 20px rgba(0,0,0,0.2)',
        'medical': '0 4px 12px rgba(0, 102, 255, 0.15)',
        'medical-lg': '0 8px 24px rgba(0, 102, 255, 0.2)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.5s ease-in-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      addUtilities({
        // Safe area utilities
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.pt-safe': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.pl-safe': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.pr-safe': {
          paddingRight: 'env(safe-area-inset-right)',
        },
        '.mb-safe': {
          marginBottom: 'env(safe-area-inset-bottom)',
        },
        '.mt-safe': {
          marginTop: 'env(safe-area-inset-top)',
        },
        '.safe-area-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.h-safe-top': {
          height: 'env(safe-area-inset-top)',
        },
        '.h-safe-bottom': {
          height: 'env(safe-area-inset-bottom)',
        },

        // Touch target utilities (44x44px minimum for iOS HIG)
        '.touch-target': {
          minWidth: '44px',
          minHeight: '44px',
        },
        '.touch-target-lg': {
          minWidth: '48px',
          minHeight: '48px',
        },

        // Native-style interactions
        '.active-scale': {
          transition: 'transform 0.1s ease-out',
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
        '.active-opacity': {
          transition: 'opacity 0.1s ease-out',
          '&:active': {
            opacity: '0.7',
          },
        },

        // Scrolling utilities
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.overscroll-bounce': {
          '-webkit-overflow-scrolling': 'touch',
          overscrollBehavior: 'contain',
        },

        // Touch and selection utilities
        '.tap-highlight-none': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.select-none-touch': {
          '-webkit-user-select': 'none',
          '-moz-user-select': 'none',
          'user-select': 'none',
          '-webkit-touch-callout': 'none',
        },

        // Native-style backdrop blur
        '.backdrop-blur-safe': {
          backdropFilter: 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
        },

        // Skeleton loading shimmer
        '.skeleton': {
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        },
      });
    },
    // Add shimmer animation
    function ({ addUtilities, theme }: any) {
      const shimmerKeyframes = {
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      };
      addUtilities(shimmerKeyframes);
    },
  ],
};

export default config;
