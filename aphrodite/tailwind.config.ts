import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        swiss: {
          cream: "rgb(250, 243, 225)",
          gold: "rgb(245, 231, 198)",
          orange: "rgb(250, 129, 18)",
          black: "rgb(34, 34, 34)",
          brown: "rgb(48, 39, 34)",
        },
      },
      fontFamily: {
        stirus: ["var(--font-stirus)", "serif"],
        harmond: ["var(--font-harmond)", "sans-serif"],
      },
      backgroundImage: {
        'noise': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxmaWx0ZXIgaWQ9J25vaXNlJz48ZmVUdXJidWxlbmNlIHR5cGU9J2ZyYWN0YWxOb2lzZScgYmFzZUZyZXF1ZW5jeT0nMC42NScgbnVtT2N0YXZlcz0nMScgc3RpdGNoVGlsZXM9J3N0aXRjaCcvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCNub2lzZSknIG9wYWNpdHk9JzAuMDUnLz48L3N2Zz4=')",
      }
    },
  },
  plugins: [],
};
export default config;