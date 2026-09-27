import fs from 'fs';
const [,, curF, newF] = process.argv;
const cur = JSON.parse(fs.readFileSync(curF)).produits;
const nw = JSON.parse(fs.readFileSync(newF));
const byRefCur = {}; Object.entries(cur).forEach(([k,p])=>byRefCur[String(p.ref_fournisseur)]=k);
const seen = new Set(); const R={maj:[],ordreSeul:0,nouveaux:[],codeChange:[],retires:[],dupNew:[]};
const cnt={}; nw.forEach(p=>cnt[p.code]=(cnt[p.code]||0)+1);
nw.forEach((p,i)=>{
  const ord=i+1; const c=cur[p.code];
  if (cnt[p.code]>1) R.dupNew.push(`${ord}. ${p.nom} [${p.ref}] code ${p.code}` + (c? ` — en ligne: ${c.nom} [${c.ref_fournisseur}]`:''));
  if (c) { seen.add(p.code);
    const ch=[]; if(c.nom!==p.nom) ch.push(`nom "${c.nom}"→"${p.nom}"`);
    if(String(c.ref_fournisseur)!==p.ref) ch.push(`réf ${c.ref_fournisseur}→${p.ref}`);
    if((c.conditionnement||null)!==(p.cond||null)) ch.push(`cond "${c.conditionnement}"→"${p.cond}"`);
    if(ch.length) R.maj.push(`${p.code}: ${ch.join(', ')}`);
    if(c.ordre_fournisseur!==ord) R.ordreSeul++;
  } else if (byRefCur[p.ref]) { R.codeChange.push(`${p.nom} [${p.ref}] : code en ligne ${byRefCur[p.ref]} → nouveau ${p.code}`); seen.add(byRefCur[p.ref]); }
  else R.nouveaux.push(`${ord}. ${p.nom} ${p.cond||''} [${p.ref}] ${p.code}`);
});
Object.entries(cur).forEach(([k,p])=>{ if(!seen.has(k)) R.retires.push(`${p.nom} ${p.conditionnement||''} [${p.ref_fournisseur}] ${k} (${p.categorie})`); });
console.log(JSON.stringify(R,null,1));
