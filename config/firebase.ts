// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
