import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { setLogLevel } from "firebase/app";

// It's recommended to set the log level to 'debug' during development
setLogLevel('debug');

// Your web app's Firebase configuration is now read from environment variables.
// This is a secure practice that keeps your credentials out of the source code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize the Firebase application with your configuration.
export const app = initializeApp(firebaseConfig);
// Get a reference to the Firestore database service.
export const db = getFirestore(app);
// Get a reference to the Firebase authentication service.
export const auth = getAuth(app);

// Asynchronously sign in the user.
export const signIn = async () => {
  if (auth.currentUser) {
    return; // User is already signed in.
  }
  try {
    await signInAnonymously(auth);
  } catch (error) {
    console.error("Firebase sign-in error:", error);
  }
};

