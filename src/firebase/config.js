
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBq7iEUczK-kT8lwk6Y00e8vlmycflUas0",
  authDomain: "tournament-demo-827e0.firebaseapp.com",
  projectId: "tournament-demo-827e0",
  storageBucket: "tournament-demo-827e0.appspot.com",
  messagingSenderId: "699261763987",
  appId: "1:699261763987:web:5f31e0d6347e26a977a866",
  measurementId: "G-FV7DGB7985"
};

// Initialize Firebase
export const FirebaseApp  = initializeApp(firebaseConfig);
export const FirebaseAuth = getAuth(FirebaseApp);
export const FirebaseDB   = getFirestore(FirebaseApp);

