// Mise à jour ciblée d'un catalogue lamic-reseau. Par défaut : SIMULATION. --apply pour écrire.
// Usage : node sync.mjs <type> <nouvelle_liste.json> [--succ=NOUV:ANC,...] [--delete-removed] [--apply]
import fs from 'fs';
import { get, list, fields } from './fsget.mjs';
const [type, newF] = process.argv.slice(2);
const APPLY = process.argv.includes('--apply');
const DEL = process.argv.includes('--delete-removed');
// Successeurs (changement de conditionnement/format uniquement) : la nouvelle clé reprend la place de l'ancienne.
// --succ=NOUVEAU_CODE:ANCIEN_CODE,NOUVEAU2:ANCIEN2
const succArg = (process.argv.find(a => a.startsWith('--succ=')) || '').slice(7);
const SUCC = Object.fromEntries(succArg ? succArg.split(',').map(x => x.split(':')) : []);
const CAT = {
  surgeles: c => c.startsWith('11')?'PAINS':c.startsWith('12')?'VIENNOISERIES':c.startsWith('14')?'PATISSERIES':c.startsWith('21')?'VIANDES':c.startsWith('22')?'TRAITEUR':c.startsWith('80')?'DIVERS':'AUTRE',
  frais: c => c.startsWith('111')?'CEREALES':c.startsWith('14')?'DECORS & INGREDIENTS':c.startsWith('31AZ')?'CAFE & THES':c.startsWith('31A')?'BOISSONS CHAUDES & SIROPS':c.startsWith('31J')?'JUS':c.startsWith('31')?'BOISSONS CHAUDES & SIROPS':c.startsWith('33')?'GLACES & GRANITES':c.startsWith('84')?'EMBALLAGES':c.startsWith('81')?'MATIERES PREMIERES':c.startsWith('80')?'EPICERIE & FRAIS':'AUTRE',
  boissons: c => c.startsWith('32')?'CONFISERIES':c.startsWith('31')?'BOISSONS':'AUTRE',
}[type];
const tok = JSON.parse(fs.readFileSync(process.env.HOME+'/.config/configstore/firebase-tools.json','utf8')).tokens.access_token;
const P='teamconnect-valence-2026', DB=`projects/${P}/databases/(default)/documents`;

const docRaw = await get(`catalogues/${type}`);
const cur = fields(docRaw).produits;
const nw = JSON.parse(fs.readFileSync(newF));
const condNb = c => { const m = (c||'').match(/(\d+)/); return m ? parseInt(m[1]) : null; };
const refsNew = new Set(nw.map(p=>p.ref));
const byRef = {}; Object.entries(cur).forEach(([k,p]) => byRef[String(p.ref_fournisseur)] = k);

const used = new Set(); const plan = { upd: [], add: [], del: [], succ: [] };
nw.forEach((p, i) => {
  const ord = i + 1;
  let key = byRef[p.ref];
  if (!key && cur[p.code] && !refsNew.has(String(cur[p.code].ref_fournisseur))) key = p.code; // même code, réf changée
  if (key && !used.has(key)) {
    used.add(key);
    plan.upd.push({ key, set: { nom: p.nom, ref_fournisseur: p.ref, conditionnement: p.cond, conditionnement_nombre: condNb(p.cond), ordre_fournisseur: ord } });
  } else {
    let nk = p.code; if (cur[nk] || used.has(nk)) nk = p.code + '_' + p.ref;
    used.add(nk);
    plan.add.push({ key: nk, obj: { nom: p.nom, ref_fournisseur: p.ref, code: nk, conditionnement: p.cond, conditionnement_nombre: condNb(p.cond),
      ordre_fournisseur: ord, categorie: CAT(p.code), actif: true, ventes_jour_defaut: null, stock_mini: 0 } });
    if (SUCC[nk]) plan.succ.push({ from: SUCC[nk], to: nk });
  }
});
Object.keys(cur).forEach(k => { if (!used.has(k)) plan.del.push(k); });

// --- Encodage Firestore ---
const enc = v => v === null || v === undefined ? { nullValue: null } : typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v })
  : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'object' ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([a,b]) => [a, enc(b)])) } } : { stringValue: String(v) };
const q = k => '`' + k.replace(/\\/g,'\\\\').replace(/`/g,'\\`') + '`';
const prodFields = {}; const mask = [];
plan.upd.forEach(u => { prodFields[u.key] = { mapValue: { fields: Object.fromEntries(Object.entries(u.set).map(([a,b]) => [a, enc(b)])) } };
  Object.keys(u.set).forEach(f => mask.push(`produits.${q(u.key)}.${f}`)); });
plan.add.forEach(a => { prodFields[a.key] = enc(a.obj); mask.push(`produits.${q(a.key)}`); });
if (DEL) plan.del.forEach(k => mask.push(`produits.${q(k)}`));
const writes = [{ update: { name: `${DB}/catalogues/${type}`, fields: { produits: { mapValue: { fields: prodFields } } } },
  updateMask: { fieldPaths: mask }, currentDocument: { updateTime: docRaw.updateTime } }];

// Successeurs : copier rang / ventes_jour / inactif de l'ancienne clé vers la nouvelle, pour chaque magasin
const mags = (await list('magasins')).map(m => m.name.split('/').pop());
const succLog = [];
for (const s of plan.succ) for (const mag of mags) for (const sub of ['ordre_stock','ventes_jour','produits_inactifs']) {
  const docs = await list(`magasins/${mag}/config_commande/${type}/${sub}`).catch(() => []);
  const old = docs.find(d => d.name.endsWith('/' + s.from));
  if (old && !docs.find(d => d.name.endsWith('/' + s.to))) {
    writes.push({ update: { name: `${DB}/magasins/${mag}/config_commande/${type}/${sub}/${s.to}`, fields: old.fields } });
    succLog.push(`${mag}/${sub}: ${s.from} → ${s.to} ${JSON.stringify(fields(old))}`);
  }
}

console.log(`Catalogue ${type} : ${plan.upd.length} mis à jour, ${plan.add.length} ajoutés, ${plan.del.length} absents${DEL ? ' (SUPPRIMÉS)' : ' (conservés)'}`);
console.log('Ajouts :', plan.add.map(a => `${a.obj.ordre_fournisseur}. ${a.obj.nom} [${a.key}] → ${a.obj.categorie}`).join('\n  '));
console.log('Absents :', plan.del.map(k => `${cur[k].nom} [${k}]`).join(', '));
console.log('Successeurs :\n  ' + (succLog.join('\n  ') || 'aucun'));
console.log(`Écritures : ${writes.length} (1 catalogue + ${writes.length - 1} docs magasin), ${mask.length} champs catalogue`);
if (!APPLY) { console.log('\n>>> SIMULATION — rien écrit. Relancer avec --apply pour écrire.'); process.exit(0); }
const r = await fetch(`https://firestore.googleapis.com/v1/${DB}:commit`, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ writes }) });
const j = await r.json(); if (j.error) { console.error('ERREUR', JSON.stringify(j.error)); process.exit(1); }
console.log('✅ Écrit (commit atomique) :', j.writeResults.length, 'écritures');
