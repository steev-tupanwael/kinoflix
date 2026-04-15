import { execSync } from 'child_process';
import type { NextConfig } from "next";

// Fungsi untuk ambil Short SHA dari Git
const getGitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    return 'no-git';
  }
};

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Jika di Vercel, pakai variabel Vercel. Jika di lokal, tarik dari Git.
    NEXT_PUBLIC_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA
      ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
      : getGitHash(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gstatic.com', // Tambahkan ini
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
