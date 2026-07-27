/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module and must not be bundled by webpack/turbopack.
  serverExternalPackages: ['better-sqlite3'],
  images: {
    // Menu photos are plain remote URLs. Disabling optimization keeps the
    // sharp/libvips code path out of the request cycle entirely.
    unoptimized: true,
  },
};

export default nextConfig;
