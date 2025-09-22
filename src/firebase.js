import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase config using environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCKX2daP-3ZU4zPLbBNvBNRhscXM3kqkiw",
  authDomain: "parley-conferences.firebaseapp.com",
  projectId: "parley-conferences",
  storageBucket: "parley-conferences.firebasestorage.app",
  messagingSenderId: "674507086532",
  appId: "1:674507086532:web:a1dbe439b1c502cf2dc791"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Authentication
export const auth = getAuth(app);