// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFpF-V3mMU3-H_fs-a3m7HIoMNTLRhKWI",
  authDomain: "recipe-react-app-a8ca5.firebaseapp.com",
  projectId: "recipe-react-app-a8ca5",
  storageBucket: "recipe-react-app-a8ca5.firebasestorage.app",
  messagingSenderId: "440492389417",
  appId: "1:440492389417:web:7bf8eef3096858a1be5838"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)





export { app, auth, db };