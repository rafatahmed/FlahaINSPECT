import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@flaha/inspect-api-client'],
  // Parent folders (e.g. Flaha/) may contain other lockfiles; stay in this repo.
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
