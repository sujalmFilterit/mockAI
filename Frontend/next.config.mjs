/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  distDir: process.env.NODE_ENV === 'production' ? '.next-production' : '.next',
};
export default config;
