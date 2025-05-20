/** @type {import('next').NextConfig} */
module.exports = {
  // Expose les variables SUPABASE à Next.js pendant le build
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  // Ignore ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
};
