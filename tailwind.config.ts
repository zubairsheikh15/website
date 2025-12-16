import type { Config } from 'tailwindcss';

const config: Config = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-inter)', 'sans-serif'],
			},
			colors: {
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				'primary-hover': '#E86A20',

				// Base grays and neutrals
				grayBG: '#f7f8fa',
				'dark-gray': '#1a202c',
				gray: '#718096',
				'light-gray': '#a0aec0',
				'lighter-gray': '#edf2f7',

				// Common palette
				red: '#e53e3e',
				white: '#ffffff',

				// Theme category palettes
				'theme-green': '#e0f4ea',
				'theme-green-fg': '#34d399',
				'theme-blue': '#e6f0ff',
				'theme-blue-fg': '#60a5fa',
				'theme-red': '#ffe5e5',
				'theme-red-fg': '#f87171',
				'theme-gold': '#fff9e6',
				'theme-gold-fg': '#fbbf24',

				// Background gradients for categories
				'theme-green-bg': '#f0fdf4',
				'theme-blue-bg': '#f0f9ff',
				'theme-red-bg': '#fff1f2',
				'theme-gold-bg': '#fefce8',

				// System-level
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',

				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},

				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',

				chart: {
					1: 'hsl(var(--chart-1))',
					2: 'hsl(var(--chart-2))',
					3: 'hsl(var(--chart-3))',
					4: 'hsl(var(--chart-4))',
					5: 'hsl(var(--chart-5))',
				},
			},

			boxShadow: {
				subtle: '0 4px 12px rgba(0, 0, 0, 0.05)',
				medium: '0 10px 20px rgba(0, 0, 0, 0.07)',
				lifted: '0 20px 40px rgba(0, 0, 0, 0.1)',
			},

			transitionTimingFunction: {
				'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'smoother': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			},

			animation: {
				'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
				'spin-slow': 'spin 3s linear infinite',
			},

			keyframes: {
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translate3d(0, 10px, 0)' },
					'100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
				},
				spin: {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
			},

			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};

export default config;
