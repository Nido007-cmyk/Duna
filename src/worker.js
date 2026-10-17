import * as E from './engine.js';import * as PR from './parent.js';
let G=null;const QUEST_CAP=3;
async function graph(env){if(!G){const r=await env.ASSETS.fetch(new Request('https://assets.local/tax.json'));G=E.graph(await r.json());}return G;}
export const ptDate=(ms=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms));
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json','cache-control':'no-store'}});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ptTime=ts=>new Date(ts).toLocaleString('en-US',{timeZone:'America/Los_Angeles'});
// Sandbox (for testing/screenshots without touching Landon's real progress): open /api/sandbox?on=1 (cookie sbx=1, 24 h),
// POST /api/sandbox/reset {offsetDays} copies the real progress into sandbox:* keys. /api/sandbox?on=0 leaves it.
export default{async fetch(req,env){const u=new URL(req.url),P=u.pathname,KV=env.LANDON_KV;
 const sbxQ=u.searchParams.get('sandbox'),sbx=sbxQ!=null?sbxQ==='1':/(?:^|;\s*)sbx=1/.test(req.headers.get('cookie')||'');const K=k=>sbx?'sandbox:'+k:k;
 if(!P.startsWith('/api/')&&P!=='/parent'){const r=await env.ASSETS.fetch(req);if(sbxQ==null)return r;const h=new Headers(r.headers);h.append('set-cookie',`sbx=${sbxQ==='1'?1:0}; Path=/; SameSite=Lax${sbxQ==='1'?'':'; Max-Age=0'}`);return new Response(r.body,{status:r.status,headers:h});}
 const g=await graph(env);
 if(P==='/api/sandbox'){const on=u.searchParams.get('on')!=='0';return new Response(null,{status:302,headers:{location:'/','set-cookie':`sbx=${on?1:0}; Path=/; SameSite=Lax${on?'; Max-Age=86400':'; Max-Age=0'}`}});}
 if(sbx&&P==='/api/sandbox/reset'&&req.method==='POST'){const b=await req.json().catch(()=>({}));await KV.put('sandbox:progress',(await KV.get('progress'))||'null');await KV.put('sandbox:debug:clockOffsetDays',String(+b.offsetDays||0));return J({ok:true,sandbox:true,offsetDays:+b.offsetDays||0});}
 const off=+(await KV.get(K('debug:clockOffsetDays')))||0;const now=Date.now()+off*864e5,today=ptDate(now);
 const raw=await KV.get(K('progress'),'json');let S=E.migrate(raw,g);const migrated=raw&&raw.v!==2;
 const S0=JSON.stringify(S);
 // ---- quests: max 3 active (started, unfinished). The engine plays the focused / oldest active quest; today's new quest waits while 3 are active.
 const todayPack=await KV.get('lessons:'+today,'json');const PC={[today]:todayPack};
 const ld=[];{let cur;do{const l=await KV.list({prefix:'lessons:',cursor:cur});ld.push(...l.keys.map(k=>k.name.slice(8)));cur=l.list_complete?null:l.cursor;}while(cur);}
 const recent=ld.filter(d=>d<=today).sort().slice(-30);await Promise.all(recent.filter(d=>!(d in PC)).map(async d=>PC[d]=await KV.get('lessons:'+d,'json')));
 const qrec=d=>S.quests?.[d]||{};const activeQ=()=>recent.filter(d=>PC[d]?.quest&&qrec(d).started&&!qrec(d).done);
 const paused=()=>!!(todayPack?.quest&&!qrec(today).started&&activeQ().length>=QUEST_CAP);
 const withBoost=async p=>{if(!p?.quest)return p;const b=await KV.get('boost:'+p.date,'json');return b?E.applyBoost(p,b):p;};
 const choosePack=async()=>{const A=activeQ();let d=S.questFocus&&A.includes(S.questFocus)?S.questFocus:null;if(!d&&A.length)d=A[0];return d?withBoost(PC[d]):paused()?null:todayPack;};
 let pack=await choosePack();E.refresh(S,g,pack,now);
 const body=req.method==='POST'?await req.json().catch(()=>({})):{};let out,ev=[];
 const pub=()=>{const sm=E.summary(S,g,now);delete sm.codes;return{name:S.name,points:S.points,stars:S.stars,streak:S.streak,bestStreak:S.bestStreak,solved:S.solved,medals:(S.medals||[]).slice(-4).reverse().map(m=>E.medalInfo(m,g)).filter(Boolean),medalCount:(S.medals||[]).length,
   placement:{done:S.placement.done,asked:S.placement.asked},progress:sm,pack:pack?{date:pack.date,title:pack.title}:null,item:E.publicItem(S.current,g),clockOffsetDays:off||undefined,sandbox:sbx||undefined,
   quest:pack?.quest?E.questInfo(S,g,pack):null,newQuest:!!(todayPack?.quest&&!qrec(today).started&&!paused()),
   quests:{active:activeQ().length,cap:QUEST_CAP,paused:paused(),oldest:(()=>{const d=activeQ()[0];return d?{date:d,title:PC[d].quest.title,emoji:PC[d].quest.emoji||'🗺️',pct:E.questInfo(S,g,PC[d]).pct}:null;})(),boost:pack?.boost||null},
   terms:pack?.terms||null,mini:S.mini?{topicId:S.mini.topicId,subject:S.mini.ret}:null};};
 const questCheck=r=>{if(!pack?.quest)return;const qi=E.questInfo(S,g,pack);S.quests??={};const q=S.quests[pack.date]??={};if(q.done||qi.done<qi.total)return;
   q.started??=now;q.done=now;if(S.questFocus===pack.date)S.questFocus=null;const m={date:pack.date,title:qi.title,name:qi.medal.name,emoji:qi.medal.emoji,at:now};(S.questMedals??=[]).push(m);r.questDone=m;ev.push({event:'questDone',date:pack.date,quest:qi.title});};
 if(P==='/parent'){ // read-only: returns before any KV write
   const ds=[...Array(14)].map((_,i)=>ptDate(now-(13-i)*864e5));const logs={};await Promise.all(ds.map(async d=>logs[d]=(await KV.get(K('log:'+d),'json'))||[]));
   const qp={};for(const d of recent)if(PC[d]?.quest)qp[d]=PC[d];const boosts={};await Promise.all(Object.keys(qp).map(async d=>boosts[d]=await KV.get('boost:'+d,'json')));
   const tomorrowPack=await KV.get('lessons:'+ptDate(now+864e5),'json');
   const data=PR.parentData({S,g,now,today,logs,packs:qp,tomorrowPack,boosts});data.sandbox=sbx||undefined;
   return new Response(PR.parentShell(data),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});}
 if(P==='/api/state'){if(!S.current)E.next(S,g,pack,now);out=pub();}
 else if(P==='/api/trophies'){const M=[...(S.medals||[]).map(m=>E.medalInfo(m,g)).filter(Boolean),...(S.questMedals||[]).map(q=>({id:'quest:'+q.date,tier:'quest',at:q.at,name:q.name,ic:q.emoji,subject:'Quest',domain:q.title,why:`finishing the quest "${q.title}"`}))].sort((a,b)=>a.at-b.at).reverse();const c={};M.forEach(m=>c[m.tier]=(c[m.tier]||0)+1);out={medals:M,counts:c};}
 else if(P==='/api/map'){const sm=E.summary(S,g,now);out={codes:sm.codes,focus:S.focus,current:S.current?.topicId,progress:{...sm,codes:undefined}};}
 else if(P==='/api/answer'&&req.method==='POST'){if(!S.current)E.next(S,g,pack,now);const x=E.submit(S,g,body.answer??'',now);ev=x.ev;if(x.r.medal)x.r.medal=E.medalInfo(x.r.medal,g);
   if(x.r.done){const md=E.miniAfter(S,g,pack,now,x.r);if(md){x.r.miniDone=md;x.r.askChoice=false;}questCheck(x.r);if(!S.current&&!x.r.askChoice)E.next(S,g,pack,now);}out={...x.r,state:pub()};}
 else if(P==='/api/explore'&&req.method==='POST'){if(!g.byId[body.topicId])return J({error:'unknown topic'},400);const it=E.startMini(S,g,body.topicId,pack,now);if(it.error)return J(it,400);out=pub();}
 else if(P==='/api/mini/quit'&&req.method==='POST'){if(S.mini){S.mini=null;S.current=S.miniHold||null;S.miniHold=null;}if(!S.current)E.next(S,g,pack,now);out=pub();}
 else if(P==='/api/quest/start'&&req.method==='POST'){const d=body.date||today;const qp=PC[d];
   if(qp?.quest&&!qrec(d).done){if(!qrec(d).started&&activeQ().length>=QUEST_CAP)return J({error:'Finish your quest to unlock the next one! 🗝️',paused:true},409);
     S.quests??={};const q=S.quests[d]??={};q.started??=now;S.questFocus=d;pack=await withBoost(qp);if(!S.mini&&S.current&&!String(S.current.packKey||'').startsWith(d+':'))S.current=null;}
   if(!S.current)E.next(S,g,pack,now);out=pub();}
 else if(P==='/api/term'&&req.method==='POST'){const t=String(body.term||'').slice(0,60);if(t)ev.push({event:'term',term:t,topicId:S.current?.topicId,topic:g.byId[S.current?.topicId]?.name});out={ok:true};}
 else if(P==='/api/quests'){
   const A=activeQ(),ps=paused();const packs=await Promise.all([...recent].reverse().map(d=>withBoost(PC[d])));
   out={today,active:A.length,cap:QUEST_CAP,paused:ps,quests:packs.filter(Boolean).map(p=>({...E.questInfo(S,g,p),today:p.date===today,active:A.includes(p.date),focus:pack?.date===p.date,
     waiting:ps&&p.date===today,canStart:!!p.quest&&!qrec(p.date).started&&A.length<QUEST_CAP,boost:p.boost||null}))};}
 else if(P==='/api/next'&&req.method==='POST'){if(!S.current)E.next(S,g,pack,now);out=pub();}
 else if(P==='/api/skipbonus'&&req.method==='POST'){S.current=null;E.next(S,g,pack,now);out=pub();}
 else if(P==='/api/choice'&&req.method==='POST'){const r=E.choose(S,g,body.choice,pack,now);E.next(S,g,pack,now);out={...r,state:pub()};}
 else return J({error:'not found'},404);
 if(migrated&&raw?.topics&&!sbx){/* keep a copy of the pre-v2 record */await KV.put('progress:v1-backup',JSON.stringify(raw));}
 if(JSON.stringify(S)!==S0)await KV.put(K('progress'),JSON.stringify(S));
 if(ev.length){const k=K('log:'+today);const log=(await KV.get(k,'json'))||[];const ts=new Date(now).toISOString();log.push(...ev.map(e=>({ts,...e})));await KV.put(k,JSON.stringify(log));}
 return J(out);}};
