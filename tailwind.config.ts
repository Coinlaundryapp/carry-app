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
          5: 'var(--neutral-5)',
          10: 'var(--neutral-10)',
          15: 'var(--neutral-15)',
          20: 'var(--neutral-20)',
          22: 'var(--neutral-22)',
          30: 'var(--neutral-30)',
          40: 'var(--neutral-40)',
          50: 'var(--neutral-50)',
          60: 'var(--neutral-60)',
          70: 'var(--neutral-70)',
          80: 'var(--neutral-80)',
          90: 'var(--neutral-90)',
          95: 'var(--neutral-95)',
          99: 'var(--neutral-99)',
        },
        cool: {
          neutral: {
            5: 'var(--cool-neutral-5)',
            7: 'var(--cool-neutral-7)',
            10: 'var(--cool-neutral-10)',
            15: 'var(--cool-neutral-15)',
            17: 'var(--cool-neutral-17)',
            20: 'var(--cool-neutral-20)',
            22: 'var(--cool-neutral-22)',
            23: 'var(--cool-neutral-23)',
            25: 'var(--cool-neutral-25)',
            30: 'var(--cool-neutral-30)',
            40: 'var(--cool-neutral-40)',
            50: 'var(--cool-neutral-50)',
            60: 'var(--cool-neutral-60)',
            70: 'var(--cool-neutral-70)',
            80: 'var(--cool-neutral-80)',
            90: 'var(--cool-neutral-90)',
            95: 'var(--cool-neutral-95)',
            96: 'var(--cool-neutral-96)',
            97: 'var(--cool-neutral-97)',
            98: 'var(--cool-neutral-98)',
            99: 'var(--cool-neutral-99)',
          },
        },
        cyan: {
          50: 'var(--cyan-50)',
          100: 'var(--cyan-100)',
          200: 'var(--cyan-200)',
          300: 'var(--cyan-300)',
          400: 'var(--cyan-400)',
          500: 'var(--cyan-500)',
          600: 'var(--cyan-600)',
          700: 'var(--cyan-700)',
          800: 'var(--cyan-800)',
          900: 'var(--cyan-900)',
        },
        base: {
          blue: {
            6: 'var(--base-blue-6)',
          },
        },
      },
      boxShadow: {
        normal: 'var(--elevation-normal)',
        emphasize: 'var(--elevation-emphasize)',
        strong: 'var(--elevation-strong)',
        heavy: 'var(--elevation-heavy)',
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
