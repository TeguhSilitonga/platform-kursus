/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg'],
    serverActions: { bodySizeLimit: '3mb' }, // upload foto maks 2 MB
  },
};
export default nextConfig;
