// Static assets for the Node server, behaving like Cloudflare's [assets] binding for this app:
// "/" → index.html, "/about" → about.html, ETag/304, no directory listings, no dotfiles, 404 otherwise.
import fs from 'fs';import path from 'path';
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
export function assets(root){
  root=path.resolve(root);
  const find=rel=>{for(const c of [rel,rel+'.html',path.join(rel,'index.html')]){const f=path.join(root,c);if(!f.startsWith(root+path.sep))continue;
    try{const st=fs.statSync(f);if(st.isFile())return{f,st};}catch{}}return null;};
  return{async fetch(req){const u=new URL(typeof req==='string'?req:req.url);let rel;
    try{rel=decodeURIComponent(u.pathname);}catch{return new Response('Bad request',{status:400});}
    if(rel.split('/').some(s=>s.startsWith('.')))return new Response('Not found',{status:404});
    const hit=find(path.normalize(rel.replace(/\/+$/,'')||'/index.html'));if(!hit)return new Response('Not found',{status:404});
    const etag=`"${hit.st.size.toString(16)}-${Math.floor(hit.st.mtimeMs).toString(16)}"`;
    const h={'content-type':TYPES[path.extname(hit.f)]||'application/octet-stream','etag':etag,'cache-control':'public, max-age=0, must-revalidate','x-content-type-options':'nosniff'};
    if(req.headers?.get?.('if-none-match')===etag)return new Response(null,{status:304,headers:h});
    return new Response(req.method==='HEAD'?null:fs.readFileSync(hit.f),{headers:h});}};
}
