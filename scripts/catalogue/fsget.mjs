// Lecture REST Firestore (token CLI firebase) -> JSON simple
import fs from 'fs';
const tok = JSON.parse(fs.readFileSync(process.env.HOME+'/.config/configstore/firebase-tools.json','utf8')).tokens.access_token;
const P='teamconnect-valence-2026';
function conv(v){ if(!v) return null; const k=Object.keys(v)[0]; const x=v[k];
  if(k==='mapValue') return Object.fromEntries(Object.entries(x.fields||{}).map(([a,b])=>[a,conv(b)]));
  if(k==='arrayValue') return (x.values||[]).map(conv);
  if(k==='integerValue') return Number(x); if(k==='nullValue') return null; return x; }
export async function get(path){ const r=await fetch(`https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents/${path}`,{headers:{Authorization:'Bearer '+tok}}); const j=await r.json(); if(j.error) throw new Error(JSON.stringify(j.error)); return j; }
export async function list(path){ let out=[],pt=''; do{ const r=await fetch(`https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents/${path}?pageSize=300${pt?'&pageToken='+pt:''}`,{headers:{Authorization:'Bearer '+tok}}); const j=await r.json(); if(j.error) throw new Error(JSON.stringify(j.error)); out=out.concat(j.documents||[]); pt=j.nextPageToken; }while(pt); return out; }
export const fields = d => Object.fromEntries(Object.entries(d.fields||{}).map(([a,b])=>[a,conv(b)]));
if (process.argv[1] && process.argv[1].endsWith("fsget.mjs") && process.argv[2]) { const d=await get(process.argv[2]); fs.writeFileSync(process.argv[3], JSON.stringify(fields(d),null,1)); console.log('ok', process.argv[2]); }
