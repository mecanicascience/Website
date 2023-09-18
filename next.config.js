/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		workerThreads: false,
		cpus: 4,
		serverActions: true,
	},
	reactStrictMode: true,
    images: {
        domains: [
            'mecanicascience.fr',
            'fonts.googleapis.com',
            'firebasestorage.googleapis.com'
        ]
    }
};

module.exports = nextConfig
