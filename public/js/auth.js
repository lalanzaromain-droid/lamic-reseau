// auth.js — Gestion authentification + session utilisateur
import { auth, db, onAuthStateChanged, signInWithEmailAndPassword, signOut } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

let currentUser = null;
let currentUserData = null;

// Vérifie l'auth et redirige si non connecté
function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    currentUser = user;
    // Charger les données utilisateur depuis Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      currentUserData = userDoc.data();
    } else {
      // Première connexion : pas encore de doc user
      currentUserData = null;
    }
    if (callback) callback(user, currentUserData);
  });
}

// Login
async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Logout
async function logout() {
  await signOut(auth);
  window.location.href = 'index.html';
}

// Getters
function getUser() { return currentUser; }
function getUserData() { return currentUserData; }
function getMagasinId() { return currentUserData?.magasinId || null; }

export { requireAuth, login, logout, getUser, getUserData, getMagasinId };
