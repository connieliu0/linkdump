// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnUCQ2JkzfyQ9eWNveOxP4XeckTKCEDuc",
  authDomain: "linkdump-f6ac5.firebaseapp.com",
  databaseURL: "https://linkdump-f6ac5-default-rtdb.firebaseio.com",
  projectId: "linkdump-f6ac5",
  storageBucket: "linkdump-f6ac5.firebasestorage.app",
  messagingSenderId: "259393222123",
  appId: "1:259393222123:web:04e84d13399b5e8d1e15ae",
  measurementId: "G-0QT7LW7YHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database and export it
export const db = getDatabase(app);