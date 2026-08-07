/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark Mode (Linear) Tokens
        linear: {
          bg: '#05070B',
          surface: '#0B1220',
          card: '#111827',
          elevated: '#172033',
          border: 'rgba(255,255,255,0.06)',
          text: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
          blue: '#3B82F6',
          indigo: '#6366F1',
          cyan: '#38BDF8',
          green: '#22C55E',
          amber: '#F59E0B',
          red: '#EF4444',
        },
        // Light Mode (Stripe/Notion/Vercel) Tokens
        saas: {
          bg: '#F5F7FB',
          secondary: '#EEF2F7',
          card: '#FFFFFF',
          hover: '#FCFCFD',
          border: '#E5E7EB',
          text: '#111827',
          body: '#374151',
          secondaryText: '#4B5563',
          muted: '#6B7280',
          blue: '#3B82F6',
          indigo: '#6366F1',
          green: '#22C55E',
          amber: '#F59E0B',
          red: '#EF4444',
        }
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '22px',
      },
      boxShadow: {
        'card-light': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-light-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
