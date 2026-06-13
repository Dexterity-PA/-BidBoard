/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return [
      // The product is fully free; the old pricing page now points home.
      {
        source: "/pricing",
        destination: "/#why-free",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
