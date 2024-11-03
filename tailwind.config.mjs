// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "rgb(229, 229, 229)",
            "--tw-prose-headings": "rgb(255, 255, 255)",
            "--tw-prose-links": "rgb(59, 130, 246)",
            "--tw-prose-bold": "rgb(255, 255, 255)",
            "--tw-prose-quotes": "rgb(214, 219, 224)",
            "--tw-prose-code": "rgb(255, 255, 255)",
            "--tw-prose-hr": "rgb(55, 65, 81)",
            "--tw-prose-th-borders": "rgb(55, 65, 81)"
          }
        }
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
