# Mise à jour des catalogues (nouvelles cartes)

Met à jour `catalogues/{surgeles|frais|boissons}` dans Firestore à partir de la liste copiée depuis le site de commande, **sans toucher à l'ordre de stock des magasins**.

Ce que fait la mise à jour :
- produits existants (retrouvés par **référence**, sinon par code) : seuls `nom`, `ref_fournisseur`, `conditionnement`, `conditionnement_nombre`, `ordre_fournisseur` changent — familles, ventes/jour, rangs stock intacts ;
- nouveaux produits : ajoutés actifs, famille déduite du code → ils apparaissent **en bas** de l'ordre stock de chaque magasin (🆕 dans Paramètres) ;
- produits absents de la liste : retirés du catalogue avec `--delete-removed` ;
- successeurs (`--succ`) : quand seul le conditionnement/format change, le nouveau produit reprend le rang stock, les ventes/jour et l'état actif de l'ancien dans chaque magasin.

Écriture en un seul commit atomique, refusé si le catalogue a changé depuis la lecture.

## Étapes

Prérequis : `firebase login` fait sur la machine (les scripts utilisent le jeton du CLI Firebase). Lancer `firebase projects:list` juste avant pour rafraîchir le jeton.

1. Sur le site de commande, afficher la rubrique en entier et copier la liste dans un fichier texte (ex. `surgeles_raw.txt`).
2. Convertir : `node parse.mjs surgeles_raw.txt surgeles_new.json` (signale les codes en double et les conditionnements non reconnus).
3. Comparer : `node fsget.mjs catalogues/surgeles cur.json` puis `node diff.mjs cur.json surgeles_new.json` (mis à jour, nouveaux, codes changés, retirés).
4. Simuler : `node sync.mjs surgeles surgeles_new.json --delete-removed [--succ=NOUVEAU:ANCIEN]` — n'écrit rien.
5. Écrire : même commande + `--apply`.
6. Vérifier : `node fsget.mjs catalogues/surgeles after.json` puis `node verif.mjs surgeles surgeles_new.json cur.json after.json`.

⚠️ Ne plus utiliser `public/admin-seed-catalogue.html` : il contient l'ancien catalogue (juin 2026) et remplacerait tout le document (boutons désactivés).
