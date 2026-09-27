# Changelog — lamic-reseau

## 27 septembre 2026 — Catalogues nouvelle carte
- Catalogues Firestore mis à jour depuis le site de commande : surgelés (138 : 124 maj, 14 ajouts, 11 retraits), frais (163 : 156 maj, 7 ajouts, 8 retraits). Familles et ordres stock magasins intacts ; produits au code fournisseur changé retrouvés par référence (clé conservée). Successeurs (conditionnement seul) : Mi-cuit Cookiz x84→x105, Serviettes x6000→x8000 reprennent rang/VJ/état de l'ancien.
- `commande.html` : produits pas encore placés par un magasin → en bas de son ordre stock (suite du dernier rang, ordre fournisseur), 🆕 dans Paramètres. Avant : rang = ordre fournisseur, donc intercalés au milieu.
- `admin-seed-catalogue.html` : boutons désactivés (données de juin, écraseraient le catalogue) — "Mise à jour faite par Romain au lancement des nouvelles cartes".
- `scripts/catalogue/` (nouveau) : parse de la liste copiée, diff, sync ciblée (simulation / `--apply`, `--succ`, `--delete-removed`), vérification. Voir README.

---

## 27 septembre 2026 — Commande auto (bookmarklet)
- `commande.html` : bouton "📋 Copier la liste" dans le détail commande et dans le bandeau de chaque commande de l'historique — lignes `ref;nom;quantité` (ordre fournisseur, mêmes quantités que la colonne CMD) pour le bookmarklet.
- `commande.html` : bouton "🤖 Commande auto" à droite de la ligne des rayons dans Paramètres → `commande-auto.html`.
- `commande-auto.html` (nouveau) : page d'installation du bookmarklet v2 (repris de lamic-app `bookmarklet-commande.html`), retour vers `/commande.html`.
- `commande.html` : colonne CMD modifiable dans le détail commande (comme lamic-app : sélection au focus, Entrée → suivant, vide = valeur calculée, rouge si modifié). Overrides enregistrés dans la commande (`overrides.{produitId}`, debounce 600 ms), repris par Copier la liste et affichés dans l'historique.

## 27 septembre 2026 — Sécurité règles Firestore
- `firestore.rules` : `users/{uid}` en écriture interdite côté client (`allow write: if false`). Avant, un user pouvait modifier son propre doc et s'attribuer `role: 'admin'` ou un autre `magasinId`. Les docs users sont créés par la Cloud Function `createMagasin` (Admin SDK) — aucune page n'écrit dans `users/`.
- Règles communes au projet `teamconnect-valence-2026` (aussi lues par les pages Firestore de lamic-app) — déployées avec `firebase deploy --only firestore:rules`.

---

## 4 juin 2026 — Inventaire comptable v2

### Inventaire comptable (`inventaire-compta.html`)
- **762 produits** intégrés depuis l'export officiel La Mie Câline (matching 100% par ref fournisseur)
- **Prix d'achat + conditionnement** pré-remplis pour chaque produit
- **Calcul corrigé** : `(cartons × cond + unités) × prix unitaire`
- **Conditionnement affiché** à côté du nom produit (ex: "Ctn 125")
- **Prix cachés par défaut** — bouton 👁 Prix pour toggle (confidentialité équipe)
- **Saisie 2 colonnes** : Cartons + Unités (prix non modifiable)
- **Bouton Suivant** au-dessus du clavier mobile pour naviguer entre les inputs
- **Steps cliquables** : navigation directe entre Sélection / Saisie / Recap / Historique
- **Système de décalage** : déplacer un produit dans un autre groupe de comptage (famille officielle conservée pour les totaux)
- **Historique trimestriel** : 4 dernières sessions conservées
- **Brouillon sauvegardé dans Firebase** (plus de perte entre sessions/appareils)
- **Export PDF + Excel** avec colonnes Cond et Qty totale

---

## 2 juin 2026
### Inscription & Onboarding
- `inscription.html` : formulaire public pour les collegues (sauvegarde Firestore `inscriptions/`)
- `admin-inscriptions.html` : page admin avec login, liste demandes, creation compte via Cloud Function, bouton SMS + copier lien + lien affiche en clair
- `notice.html` : notice d'utilisation (3 etapes connexion + 4 etapes parametrage magasin)
- Suppression `admin-magasins.html` (tout est dans admin-inscriptions)
- Regles Firestore : `inscriptions/` ecriture publique, lecture admin

### Catalogue agrege
- 1 doc Firestore par catalogue (`catalogues/{type}`) au lieu de ~170 docs individuels
- Migration : commande.html, firestore.js, admin-familles.html, import-vj-commande.html, admin-seed-catalogue.html
- Regles Firestore adaptees au nouveau path

### Commande
- Bouton "Passer et explorer l'app" sur le wizard (testeurs pas bloques)
- Ordre stock mode rang : renumerotation auto sans doublons, priorite au produit renomme
- Fix `renderWzOrdre` non defini (expose sur window pour onclick inline)
- Suppression "Ferie = +1j" dans jours a tenir

### CORS
- Cloud Function `createMagasin` : ajout `lamic-reseau.web.app` dans les origines autorisees
- `setCorsRestricted` accepte maintenant plusieurs domaines

---

## 1er juin 2026
- 3 modes de calcul commande (VJ/produit, VJ/colis, stock mini)
- Bulles pastel, header violet, chargement parallele + cache localStorage

## 31 mai 2026
- Inventaire compta, rename lamic-reseau, perf Firestore

## 30 mai 2026
- Initial commit : app reseau lamic-commande
