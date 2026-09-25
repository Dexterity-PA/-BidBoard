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
      // Merit pivot: the EV dashboard, EV matches and the need-based
      // onboarding profile are retired. Temporary so they can come back.
      { source: "/dashboard", destination: "/tracker", permanent: false },
      { source: "/matches", destination: "/scholarships", permanent: false },
      { source: "/onboarding", destination: "/tracker", permanent: false },
    ];
  },
};

export default nextConfig;
