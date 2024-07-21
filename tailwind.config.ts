import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "media",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "20px",
      },
      colors: {
        primary: {
          normal: "var(--primary-normal)",
          strong: "var(--primary-strong)",
          heavy: "var(--primary-heavy)",
        },
        label: {
          normal: "var(--label-normal)",
          strong: "var(--label-strong)",
          neutral: "var(--label-neutral)",
          alternative: "var(--label-alternative)",
          assistive: "var(--label-assistive)",
          disable: "var(--label-disable)",
        },
        background: {
          normal: {
            normal: "var(--background-normal-normal)",
            alternative: "var(--background-normal-alternative)",
          },
          elevated: {
            normal: "var(--background-elevated-normal)",
            alternative: "var(--background-elevated-alternative)",
          },
        },
        interaction: {
          inactive: "var(--interaction-inactive)",
          disable: "var(--interaction-disable)",
        },
        line: {
          normal: "var(--line-normal)",
          neutral: "var(--line-neutral)",
          alternative: "var(--line-alternative)",
        },
        status: {
          positive: "var(--status-positive)",
          cautionary: "var(--status-cautionary)",
          destructive: "var(--status-destructive)",
        },
        accent: {
          lime: "var(--accent-lime)",
          cyan: "var(--accent-cyan)",
          light_blue: "var(--accent-light_blue)",
          pink: "var(--accent-pink)",
          skin1: "var(--accent-skin1)",
          skin2: "var(--accent-skin2)",
        },
        inverse: {
          primary: "var(--inverse-primary)",
          background: "var(--inverse-background)",
          label: "var(--inverse-label)",
        },
        static: {
          white: "var(--static-white)",
          black: "var(--static-black)",
        },
        fill: {
          normal: "var(--fill-normal)",
          strong: "var(--fill-strong)",
          alternative: "var(--fill-alternative)",
        },
        material: {
          dimmer: "var(--material-dimmer)",
        },
      },
      boxShadow: {
        normal: "var(--elevation-normal)",
        emphasize: "var(--elevation-emphasize)",
        strong: "var(--elevation-strong)",
        heavy: "var(--elevation-heavy)",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      const fontClassNameList = [
        "font-title-1",
        "font-heading-1",
        "font-heading-2",
        "font-headline-1",
        "font-headline-2",
        "font-body-1-normal",
        "font-body-1-reading",
        "font-body-2-normal",
        "font-body-2-reading",
        "font-label-1-normal",
        "font-label-1-reading",
        "font-label-2",
        "font-caption-1",
        "font-caption-2",
      ];

      const utilites = fontClassNameList.reduce((acc, className) => {
        acc[`.${className}`] = {
          [`@apply ${className.replaceAll("-", "_")}`]: "",
        };
        return acc;
      }, {} as any);

      return addUtilities(utilites);
    }),
  ],
};
export default config;