function parentHtml(S,g,now,today,log,pack){const sm=E.summary(S,g,now);
 const subj=Object.entries(sm.by).map(([s,b])=>`<tr><td>${esc(s)}</td><td>${b.total}</td><td>${b.mastered+b.review}</td><td>${b.review}</td><td>${b.ready}</td><td>${b.learning}</td><td>${b.locked}</td><td><div class=bar><i style="width:${(100*(b.mastered+b.review)/b.total).toFixed(1)}%"></i></div>${(100*(b.mastered+b.review)/b.total).toFixed(1)}%</td></tr>`).join('');
 const learned=log.filter(l=>l.event==='mastered');const inferred=log.filter(l=>l.event==='inferred').reduce((a,l)=>a+l.count,0);const answers=log.filter(l=>!l.event);
 const direct=Object.entries(S.ts).filter(([,r])=>r.how!=='inferred');
 const frontier=g.topics.filter(t=>['ready','learning'].includes(E.stateOf(S,g,t.id,now))&&t.ageRangeStart>=9).slice(0,25);
 const due=g.topics.filter(t=>E.stateOf(S,g,t.id,now)==='review');
 return `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width"><title>Parent view — Landon</title><style>body{font-family:system-ui,sans-serif;padding:14px;max-width:1100px;margin:auto;color:#222}td,th{border:1px solid #ddd;padding:4px 6px;font-size:14px;text-align:left}table{border-collapse:collapse;margin-bottom:14px}.bar{display:inline-block;width:90px;height:10px;background:#eee;border-radius:5px;margin-right:6px;vertical-align:middle}.bar i{display:block;height:100%;background:linear-gradient(90deg,#ffb300,#ff6d00);border-radius:5px}.ok{color:#2e7d32}.no{color:#c62828}h3{margin-top:22px}</style>
<h2>Parent view — ${esc(S.name)} <small style="font-weight:normal;color:#666">(${today}, times in PT)</small></h2>
<p><b>${sm.pct}%</b> of ${sm.total} Marble topics mastered or inferred (${sm.done}) · ${sm.tot.review} review due · ${sm.tot.ready} ready (frontier) · ${sm.tot.learning} learning · ${sm.tot.locked} locked<br>
Points ${S.points} · Stars ${S.stars} · Solved ${S.solved} · Best streak ${S.bestStreak} · Medals ${(S.medals||[]).length} · Placement ${S.placement.done?'complete':'in progress'} (${S.placement.asked} diagnostic questions) · Today's lesson pack: ${pack?esc(pack.title||pack.date):'none (procedural / self-checks)'}</p>
<h3>Progress map summary</h3><table><tr><th>Subject</th><th>Topics</th><th>Mastered*</th><th>Review due</th><th>Ready</th><th>Learning</th><th>Locked</th><th>Progress</th></tr>${subj}</table><small>*includes topics inferred from mastering later skills (hard prerequisites 95% confidence per step, soft 70%).</small>
<h3>Learned today</h3>${learned.length?`<ul>${learned.map(l=>`<li>${ptTime(l.ts)} — <b>${esc(l.topic)}</b> (${l.how==='self'?'self-check':'shown in answers'})</li>`).join('')}</ul>`:'<p>Nothing mastered yet today.</p>'}<p>Plus ${inferred} earlier skills inferred today from those masteries.</p>
<h3>Today's answers (${answers.length})</h3><table><tr><th>Time (PT)</th><th>Subject › Topic</th><th>Mode</th><th>Question</th><th>Expected</th><th>Given</th><th></th><th>Secs</th></tr>${answers.slice().reverse().map(l=>`<tr><td>${ptTime(l.ts)}</td><td>${esc(l.subject)} › ${esc(l.topic)}</td><td>${esc(l.mode)}${l.stage==='bonus'?' (bonus)':''}</td><td>${esc(l.question)}</td><td>${esc(l.expected)}</td><td>${esc(l.given)}</td><td class=${l.correct?'ok':'no'}>${l.correct?'✅':'❌'}</td><td>${l.elapsedSec??''}</td></tr>`).join('')}</table>
<h3>Review due (${due.length})</h3><p>${due.slice(0,40).map(t=>esc(t.name)).join(' · ')||'None.'}</p>
<h3>Frontier (ready, age 9+, first 25)</h3><p>${frontier.map(t=>`${esc(t.subject)}: ${esc(t.name)}`).join(' · ')}</p>
<h3>Directly assessed topics (${direct.length})</h3><table><tr><th>Topic</th><th>State</th><th>How</th><th>✔</th><th>✘</th><th>Review box</th><th>Next review</th></tr>${direct.map(([id,r])=>`<tr><td>${esc(g.byId[id].subject)} › ${esc(g.byId[id].name)}</td><td>${E.stateOf(S,g,id,now)}</td><td>${r.how}</td><td>${r.c||0}</td><td>${r.w||0}</td><td>${r.st==='mastered'?r.box:''}</td><td>${r.st==='mastered'?ptTime(r.due):''}</td></tr>`).join('')}</table>
<p><a href="/">← back to the app</a></p>`;}
