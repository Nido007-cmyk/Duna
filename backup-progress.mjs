// Save the live progress record to backups/<PT date>/progress-<HHMMSS>.json (gitignored). Read-only on KV.
import fs from 'fs';import path from 'path';import {kvGet,DIR,ptDate} from './lib-cli.mjs';
const S=kvGet('progress');
if(!S){console.log('backup: no progress record yet, nothing to save');process.exit(0);}
const t=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Los_Angeles',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()).replace(/:/g,'');
const dir=path.join(DIR,'backups',ptDate());fs.mkdirSync(dir,{recursive:true});const f=path.join(dir,`progress-${t}.json`);
fs.writeFileSync(f,JSON.stringify(S));console.log('backup:',path.relative(DIR,f),`(${S.points??0} points)`);
