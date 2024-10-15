module.exports = {
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
  async redirects() {
    return [
      {
        source: "/order-status",
        missing: [
          {
            type: "query",
            key: "status",
          },
        ],
        permanent: false,
        destination: "/",
      },
    ];
  },
};
