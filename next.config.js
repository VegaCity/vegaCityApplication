module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/user/order-status',
        missing: [
          {
            type: 'query',
            key: 'status',
          },
        ],
        permanent: false,
        destination: '/',
      },
    ];
  },
};