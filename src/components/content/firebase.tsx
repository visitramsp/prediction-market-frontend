import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHFo7T7OtCNvYTJucMKbsokGnGpXqMZNA",
  authDomain: "kashino-f6386.firebaseapp.com",
  projectId: "kashino-f6386",
  storageBucket: "kashino-f6386.firebasestorage.app",
  messagingSenderId: "640499234138",
  appId: "1:640499234138:web:c6de54ab915ff5fb7a2f63",
  measurementId: "G-5FY1HVC85L",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
