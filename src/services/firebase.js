import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCpwA-sSomrsWVa3N4z6395Clqn9iMXK38',
  authDomain: 'ozcook-5c8d7.firebaseapp.com',
  projectId: 'ozcook-5c8d7',
  storageBucket: 'ozcook-5c8d7.firebasestorage.app',
  messagingSenderId: '2823592988',
  appId: '1:2823592988:web:2c3a2ed38a6cae749e13d9',
  measurementId: 'G-LQEQT3JGJS',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);