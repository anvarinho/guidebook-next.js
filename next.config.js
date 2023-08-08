/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['172.20.10.4'], // Add your external image domains here
        unoptimized: true,
    },
    webpack(config) {
        config.infrastructureLogging = { debug: /PackFileCache/ }
        return config;
    }
}

module.exports = nextConfig
