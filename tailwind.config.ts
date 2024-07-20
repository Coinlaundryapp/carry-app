import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
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
          normal: "#13C2C2",
          strong: "#00A5A1",
          heavy: "#00A5A1",
        },
        label: {
          normal: "#171719",
          strong: "#000000",
          neutral: "#5A5C63",
          alternative: "#878A93",
          assistive: "#AEB0B6",
          disable: "#E1E2E4",
        },
        background: {
          normal: {
            normal: "#FFFFFF",
            alternative: "#F7F7F8",
          },
          elevated: {
            normal: "#FFFFFF",
            alternative: "#F7F7F8",
          },
        },
        interaction: {
          inactive: "#989BA2",
          disable: "#F4F4F5",
        },
        line: {
          normal: "#70737C38",
          neutral: "#70737C29",
          alternative: "#F7F7F8",
        },
        status: {
          positive: "#00BF40",
          cautionary: "#FF9200",
          destructive: "#FF4242",
        },
        accent: {
          lime: "#58CF04",
          cyan: "#13C2C2",
          light_blue: "#008DCF",
          pink: "#F553DA",
          skin1: "#FFCCA8",
          skin2: "#FDBE92",
        },
        inverse: {
          primary: "#08979C",
          background: "#1B1C1E",
          label: "#F7F7F8",
        },
        static: {
          white: "#FFFFFF",
          black: "#000000",
        },
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
