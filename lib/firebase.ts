// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

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

// Initialize Storage
const storage = getStorage(app);

export { storage };
