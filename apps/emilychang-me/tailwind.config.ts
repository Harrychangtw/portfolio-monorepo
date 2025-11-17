import type { Config } from 'tailwindcss';
import sharedConfig from '@portfolio/config/tailwind';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Include the shared UI package (specific paths to avoid node_modules)
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/*.{js,ts,jsx,tsx}',
  ],
  presets: [sharedConfig],
  // Customize Emily's site branding here
  theme: {
    extend: {
      // You can override colors, fonts, etc. for Emily's unique brand
      // colors: {
      //   primary: "hsl(var(--primary))",
      // },
    },
  },
};

export default config;
