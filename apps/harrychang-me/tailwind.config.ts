// apps/harrychang-me/tailwind.config.ts

import type { Config } from 'tailwindcss';
import sharedConfig from '@portfolio/config/tailwind';
const config: Config = {
  // Use the 'presets' array to inherit the shared configuration.
  presets: [sharedConfig],
  // Override the 'content' property for this app
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/*.{js,ts,jsx,tsx}',
    './content/**/*.md',
  ],
};

export default config;
