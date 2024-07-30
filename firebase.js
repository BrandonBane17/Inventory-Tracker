// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import dotenv from 'dotenv';
dotenv.config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_TOKEN,
  authDomain: "pantryapp-30638.firebaseapp.com",
  projectId: "pantryapp-30638",
  storageBucket: "pantryapp-30638.appspot.com",
  messagingSenderId: "936958790021",
  appId: "1:936958790021:web:41fb49cb1a7eb864bb9cec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export {firestore}