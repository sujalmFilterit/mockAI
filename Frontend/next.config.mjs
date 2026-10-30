/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  distDir:
    process.env.NODE_ENV === 'production' && !process.env.VERCEL
      ? '.next-production'
      : '.next',
};
export default config;
