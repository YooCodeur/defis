/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    distDir: '.next',
    images: {
        domains: ['res.cloudinary.com'],
        unoptimized: true
    },
    experimental: {
        serverComponentsExternalPackages: ['mongoose']
    },
    webpack: (config) => {
        config.experiments = { ...config.experiments, topLevelAwait: true };
        return config;
    }
};

module.exports = nextConfig; 