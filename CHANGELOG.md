# Changelog — lamic-reseau

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
