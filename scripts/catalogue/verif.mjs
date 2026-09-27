import fs from 'fs';
import { list, fields } from './fsget.mjs';
const [type, newF, beforeF, afterF] = process.argv.slice(2);
const a = JSON.parse(fs.readFileSync(afterF)).produits, b = JSON.parse(fs.readFileSync(beforeF)).produits, nw = JSON.parse(fs.readFileSync(newF));
const ks = Object.keys(a);
console.log(type, ':', ks.length, 'produits en ligne (liste :', nw.length + ')');
// ordre fournisseur 1..n sans trou ni doublon
const ords = ks.map(k => a[k].ordre_fournisseur).sort((x,y)=>x-y);
console.log('ordre fournisseur 1..n continu :', ords.every((o,i)=>o===i+1));
// chaque ligne de la liste est présente avec la bonne réf/nom/ordre
let ok=0, ko=[]; nw.forEach((p,i)=>{ const k=ks.find(k=>String(a[k].ref_fournisseur)===p.ref); if(k && a[k].nom===p.nom && a[k].ordre_fournisseur===i+1) ok++; else ko.push(p.nom); });
console.log('lignes conformes :', ok + '/' + nw.length, ko.length ? ko : '');
// familles conservées pour les produits existants
const catChg = ks.filter(k => b[k] && b[k].categorie !== a[k].categorie);
console.log('familles modifiées sur produits existants :', catChg.length);
// ordre stock d'un magasin intact (hors successeur ajouté)
const ord = (await list(`magasins/valence/config_commande/${type}/ordre_stock`)).map(d=>[d.name.split('/').pop(), fields(d).rang]);
console.log('valence ordre_stock docs :', ord.length);
