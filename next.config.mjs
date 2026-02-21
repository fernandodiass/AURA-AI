/**@type {import('next').NextConfig} */
const nextConfig = {
transpilePackages: ['@pinecone-database/pinecone'],
typescript: {
ignoreBuildErrors: true,
},
};

export default nextConfig;