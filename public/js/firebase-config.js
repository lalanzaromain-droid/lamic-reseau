// firebase-config.js — Init Firebase + Firestore pour module commande multi-tenant
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAHNdciMVNz15NoAXfc7yi9q4EnQJW8PKE',
  authDomain: 'teamconnect-valence-2026.firebaseapp.com',
  projectId: 'teamconnect-valence-2026',
  storageBucket: 'teamconnect-valence-2026.firebasestorage.app',
  messagingSenderId: '47179706726',
  appId: '1:47179706726:web:6403fd5f9dc9a3e10518a7'
};

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

export { app, auth, db, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail };
