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
