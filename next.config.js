/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fonts are loaded via <link> in layout.tsx; skip build-time inlining so the
  // build never needs network access to Google Fonts.
  optimizeFonts: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};
module.exports = nextConfig;
