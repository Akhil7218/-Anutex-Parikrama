import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace this with your actual Firebase configuration from the Firebase Console
const firebaseConfig = {
  // apiKey: "YOUR_API_KEY",
  // authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  // projectId: "YOUR_PROJECT_ID",
  // storageBucket: "YOUR_PROJECT_ID.appspot.com",
  // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  // appId: "YOUR_APP_ID"
  apiKey: "AIzaSyCTIiCQJbg9leiXcm8GBXIQIUOxKUWG88E",
  authDomain: "anutex-parikrama.firebaseapp.com",
  projectId: "anutex-parikrama",
  storageBucket: "anutex-parikrama.firebasestorage.app",
  messagingSenderId: "525816291406",
  appId: "1:525816291406:web:00c870442475fec682e31f",
  measurementId: "G-BCKLW5M3G9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth instance for Phone Authentication
export const auth = getAuth(app);
