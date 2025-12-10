/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"]
  }
};

export default nextConfig;
