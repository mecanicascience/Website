/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		workerThreads: false,
		cpus: 4,
		serverActions: true,
	},
	reactStrictMode: true,
};

module.exports = nextConfig
