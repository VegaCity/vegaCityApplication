// next.config.js
const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

// Your web app's Firebase configuration
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

// Initialize Cloud Storage and get a reference to the service
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
  // You can add more Next.js config options here

  // Make Firebase storage available to your app
  serverRuntimeConfig: {
    storage,
  },
};
