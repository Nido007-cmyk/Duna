// File-based storage adapter with the subset of the Workers KV API that Jane uses:
// get(key, 'json'?), put(key, value), list({prefix}), delete(key). One file per key in DATA_DIR.
// Keys are percent-encoded into file names (e.g. "lessons:2026-10-17" → "lessons%3A2026-10-17.json").
// Writes are atomic (temp file + rename). A sync variant is exported for the CLI scripts.
import fs from 'fs';import path from 'path';
const enc=k=>encodeURIComponent(k).replace(/\./g,'%2E')+'.json',dec=f=>decodeURIComponent(f.slice(0,-5));
export function fileStore(dir){
  fs.mkdirSync(dir,{recursive:true});const p=k=>path.join(dir,enc(String(k)));
  const getSync=(k,type)=>{let s;try{s=fs.readFileSync(p(k),'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}return type==='json'?JSON.parse(s):s;};
  const putSync=(k,v)=>{const f=p(k),t=`${f}.${process.pid}.${Date.now()}.tmp`;fs.writeFileSync(t,typeof v==='string'?v:String(v));fs.renameSync(t,f);};
  const listSync=(prefix='')=>fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(dec).filter(k=>k.startsWith(prefix)).sort();
  const deleteSync=k=>{try{fs.unlinkSync(p(k));}catch(e){if(e.code!=='ENOENT')throw e;}};
  return{dir,getSync,putSync,listSync,deleteSync,
    async get(k,opt){return getSync(k,typeof opt==='string'?opt:opt?.type);},
    async put(k,v){putSync(k,v);},
    async delete(k){deleteSync(k);},
    async list({prefix='',limit=1000}={}){const keys=listSync(prefix).slice(0,limit).map(name=>({name}));return{keys,list_complete:true,cursor:''};}};
}
