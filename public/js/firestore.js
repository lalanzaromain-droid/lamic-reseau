// firestore.js — Helpers CRUD Firestore multi-tenant
import { db } from './firebase-config.js';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
  query, where, orderBy, limit, onSnapshot, writeBatch, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// ─── Catalogues (globaux) ───────────────────────────────

async function getCatalogue(type) {
  const snap = await getDocs(collection(db, 'catalogues', type, 'produits'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function setCatalogueProduit(type, produitId, data) {
  await setDoc(doc(db, 'catalogues', type, 'produits', produitId), data, { merge: true });
}

async function deleteCatalogueProduit(type, produitId) {
  await deleteDoc(doc(db, 'catalogues', type, 'produits', produitId));
}

// ─── Config magasin (ordre stock, ventes/jour perso) ────

async function getOrdreStock(magasinId, type) {
  const snap = await getDocs(collection(db, 'magasins', magasinId, 'config_commande', type, 'ordre_stock'));
  const map = {};
  snap.docs.forEach(d => { map[d.id] = d.data().rang; });
  return map;
}

async function setOrdreStock(magasinId, type, ordreMap) {
  const batch = writeBatch(db);
  for (const [produitId, rang] of Object.entries(ordreMap)) {
    batch.set(doc(db, 'magasins', magasinId, 'config_commande', type, 'ordre_stock', produitId), { rang });
  }
  await batch.commit();
}

async function getVentesJourPerso(magasinId, type) {
  const snap = await getDocs(collection(db, 'magasins', magasinId, 'config_commande', type, 'ventes_jour'));
  const map = {};
  snap.docs.forEach(d => { map[d.id] = d.data().valeur; });
  return map;
}

async function setVenteJourPerso(magasinId, type, produitId, valeur) {
  await setDoc(doc(db, 'magasins', magasinId, 'config_commande', type, 'ventes_jour', produitId), { valeur });
}

async function getJoursATenir(magasinId, type) {
  const d = await getDoc(doc(db, 'magasins', magasinId, 'config_commande', type));
  return d.exists() ? (d.data().jours_a_tenir || 3) : 3;
}

async function setJoursATenir(magasinId, type, jours) {
  await setDoc(doc(db, 'magasins', magasinId, 'config_commande', type), { jours_a_tenir: jours }, { merge: true });
}

// ─── Commandes ──────────────────────────────────────────

async function saveCommande(magasinId, commandeData) {
  commandeData.createdAt = serverTimestamp();
  const ref = await addDoc(collection(db, 'magasins', magasinId, 'commandes'), commandeData);
  return ref.id;
}

async function getCommandes(magasinId, maxResults = 50) {
  const q = query(
    collection(db, 'magasins', magasinId, 'commandes'),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getCommande(magasinId, commandeId) {
  const d = await getDoc(doc(db, 'magasins', magasinId, 'commandes', commandeId));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}

// ─── Magasin ────────────────────────────────────────────

async function getMagasin(magasinId) {
  const d = await getDoc(doc(db, 'magasins', magasinId));
  return d.exists() ? d.data() : null;
}

async function createMagasin(magasinId, data) {
  data.createdAt = serverTimestamp();
  await setDoc(doc(db, 'magasins', magasinId), data);
}

// ─── Users ──────────────────────────────────────────────

async function createUserDoc(uid, data) {
  await setDoc(doc(db, 'users', uid), data);
}

async function getUserDoc(uid) {
  const d = await getDoc(doc(db, 'users', uid));
  return d.exists() ? d.data() : null;
}

export {
  getCatalogue, setCatalogueProduit, deleteCatalogueProduit,
  getOrdreStock, setOrdreStock,
  getVentesJourPerso, setVenteJourPerso,
  getJoursATenir, setJoursATenir,
  saveCommande, getCommandes, getCommande,
  getMagasin, createMagasin,
  createUserDoc, getUserDoc
};
