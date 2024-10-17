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
  // Make Firebase app and storage available to your Next.js app
  serverRuntimeConfig: {
    firebaseApp: app,
    firebaseStorage: storage,
  },
  publicRuntimeConfig: {
    firebaseConfig, // This makes your Firebase config available on the client side
  },
};
