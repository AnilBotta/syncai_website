import type { NextConfig } from "next";

// Note: `turbopack.root` is intentionally not set. Pinning it to this directory
// makes Turbopack fail to resolve the Next.js package ("Next.js package not
// found"), and pinning it to the parent directory exhausts memory. Next infers
// the root from the stray lockfile in the home directory and logs a warning,
// which is harmless. Removing C:\Users\anilb\package-lock.json clears both.
const nextConfig: NextConfig = {
  images: {
    // Demo-site photography is delivered from Cloudinary. next/image refuses any
    // remote host that isn't listed here, so without this every demo image 400s.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/tpwmgjsk/**",
      },
    ],
  },
};

export default nextConfig;
