import type { NextConfig } from "next";

// Note: `turbopack.root` is intentionally not set. Pinning it to this directory
// makes Turbopack fail to resolve the Next.js package ("Next.js package not
// found"), and pinning it to the parent directory exhausts memory. Next infers
// the root from the stray lockfile in the home directory and logs a warning,
// which is harmless. Removing C:\Users\anilb\package-lock.json clears both.
const nextConfig: NextConfig = {};

export default nextConfig;
