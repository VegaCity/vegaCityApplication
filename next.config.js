// next.config.js

const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
const { getStorage } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyCM9tvTPe6Lyc8KEBGNMB0cj0q_xlh4t6U",
  authDomain: "vegacity-utility-card.firebaseapp.com",
  projectId: "vegacity-utility-card",
  storageBucket: "vegacity-utility-card.appspot.com",
  messagingSenderId: "7350286169",
  appId: "1:7350286169:web:72c2d502a4bc15427afe48",
  measurementId: "G-LVH7NMV7KX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Note: Analytics should only be initialized on the client side
// const analytics = getAnalytics(app)
const storage = getStorage(app);

module.exports = {
  // images: {
  //   domains: ["firebasestorage.googleapis.com"],
  // },

  images: {
    domains: ["firebasestorage.googleapis.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org", // Add this line
        port: "",
        pathname: "/**", // This allows any pathname under the hostname
      },
    ],
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
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
  },
};
