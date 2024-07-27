import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        background: {
          DEFAULT: 'hsl(var(--background))',
          normal: {
            normal: 'var(--background-normal-normal)',
            alternative: 'var(--background-normal-alternative)',
          },
          elevated: {
            normal: 'var(--background-elevated-normal)',
            alternative: 'var(--background-elevated-alternative)',
          },
        },
        label: {
          normal: 'var(--label-normal)',
          strong: 'var(--label-strong)',
          neutral: 'var(--label-neutral)',
          alternative: 'var(--label-alternative)',
          assistive: 'var(--label-assistive)',
          disable: 'var(--label-disable)',
        },
        interaction: {
          inactive: 'var(--interaction-inactive)',
          disable: 'var(--interaction-disable)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          normal: 'var(--primary-normal)',
          strong: 'var(--primary-strong)',
          heavy: 'var(--primary-heavy)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          lime: 'var(--accent-lime)',
          cyan: 'var(--accent-cyan)',
          light_blue: 'var(--accent-light_blue)',
          pink: 'var(--accent-pink)',
          skin1: 'var(--accent-skin1)',
          skin2: 'var(--accent-skin2)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        line: {
          normal: 'var(--line-normal)',
          neutral: 'var(--line-neutral)',
          alternative: 'var(--line-alternative)',
        },
        status: {
          positive: 'var(--status-positive)',
          cautionary: 'var(--status-cautionary)',
          destructive: 'var(--status-destructive)',
        },
        inverse: {
          primary: 'var(--inverse-primary)',
          background: 'var(--inverse-background)',
          label: 'var(--inverse-label)',
        },
        static: {
          white: 'var(--static-white)',
          black: 'var(--static-black)',
        },
        fill: {
          normal: 'var(--fill-normal)',
          strong: 'var(--fill-strong)',
          alternative: 'var(--fill-alternative)',
        },
        material: {
          dimmer: 'var(--material-dimmer)',
        },
        neutral: {
          5: '#0f0f0f',
          10: '#171717',
          15: '#1c1c1c',
          20: '#2a2a2a',
          22: '#303030',
          30: '#474747',
          40: '#5c5c5c',
          50: '#737373',
          60: '#8a8a8a',
          70: '#9b9b9b',
          80: '#b0b0b0',
          90: '#c4c4c4',
          95: '#dcdcdc',
          99: '#f7f7f7',
        },
        cool: {
          neutral: {
            5: '#0f0f10',
            7: '#141415',
            10: '#171719',
            15: '#1b1c1e',
            17: '#212225',
            20: '#292a2d',
            22: '#2e2f33',
            23: '#333438',
            25: '#37383c',
            30: '#46474c',
            40: '#5a5c63',
            50: '#70737c',
            60: '#878a93',
            70: '#989ba2',
            80: '#aeb0b6',
            90: '#c2c4c8',
            95: '#dbdcdf',
            96: '#e1e2e4',
            97: '#eaebec',
            98: '#f4f4f5',
            99: '#f7f7f8',
          },
        },
        cyan: {
          50: '#dff4f5',
          100: '#ade4e5',
          200: '#72d4d5',
          300: '#13c2c2',
          400: '#00b4b2',
          500: '#00a5a1',
          600: '#009792',
          700: '#008781',
          800: '#007770',
          900: '#005a51',
        },
        neutral: {
          5: "#0f0f0f",
          10: "#171717",
          15: "#1c1c1c",
          20: "#2a2a2a",
          22: "#303030",
          30: "#474747",
          40: "#5c5c5c",
          50: "#737373",
          60: "#8a8a8a",
          70: "#9b9b9b",
          80: "#b0b0b0",
          90: "#c4c4c4",
          95: "#dcdcdc",
          99: "#f7f7f7",
        },
        "cool-neutral": {
          5: "#0f0f10",
          7: "#141415",
          10: "#171719",
          15: "#1b1c1e",
          17: "#212225",
          20: "#292a2d",
          22: "#2e2f33",
          23: "#333438",
          25: "#37383c",
          30: "#46474c",
          40: "#5a5c63",
          50: "#70737c",
          60: "#878a93",
          70: "#989ba2",
          80: "#aeb0b6",
          90: "#c2c4c8",
          95: "#dbdcdf",
          96: "#e1e2e4",
          97: "#eaebec",
          98: "#f4f4f5",
          99: "#f7f7f8",
        },
        cyan: {
          50: "#dff4f5",
          100: "#ade4e5",
          200: "#72d4d5",
          300: "#13c2c2",
          400: "#00b4b2",
          500: "#00a5a1",
          600: "#009792",
          700: "#008781",
          800: "#007770",
          900: "#005a51",
        },
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(({ addUtilities }) => {
      const fontClassNameList = [
        'font-title-1',
        'font-heading-1',
        'font-heading-2',
        'font-headline-1',
        'font-headline-2',
        'font-body-1-normal',
        'font-body-1-reading',
        'font-body-2-normal',
        'font-body-2-reading',
        'font-label-1-normal',
        'font-label-1-reading',
        'font-label-2',
        'font-caption-1',
        'font-caption-2',
      ];

      const utilites = fontClassNameList.reduce((acc, className) => {
        acc[`.${className}`] = {
          [`@apply ${className.replaceAll('-', '_')}`]: '',
        };

        return acc;
      }, {} as any);

      return addUtilities(utilites);
    }),
  ],
} satisfies Config;

export default config;
