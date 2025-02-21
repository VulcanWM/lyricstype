/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  crossOrigin: 'anonymous',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'animated-acorn-jq94rpgjrvjf5g4r-3000.app.github.dev'],
      allowedForwardedHosts: ['animated-acorn-jq94rpgjrvjf5g4r-3000.app.github.dev']
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Adjust this to your specific needs
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ]
  },
  trustedHosts: ['animated-acorn-jq94rpgjrvjf5g4r-3000.app.github.dev', 'localhost:3000'],
}

export default nextConfig
