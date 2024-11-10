import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCCYAQGynrDa3-64F8r2HCQ0kqkkieOqQ4",
    authDomain: "linkedin-editor.firebaseapp.com",
    projectId: "linkedin-editor",
    storageBucket: "linkedin-editor.firebasestorage.app",
    messagingSenderId: "509413402607",
    appId: "1:509413402607:web:b1be1637c111b0f602f81a",
    measurementId: "G-MDHRPMSYNF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  app,
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification
}; 