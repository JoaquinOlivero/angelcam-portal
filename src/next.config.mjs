/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*', },
        ],
    },
    env: {
        NEXT_PUBLIC_API: process.env.NEXT_PUBLIC_API,
        NEXT_PUBLIC_API_PORT: process.env.NEXT_PUBLIC_API_PORT
    },
};

export default nextConfig;
