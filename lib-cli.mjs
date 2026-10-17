// Shared helpers for the nightly CLI scripts: run wrangler (Node 22) against the JANE_KV namespace.
import {execFileSync} from 'child_process';import fs from 'fs';import path from 'path';import os from 'os';import {fileURLToPath} from 'url';
export const DIR=path.dirname(fileURLToPath(import.meta.url));
// Optional portable Node 22: set NODE22_BIN, or drop one in ~/.local/node-v22.20.0-linux-x64.
const NODE22=process.env.NODE22_BIN||path.join(os.homedir(),'.local/node-v22.20.0-linux-x64/bin');
// account_id and the KV namespace id come from wrangler.toml (copy wrangler.toml.example) or CLOUDFLARE_ACCOUNT_ID.
const env={...process.env,PATH:fs.existsSync(NODE22)?`${NODE22}:${process.env.PATH}`:process.env.PATH};
const wr=args=>execFileSync('npx',['--no-install','wrangler',...args],{cwd:DIR,env,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:64<<20});
export function kvGet(key){try{const out=wr(['kv','key','get','--binding','JANE_KV','--remote',key]);return out.trim()?JSON.parse(out):null;}catch(e){if(/not found|404/i.test(String(e.stderr||e.message)))return null;throw e;}}
export function kvPut(key,obj){const f=path.join(DIR,`.kvput-${process.pid}.json`);fs.writeFileSync(f,JSON.stringify(obj));try{wr(['kv','key','put','--binding','JANE_KV','--remote',key,'--path',f]);}finally{fs.unlinkSync(f);}}
export const loadTax=()=>JSON.parse(fs.readFileSync(path.join(DIR,'public/tax.json'),'utf8'));
export const ptDate=(ms=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms));
export function kvList(prefix){const out=wr(['kv','key','list','--binding','JANE_KV','--remote','--prefix',prefix]);return JSON.parse(out).map(k=>k.name);}
// active quests = started, not finished (max 3 at a time)
export const QUEST_CAP=3;
export function activeQuests(S,except){const Q=S?.quests||{};return Object.entries(Q).filter(([d,q])=>q.started&&!q.done&&d!==except).map(([d])=>d).sort();}
// Learner settings: [vars] LEARNER_NAME / LEARNER_AGE / LEARNER_GRADE in wrangler.toml (env vars override). Defaults: Explorer, 10, upper elementary.
export function learnerConfig(){const v={};try{const t=fs.readFileSync(path.join(DIR,'wrangler.toml'),'utf8');const m=t.match(/^\[vars\]([\s\S]*?)(?=^\[|$(?![\s\S]))/m);
  if(m)for(const l of m[1].split('\n')){const x=l.match(/^\s*(LEARNER_[A-Z]+)\s*=\s*"([^"]*)"/);if(x)v[x[1]]=x[2];}}catch{}
  for(const k of ['LEARNER_NAME','LEARNER_AGE','LEARNER_GRADE'])if(process.env[k])v[k]=process.env[k];return v;}
