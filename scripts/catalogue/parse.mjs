import fs from 'fs';
const lines = fs.readFileSync(process.argv[2],'utf8').split('\n').map(l=>l.trim());
const out=[]; let start=0;
for (let i=0;i<lines.length;i++){
  const m = lines[i].match(/^Réf\. : (\S+) - (.+)$/);
  if(!m) continue;
  // nom = première ligne non vide du bloc (après le "0,00 €" précédent), hors "Promotion"
  let j=start; while(j<i && (!lines[j] || lines[j]==='Promotion')) j++;
  const full=lines[j].replace(/\s+/g,' ');
  const cm = full.match(/^(.*\S)\s+([xX*]\s*\d.*)$/)   // "NOM x 55"
    || full.match(/^(.*[^\sxX])([xX]\s*\d.*)$/)            // "NOM 45grsx20" (collé)
    || full.match(/^(.*\S)\s+([xX]\s.*)$/);                // "NOM x SEAU 5 L"
  const [nom, cond] = cm ? [cm[1], cm[2]] : [full, null];
  const code = m[2].replace(/\s+/g,'').replace(/[\/%.#$\[\]]/g,'_');
  out.push({nom, cond, ref: m[1], codeBrut: m[2], code});
  // fin de bloc = ligne "0,00 €" suivante
  let k=i; while(k<lines.length && lines[k]!=='0,00 €') k++; start=k+1;
}
fs.writeFileSync(process.argv[3], JSON.stringify(out,null,1));
console.log(out.length,'produits');
const dup={}; out.forEach(p=>{dup[p.code]=(dup[p.code]||0)+1});
console.log('codes en double:', Object.entries(dup).filter(([k,v])=>v>1));
console.log('sans cond "x":', out.filter(p=>!p.cond).map(p=>p.nom));
