// Landon's adaptive engine: topic states over the full Marble taxonomy, graph-based placement & inference,
// Leitner spaced review, lesson packs -> procedural math -> kid MCQs -> kid self-check (never the raw assessmentPrompt).
import {G,kindFor,parseNum,gcd} from './gen.js';
const DAY=864e5, BOXES=[1,3,7,21,60], NAME='Landon', TARGET_AGE=10.5;
const PIZZA_ID='mt_e7filQgayF';
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)), pick=a=>a[Math.floor(Math.random()*a.length)];
export function graph(TAX){const byId={},pre={},post={};for(const t of TAX.topics){byId[t.id]=t;pre[t.id]=[];post[t.id]=[];}
  for(const [t,p,h] of TAX.deps)if(byId[t]&&byId[p]){pre[t].push({id:p,h:!!h});post[p].push({id:t,h:!!h});}
  // domain-end topics (no dependents inside the same domain) -> boss battles
  // boss battles: per domain, the 2 deepest "domain end" topics (no dependents inside the same domain)
  const depth={};const dd=id=>depth[id]??=(depth[id]=0,1+Math.max(0,...pre[id].filter(e=>byId[e.id].domain===byId[id].domain).map(e=>dd(e.id))));
  const ends={};for(const t of TAX.topics)if(!post[t.id].some(e=>byId[e.id].domain===t.domain))(ends[t.subject+'|'+t.domain]??=[]).push(t.id);
  const boss=new Set(Object.values(ends).flatMap(a=>a.filter(id=>dd(id)>=3).sort((a,b)=>dd(b)-dd(a)).slice(0,2)));
  return{topics:TAX.topics,byId,pre,post,boss};}
export const blank=()=>({v:2,name:NAME,points:0,stars:0,streak:0,bestStreak:0,solved:0,badges:[],medals:[],firstDone:false,ts:{},current:null,
  focus:null,placement:{done:false,asked:0,per:{},queue:[]},sinceReview:0,sinceChoice:0,recent:[],packSeen:{},itemsServed:0});
export function migrate(old,g){if(old&&old.v===2){if(!old.medals)backfillMedals(old,g);return old;}const S=blank();if(!old)return S;
  for(const k of['points','stars','streak','bestStreak','solved','badges'])if(old[k]!=null)S[k]=old[k];
  S.firstDone=!!old.firstDone&&old.solved>0;
  for(const [id,t] of Object.entries(old.topics||{}))if(g.byId[id])S.ts[id]=t.mastered?{st:'mastered',how:'direct',conf:.9,box:0,due:Date.now()+DAY,c:t.correct,w:t.incorrect}:{st:'learning',how:'direct',c:t.correct,w:t.incorrect,lvl:old.level||3};
  backfillMedals(S,g);return S;}
// medals: one per directly-mastered topic (not inferred, not self-rated); boss wins are legendary
export function tierOf(g,id,boss){return boss?'legendary':g.byId[id]?.tier||'bronze';}
function backfillMedals(S,g){S.medals=[];for(const [id,r] of Object.entries(S.ts))if(r.st==='mastered'&&r.how==='direct'&&g.byId[id])S.medals.push({id,tier:tierOf(g,id,false),at:r.at||Date.now()});S.medals.sort((a,b)=>a.at-b.at);}
function award(S,g,id,boss,now){S.medals??=[];if(S.medals.some(m=>m.id===id))return null;const m={id,tier:tierOf(g,id,boss),at:now,boss:boss||undefined};S.medals.push(m);return m;}
// ---------- topic states ----------
export function stateOf(S,g,id,now){const r=S.ts[id];if(r?.st==='mastered')return r.due<=now?'review':'mastered';if(r?.st==='learning')return 'learning';
  return g.pre[id].every(e=>!e.h||S.ts[e.id]?.st==='mastered')?'ready':'locked';}
export function summary(S,g,now){const by={},tot={mastered:0,review:0,ready:0,learning:0,locked:0};let codes='';
  for(const t of g.topics){const s=stateOf(S,g,t.id,now);tot[s]++;codes+={mastered:'m',review:'v',ready:'r',learning:'l',locked:'x'}[s];
    const b=by[t.subject]??={total:0,mastered:0,review:0,ready:0,learning:0,locked:0};b.total++;b[s]++;}
  const done=tot.mastered+tot.review;return{codes,total:g.topics.length,done,pct:Math.round(1000*done/g.topics.length)/10,tot,by};}
// ---------- inference ----------
function setMastered(S,g,id,how,conf,now,ev){const r=S.ts[id]||{};const was=r.st==='mastered';
  Object.assign(r,{st:'mastered',how,conf,box:how==='inferred'?2:0,due:now+(how==='inferred'?R(7,30):BOXES[0])*DAY,at:now});S.ts[id]=r;
  if(!was&&how!=='inferred')ev.push({event:'mastered',topicId:id,topic:g.byId[id].name,how});}
function inferDown(S,g,id,conf,now,ev){const st=[[id,conf]];let n=0;
  while(st.length){const [x,c]=st.pop();for(const e of g.pre[x]){const c2=c*(e.h?.95:.7);if(c2<.5)continue;const r=S.ts[e.id];
    if(r?.st==='mastered'&&(r.how!=='inferred'||r.conf>=c2))continue; if(r&&r.st==='learning'&&r.how==='direct')continue;
    S.ts[e.id]={...(r||{}),st:'mastered',how:'inferred',conf:Math.round(c2*100)/100,box:2,due:now+R(10,40)*DAY,at:now};n++;st.push([e.id,c2]);}}
  if(n)ev.push({event:'inferred',topicId:id,count:n});return n;}
function failUp(S,g,id){const st=[id];let n=0;while(st.length){const x=st.pop();for(const e of g.post[x]){const r=S.ts[e.id];if(r?.how==='inferred'){delete S.ts[e.id];n++;st.push(e.id);}}}return n;}
function unknown(S,id){const r=S.ts[id];return !r||(r.st!=='mastered'&&!(r.how==='direct'&&r.st==='learning'));}
// binary search along prerequisite chain: middle depth of unknown hard ancestors
function probeDown(S,g,id){const seen=new Map([[id,0]]),q=[id];while(q.length){const x=q.shift();for(const e of g.pre[x])if(e.h&&!seen.has(e.id)){seen.set(e.id,seen.get(x)+1);q.push(e.id);}}
  const c=[...seen].filter(([x,d])=>d>0&&unknown(S,x));if(!c.length)return null;const max=Math.max(...c.map(x=>x[1])),mid=Math.max(1,Math.ceil(max/2));
  const at=c.filter(x=>x[1]===mid);return pick(at.length?at:c)[0];}
function probeUp(S,g,id){const sub=g.byId[id].subject,seen=new Map([[id,0]]),q=[id];while(q.length){const x=q.shift();if(seen.get(x)>=4)continue;for(const e of g.post[x])if(!seen.has(e.id)&&g.byId[e.id].subject===sub){seen.set(e.id,seen.get(x)+1);q.push(e.id);}}
  const a0=Math.max(8,g.byId[id].ageRangeStart),dom=g.byId[id].domain;let c=[...seen].filter(([x,d])=>d>0&&unknown(S,x)&&g.byId[x].ageRangeStart>=a0&&g.byId[x].ageRangeStart<=12);
  const sd=c.filter(([x])=>g.byId[x].domain===dom);if(sd.length)c=sd;if(!c.length)return null;const max=Math.max(...c.map(x=>x[1])),mid=Math.ceil(max/2);
  const at=c.filter(x=>x[1]===mid);return pick(at.length?at:c)[0];}
function ancestors(g,id){const s=new Set(),q=[id];while(q.length)for(const e of g.pre[q.pop()])if(!s.has(e.id)){s.add(e.id);q.push(e.id);}return s.size;}
// ---------- placement ----------
const BUDGET={Mathematics:6,Science:4,English:4,History:3,'Personal & Social Development':2,'Life Skills':2,Computing:2,'Learning to Learn':2};
function seedPlacement(S,g,pack){const subs=Object.keys(BUDGET),q=[];const packIds=new Set((pack?.topics||[]).map(t=>t.topicId));
  for(const sub of subs){const c=g.topics.filter(t=>t.subject===sub&&t.ageRangeStart>=9&&t.ageRangeStart<=11&&unknown(S,t.id));
    c.sort((a,b)=>(packIds.has(b.id)-packIds.has(a.id))*100+(ancestors(g,b.id)-ancestors(g,a.id))-(Math.abs(a.ageRangeStart-TARGET_AGE)-Math.abs(b.ageRangeStart-TARGET_AGE))*2);
    if(c[0])q.push(c[0].id);}
  const m=q.shift();S.placement.queue=[m,...q];}
function placementNext(S,g,pack){const P=S.placement;if(P.done)return null;if(!P.seeded){const keep=P.queue;seedPlacement(S,g,pack);P.queue=[...keep,...P.queue];P.seeded=true;}
  while(P.queue.length){const id=P.queue.shift();const sub=g.byId[id].subject;if((P.per[sub]||0)>=BUDGET[sub])continue;if(!unknown(S,id))continue;return id;}
  P.done=true;return null;}
function placementResult(S,g,id,ok){const P=S.placement;const sub=g.byId[id].subject;P.per[sub]=(P.per[sub]||0)+1;P.asked++;
  if((P.per[sub]||0)>=BUDGET[sub])return;const nx=ok?probeUp(S,g,id):probeDown(S,g,id);if(nx)P.queue.unshift(nx);}
// ---------- content ----------
// fuzzy text matching: case/accents/punctuation/articles ignored, plural~singular, small typos forgiven
const stem=w=>w.length>4&&w.endsWith('ies')?w.slice(0,-3)+'y':w.length>4&&/(ches|shes|sses|xes|oes)$/.test(w)?w.slice(0,-2):w.length>3&&w.endsWith('s')&&!w.endsWith('ss')?w.slice(0,-1):w;
const stemAll=s=>norm(s).split(' ').map(stem).join(' ');
function lev(a,b){if(a===b)return 0;const m=a.length,n=b.length;if(Math.abs(m-n)>2)return 9;let p=[...Array(n+1).keys()];for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c;}return p[n];}
export function fuzzyEq(x,y){const a=stemAll(x),b=stemAll(y);if(!a||!b)return false;if(a===b)return true;if(/\d/.test(a+b))return false;const L=Math.min(a.length,b.length);return lev(a,b)<=(L>=8?2:L>=4?1:0);}
// creative answers: any sensible word/phrase (not junk, not the subject itself)
const JUNK=new Set(['idk','dunno','i dont know','i don t know','nothing','none','no','yes','ok','okay','asdf','qwerty','test','lol','um','hmm','whatever','something','anything','stuff','thing','blah','x','xx','xxx','na','n a','pass','skip','help']);
function creativeOk(it,a){const n=norm(a);if(!n||n.replace(/[^a-z]/g,'').length<(it.minLength||2))return false;if(/\d/.test(n)&&!it.allowNumbers)return false;
  if(JUNK.has(n)||(it.block||[]).some(b=>fuzzyEq(b,n)))return false;if((it.notAnswers||[]).some(b=>fuzzyEq(b,n)))return false;
  const words=n.split(' ');if(words.length>(it.maxWords||5))return false;
  return words.every(w=>/[aeiouy]/.test(w)&&!/(.)\1\1/.test(w)&&w.length<=20&&!/[bcdfghjklmnpqrstvwxz]{5}/.test(w));}
const norm=s=>String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9.\/\s-]/g,'').replace(/\b(the|a|an)\b/g,'').replace(/\s+/g,' ').trim();
function packQ(S,pack,id){if(!pack)return null;const t=pack.topics.find(x=>x.topicId===id);if(!t)return null;
  for(let i=0;i<t.questions.length;i++){const k=`${pack.date}:${id}:${i}`;if(!S.packSeen[k]&&!t.questions[i]._skip)return{t,q:t.questions[i],i,key:k};}return null;}
const OPEN=['Hey Landon! ','Quick one! ','Ooh, try this! ','Your turn! ',''];
function opener(q){const o=pick(OPEN);return o&&q.split(' ').length+o.split(' ').length-1<=15?o+q:q;}
function kidMcq(g,id){const t=g.byId[id];if(!t.kq)return null;const ch=[t.ka,...t.kw].sort(()=>Math.random()-.5);
  return{kind:'quiz',type:'mc',q:opener(t.kq),choices:ch,answer:t.ka,hint:`Think it through. Which one makes the most sense?`,explain:`It's "${t.ka}".`};}
function selfCheck(g,id){const t=g.byId[id];
  return{kind:'self',type:'self',q:t.self||`Hey Landon! Could you explain ${t.sn||t.name}?`,choices:['👍 Got it!','🤔 Sort of','🌱 Not yet']};}
// interactive pack formats -> internal item. Answers stay server-side; the client only gets what it must render.
const shuf=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
const shufNot=a=>{if(a.length<2)return[...a];let b;do b=shuf(a);while(b.join('|')===a.join('|'));return b;};
function packItem(pq,q){const graded=pq.t.questions.filter(x=>!CARD.includes(x.type)&&!x._skip).length;
  const it={kind:'pack',packN:graded,deep:!!pq.t.deepDive,packReview:!!pq.t.review,ptype:q.type,q:q.prompt,hint:q.hint,explain:q.explanation,packKey:pq.key,format:q.format||pq.t.format,scene:q.scene,tpl:q.template,stage:'main'};
  switch(q.type){
   case 'mc':return{...it,type:'mc',choices:q.choices,answer:q.answer};
   case 'picture':return{...it,type:'picture',choices:q.choices.map(c=>c.label),pics:q.choices.map(c=>c.pic),answer:q.answer};
   case 'blank':return q.choices?{...it,type:'mc',blank:true,choices:q.choices,answer:q.answer}:(q.creative?{...it,type:'input',blank:true,creative:true,answer:q.answer,accept:[...(q.accept||[]),...(q.acceptedAnswers||[])],notAnswers:q.notAnswers,block:q.block,celebrate:q.celebrate}:{...it,type:'input',blank:true,answer:q.answer,accept:[...(q.accept||[]),...(q.acceptedAnswers||[])],fuzzy:q.fuzzy!==false});
   case 'numeric':return{...it,type:'input',numeric:true,answer:q.answer,tol:q.tolerance};
   case 'text':return{...it,type:'input',answer:q.answer,accept:[...(q.accept||[]),...(q.acceptedAnswers||[])],fuzzy:q.fuzzy!==false};
   case 'creative':return{...it,type:'input',creative:true,answer:q.answer,accept:[...(q.accept||[]),...(q.acceptedAnswers||[])],notAnswers:q.notAnswers,block:q.block,minLength:q.minLength,maxWords:q.maxWords,celebrate:q.celebrate,placeholder:q.placeholder||'Your idea!'};
   case 'order':return{...it,type:'order',items:shufNot(q.items),answer:q.items.join('|'),explain:q.explanation||q.items.join(' → ')};
   case 'match':return{...it,type:'match',left:q.pairs.map(p=>p[0]),right:shufNot(q.pairs.map(p=>p[1])),pairs:q.pairs,answer:q.pairs.map(p=>p.join(' = ')).join(' · ')};
   case 'truefalse':return{...it,type:'truefalse',statements:q.statements.map(x=>x[0]),tf:q.statements.map(x=>x[1]?'T':'F').join(''),answer:q.statements.map(x=>`${x[0]} → ${x[1]?'True':'False'}`).join(' · '),timed:q.seconds||30};
   case 'numberline':return{...it,type:'numberline',line:{min:q.min,max:q.max,step:q.step??1,labels:q.labels},answer:String(q.answer),tol:q.tolerance??(q.step??1)/2};
   case 'fracbar':return{...it,type:'fracbar',parts:q.parts,answer:String(q.answer)};
   case 'why':case 'fact':return{...it,type:'card',card:q.type,title:q.title,body:q.body||q.prompt,q:q.title||q.prompt,emoji:q.emoji};}
  return{...it,type:'input',answer:q.answer};}
export const CARD=['why','fact'];
export function buildItem(S,g,id,mode,pack,now){const t=g.byId[id],r=S.ts[id];let it;
  const pq=mode!=='review'?packQ(S,pack,id):null;
  if(pq){const q=pq.q;it=packItem(pq,q);
    if(!S.packSeen[`${pack.date}:${id}:intro`]){it.intro=pq.t.intro;S.packSeen[`${pack.date}:${id}:intro`]=1;}}
  else if(kindFor(t)){const lvl=mode==='review'?Math.max(2,(r?.lvl||4)-1):mode==='diagnostic'?(t.ageRangeStart>=10?4:3):(r?.lvl||(t.ageRangeStart>=10?3:2));const p=G[kindFor(t)](lvl);
    it={kind:'math',type:'input',q:p.q,answer:p.a,cmp:p.cmp,needSimplest:p.needSimplest,hint:p.hint,explain:p.explain,vis:p.vis,bonus:p.bonus,lvl};}
  else it=kidMcq(g,id)||selfCheck(g,id);
  if(!it.format)it.format=mode==='review'?'review':mode==='diagnostic'?'explore':g.boss.has(id)?'boss':(it.kind==='math'&&Math.random()<.25)?'timed':(it.type==='mc'?'minigame':'quest');
  if(mode==='review')it.format='review';if(mode==='diagnostic')it.format='explore';
  if(it.format==='timed'&&!it.timed)it.timed=it.kind==='math'?60:45;if(it.type==='card'){it.timed=null;it.format='card';}
  if(it.format==='boss'&&it.type!=='card')it.boss=it.kind==='quiz'?{max:1,hp:1}:{max:3,hp:3-Math.min(2,r?.streak||0)};
  return{...it,id:now+'-'+R(0,999),topicId:id,mode,tries:0,stage:'main',issued:now};}
// ---------- next item ----------
function score(S,g,id,packIds){const t=g.byId[id];let s=-Math.abs(t.ageRangeStart-TARGET_AGE)*4;if(packIds.has(id))s+=40;if(S.ts[id]?.st==='learning')s+=15;if(kindFor(t))s+=4;
  if(t.ageRangeStart<8)s-=30;const recentSubs=S.recent.slice(-3).map(x=>g.byId[x]?.subject);if(recentSubs.filter(x=>x===t.subject).length>=2)s-=12;return s+Math.random()*6;}
function pickFocus(S,g,pack,now,opt={}){const packIds=new Set((pack?.topics||[]).map(t=>t.topicId).filter(id=>g.byId[id]&&packQ(S,pack,id)));
  let c=g.topics.filter(t=>{const s=stateOf(S,g,t.id,now);return s==='ready'||s==='learning';});
  if(opt.subject)c=c.filter(t=>t.subject===opt.subject);if(opt.notSubject)c=c.filter(t=>t.subject!==opt.subject&&t.subject!==opt.notSubject);if(opt.domain)c=c.filter(t=>t.domain===opt.domain);
  if(opt.minAge)c=c.filter(t=>t.ageRangeStart>=opt.minAge);if(opt.maxAge)c=c.filter(t=>t.ageRangeStart<=opt.maxAge);
  if(!c.length)return null;c.sort((a,b)=>score(S,g,b.id,packIds)-score(S,g,a.id,packIds));return c[0].id;}
export function next(S,g,pack,now){
  if(!S.firstDone){S.firstDone=true;const it={kind:'math',type:'input',q:'Your pizza has 8 slices. You eat 3, your friend eats 2. What fraction is left?',answer:'3/8',
    hint:'Count the slices that are still on the plate: 8 − 3 − 2. Put that number over 8, the total slices.',explain:'8 − 3 − 2 = 3 slices left out of 8, so 3/8 of the pizza is left!',
    vis:{type:'pizza',slices:8,eaten:5},bonus:{q:'Bonus ⭐: write 3/8 as a decimal!',a:'0.375'},first:true,format:'explore',lvl:4};
    S.current={...it,id:now+'-0',topicId:PIZZA_ID,mode:'diagnostic',tries:0,stage:'main',issued:now};return S.current;}
  const due=g.topics.filter(t=>stateOf(S,g,t.id,now)==='review').sort((a,b)=>S.ts[a.id].due-S.ts[b.id].due);
  let id,mode;
  const qa=questActive(S,pack);
  if(!qa&&due.length&&S.itemsServed>=3&&(S.sinceReview>=9||Math.random()<.08)){const direct=due.filter(t=>S.ts[t.id].how!=='inferred');id=(direct[0]||due[0]).id;mode='review';}
  const packNext=()=>{if(!pack)return null;
    if(pack.quest){const st=pack.topics.find(t=>g.byId[t.topicId]&&packQ(S,pack,t.topicId));return st?st.topicId:null;} // quests run stage by stage
    const cand=pack.topics.filter(t=>g.byId[t.topicId]&&packQ(S,pack,t.topicId)&&!(S.ts[t.topicId]?.st==='mastered'&&S.ts[t.topicId].how!=='inferred'));
    if(!cand.length)return null;const cur=cand.find(t=>t.topicId===S.packFocus);if(cur)return cur.topicId;
    const recent=S.recent.slice(-2).map(x=>g.byId[x]?.subject);const c2=cand.filter(t=>!recent.includes(g.byId[t.topicId].subject));return S.packFocus=(c2[0]||cand[0]).topicId;};
  const placeNext=()=>placementNext(S,g,pack);
  const order=qa?[[packNext,'learn']]:S.itemsServed%2?[[placeNext,'diagnostic'],[packNext,'learn']]:[[packNext,'learn'],[placeNext,'diagnostic']];
  if(!id)for(const [f,m] of order){const x=f();if(x){id=x;mode=m;break;}}
  if(!id){if(S.focus&&['ready','learning'].includes(stateOf(S,g,S.focus,now)))id=S.focus;else id=S.focus=pickFocus(S,g,pack,now);mode='learn';}
  if(!id){id=g.topics[0].id;mode='learn';}
  S.sinceReview=mode==='review'?0:S.sinceReview+1;S.itemsServed++;S.recent=[...S.recent.slice(-9),id];
  S.current=buildItem(S,g,id,mode,pack,now);return S.current;}
// ---------- grading ----------
function grade(it,ans,isBonus){const a=String(ans??'').trim();if(isBonus){const g=parseNum(a),e=parseNum(it.bonus.a);return Math.abs(g-e)<1e-6;}
  if(it.type==='self')return a;
  if(it.type==='order')return a.split('|').map(norm).join('|')===it.answer.split('|').map(norm).join('|');
  if(it.type==='match'){const m=Object.fromEntries(a.split('|').map(x=>x.split('=')).map(([l,r])=>[norm(l),norm(r||'')]));return it.pairs.every(([l,r])=>m[norm(l)]===norm(r));}
  if(it.type==='truefalse')return a.toUpperCase().replace(/[^TF]/g,'')===it.tf;
  if(it.type==='numberline'){const x=parseNum(a),e=parseNum(it.answer);return !isNaN(x)&&Math.abs(x-e)<=it.tol+1e-9;}
  if(it.type==='fracbar'){const x=parseNum(a),e=parseNum(it.answer);return !isNaN(x)&&Math.abs(x-e)<1e-6;}
  if(it.type==='picture')return norm(a)===norm(it.answer);
  if(it.type==='mc')return norm(a)===norm(it.answer)||(/^[a-d]$/i.test(a)&&it.choices[a.toLowerCase().charCodeAt(0)-97]===it.answer);
  if(it.kind==='math'){if(it.cmp)return a.replace(/\s/g,'')===it.answer;const x=parseNum(a),e=parseNum(it.answer);if(isNaN(x)||Math.abs(x-e)>1e-6)return false;
    if(it.needSimplest){const m=a.match(/^(\d+)\s*\/\s*(\d+)$/);if(m&&gcd(+m[1],+m[2])>1)return 'notSimplest';}return true;}
  if(it.creative){if(fuzzyEq(it.answer,a))return true;if((it.notAnswers||[]).some(b=>fuzzyEq(b,a)))return false;return (it.accept||[]).some(x=>fuzzyEq(x,a))||creativeOk(it,a)?'creative':false;}
  if(it.numeric){const m0=a.replace(/[$,]/g,'').match(/^\s*(-?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?|-?\.\d+)\s*[a-z%][a-z %.]*$/i);const x=parseNum(m0?m0[1]:a.replace(/[$,]/g,'').replace(/\s*(cups?|grams?|g|weeks?|hours?|hrs?|dollars?|cookies?|years?)\.?$/i,'')),e=parseNum(it.answer);return !isNaN(x)&&Math.abs(x-e)<=(it.tol??1e-6);}
  return [it.answer,...(it.accept||[])].some(x=>norm(x)===norm(a)||(it.fuzzy&&it.kind==='pack'&&fuzzyEq(x,a)));}
const praise=['Amazing, Landon! 🎉','You nailed it! 🌟','Brilliant thinking! 🧠','Wow, superstar! ⭐','That\'s exactly right! 🙌','You\'re on fire! 🔥'];
const comfort=['Ooh, so close! Let\'s think it through together.','Good try! Mistakes help our brains grow. 🌱','Not quite — but I love that you tried!'];
export function submit(S,g,answer,now){const it=S.current;if(!it)return{error:'no item'};const ev=[],r={};const isBonus=it.stage==='bonus';const t=g.byId[it.topicId];
  if(it.type==='card'){S.packSeen[it.packKey]=1;S.points+=2;S.current=null;ev.push({event:'card',card:it.card,topicId:it.topicId,topic:t.name,title:it.q});return finish(S,{done:true,correct:true,card:true,jane:it.card==='why'?'Now you know WHY it works! 🧠 +2':'Cool fact unlocked! 🤩 +2'},ev,true);}
  const rec=S.ts[it.topicId]??={st:'learning',how:'direct',c:0,w:0,lvl:it.lvl||3,streak:0};rec.c??=0;rec.w??=0;rec.streak??=0;
  const ok=grade(it,answer,isBonus);const logE={topicId:it.topicId,topic:t.name,subject:t.subject,mode:it.mode,format:it.format,qtype:it.ptype||it.kind,pack:it.packKey?it.packKey.split(':')[0]:undefined,mini:it.mini||undefined,level:it.lvl,stage:it.stage,question:isBonus?it.bonus.q:it.q,expected:isBonus?it.bonus.a:(it.type==='self'?'(self-check)':it.answer),given:String(answer),correct:it.type==='self'?answer==='yes':ok===true||ok==='creative',creative:ok==='creative'||undefined,try:it.tries+1,elapsedSec:Math.round((now-it.issued)/1000)};
  ev.push(logE);
  if(isBonus){if(ok){S.points+=15;S.stars++;r.jane='BONUS! You\'re a decimal wizard! 🧙‍♂️ +15 points and a ⭐';r.correct=true;}else{r.jane=`Good try! ${it.bonus.a} is the decimal. Tip: divide the top number by the bottom number.`;r.reveal=it.bonus.a;r.correct=false;}
    r.done=true;S.current=null;return finish(S,r,ev);}
  if(it.type==='self'){S.current=null;r.done=true;rec.last=now;
    if(answer==='yes'){S.points+=5;r.correct=true;setMastered(S,g,it.topicId,'self',.75,now,ev);inferDown(S,g,it.topicId,.75,now,ev);r.jane=`Awesome, I believe in you! ⭐ +5 points. "${t.sn||t.name}" goes on your map!`;}
    else{rec.st='learning';rec.how='direct';r.correct=false;S.points+=2;r.jane=answer==='kinda'?`Thanks for being honest! We'll practise "${t.sn||t.name}" together. +2 points for honesty 💜`:`No worries — that's what I'm here for! 🌱 +2 points for honesty.`;
      if(answer==='no'){const p=probeDown(S,g,it.topicId);if(p&&it.mode!=='diagnostic')S.focus=p;}}
    if(it.mode==='diagnostic')placementResult(S,g,it.topicId,answer==='yes');
    if(it.mode==='review'){if(answer==='yes'){rec.box=Math.min(4,(rec.box||0)+1);rec.due=now+BOXES[rec.box]*DAY;}else{rec.st='learning';}}
    return finish(S,r,ev);}
  if(ok==='notSimplest'){it.tries++;return finish(S,{correct:false,retry:true,jane:'Yes, that\'s the right amount! Can you simplify it even more? 🤏'},ev);}
  if(it.packKey&&(ok||it.tries>=1))S.packSeen[it.packKey]=1;
  if(ok){rec.c++;rec.last=now;const fast=it.timed&&(now-it.issued)/1000<=it.timed;const pts=(it.tries?5:10+(it.lvl||3)*2)+(fast?5:0)+(it.format==='boss'?5:0);
    S.points+=pts;S.streak++;S.bestStreak=Math.max(S.bestStreak,S.streak);S.solved++;if(S.streak%3===0)S.stars++;r.correct=true;
    r.jane=`${pick(praise)} +${pts} points${fast?' (speed bonus ⚡)':''}${S.streak>=3?` — ${S.streak} in a row!`:''}`;
    if(ok==='creative'){const g0=String(answer).trim();r.creative=true;r.jane=(it.celebrate||'Nice! "{given}" works! "{answer}" is the classic one, but your idea is great too. 🎨').replace(/\{given\}/g,g0).replace(/\{answer\}/g,it.answer)+` +${pts} points`;}
    if(it.packReview&&rec.st==='mastered'){if(!it.tries&&rec.due<=now+DAY){rec.box=Math.min(4,(rec.box||0)+1);rec.due=now+BOXES[rec.box]*DAY;r.jane+=' Memory check passed! 🧠';}}
    else if(it.mode==='review'){if(it.practice){}else if(!it.tries){rec.box=Math.min(4,(rec.box||0)+1);rec.due=now+BOXES[rec.box]*DAY;r.jane+=` Memory check passed — see you in ${BOXES[rec.box]} days, "${t.sn||t.name}"! 🧠`;}else rec.due=now+DAY;}
    else if(it.mode==='diagnostic'){if(!it.tries){setMastered(S,g,it.topicId,'direct',.9,now,ev);const n=inferDown(S,g,it.topicId,.9,now,ev);const md=award(S,g,it.topicId,false,now);if(md)r.medal=md;r.mastered=t.sn||t.name;r.inferred=n;
        if(n)r.jane+=` That tells me you already know ${n} earlier skill${n>1?'s':''} — I lit them up on your map! 🗺️`;}
      else{rec.st='learning';rec.how='direct';}placementResult(S,g,it.topicId,!it.tries);}
    else if(!it.tries){rec.streak=(rec.streak||0)+1;if(it.kind==='math'&&(rec.lvl||3)<5){rec.lvl=(rec.lvl||3)+1;r.levelUp=rec.lvl;}
      const need=it.kind==='quiz'?1:it.kind==='pack'?Math.min(it.format==='boss'||it.deep?3:2,it.packN):it.format==='boss'?3:it.kind==='math'?3:2;if(it.boss)r.boss={max:it.boss.max,hp:Math.max(0,it.boss.max-rec.streak)};
      if(rec.streak>=need){setMastered(S,g,it.topicId,'direct',.9,now,ev);const n=inferDown(S,g,it.topicId,.9,now,ev);S.badges.push(t.sn||t.name);const md=award(S,g,it.topicId,it.format==='boss',now);if(md)r.medal=md;r.mastered=t.sn||t.name;r.inferred=n;S.focus=null;
        r.jane+=it.format==='boss'?` 💥 You defeated the ${t.domain} BOSS! "${t.sn||t.name}" mastered! 🏆`:` You MASTERED "${t.sn||t.name}"! 🏆`;}}
    if(it.bonus){it.stage='bonus';it.tries=0;r.bonus=it.bonus.q;r.jane+=' Want a bonus challenge?';}else{r.done=true;S.current=null;}
    return finish(S,r,ev);}
  it.tries++;S.streak=0;
  if(it.tries===1){r.retry=true;r.hint=it.hint;r.correct=false;r.jane=`${pick(comfort)} Here's a hint: ${it.hint}`;return finish(S,r,ev);}
  rec.streak=0;rec.last=now;r.correct=false;r.reveal=it.answer;
  if(it.kind==='pack'){/* learning moment: show the answer kindly, small points, no big penalty */rec.learn=(rec.learn||0)+1;S.points+=2;r.learningMoment=true;logE.learningMoment=true;
    r.jane=`Learning moment! 🌱 The answer is "${String(it.answer).replace(/\|/g," → ")}". ${it.explain} +2 points for sticking with it! 💪`;}
  else{rec.w++;r.jane=`Let me show you how: ${it.explain} You'll get the next one! 💪`;}
  if(it.packReview&&rec.st==='mastered'){rec.due=Math.min(rec.due,now+DAY);ev.push({event:'reviewMiss',topicId:it.topicId,topic:t.name});}
  else if(it.mode==='review'&&it.practice){}
  else if(it.mode==='review'){rec.st='learning';rec.how='direct';rec.box=0;r.jane+=` We'll practise "${t.sn||t.name}" again soon.`;ev.push({event:'demoted',topicId:it.topicId,topic:t.name});}
  else if(it.mode==='diagnostic'){rec.st='learning';rec.how='direct';failUp(S,g,it.topicId);placementResult(S,g,it.topicId,false);}
  else if(it.kind==='pack'){}
  else{if(it.kind==='math'&&(rec.lvl||3)>1){rec.lvl--;r.levelDown=rec.lvl;}rec.wrongInRow=(rec.wrongInRow||0)+1;
    if(rec.wrongInRow>=2){rec.wrongInRow=0;const p=probeDown(S,g,it.topicId);if(p){S.focus=p;r.jane+=` Let's power up with "${g.byId[p].sn||g.byId[p].name}" first.`;}}}
  r.done=true;S.current=null;return finish(S,r,ev);}
function finish(S,r,ev,noChoice){if(r.done&&!noChoice&&!S.mini){S.sinceChoice++;if(S.sinceChoice>=6){r.askChoice=true;S.sinceChoice=0;}}return{r,ev};}
export function choose(S,g,c,pack,now){const cur=S.focus&&g.byId[S.focus];let msg='Keep going — you\'re doing great!',id=null;
  if(c==='harder'){id=pickFocus(S,g,pack,now,{subject:cur?.subject,minAge:(cur?.ageRangeStart||10)+1});msg='Ooh, a challenge! Let\'s go! 🚀';}
  else if(c==='easier'){if(cur&&S.ts[S.focus]?.lvl>1)S.ts[S.focus].lvl--;else id=pickFocus(S,g,pack,now,{subject:cur?.subject,maxAge:(cur?.ageRangeStart||10)-1});msg='Great choice — practice makes perfect!';}
  else if(c==='different'){id=pickFocus(S,g,pack,now,{notSubject:cur?.subject||'Mathematics'});msg=id?`Something new: ${g.byId[id].sn||g.byId[id].name}! 🎨`:msg;}
  else if(c==='fractions'){id=pickFocus(S,g,pack,now,{domain:'Fractions'});msg='Back to fractions! 🍕';}
  if(id)S.focus=id;S.current=null;return{jane:msg};}
export function publicItem(it,g){if(!it)return null;const t=g.byId[it.topicId];const b=it.stage==='bonus';
  return{id:it.id,topicId:it.topicId,topic:{name:t.sn||t.name,subject:t.subject,domain:t.domain,ic:t.ic},q:b?it.bonus.q:it.q,type:b?'input':it.type,choices:b?null:it.choices,vis:it.vis,ptype:it.ptype,creative:it.creative,placeholder:it.placeholder,pics:it.pics,items:it.items,left:it.left,right:it.right,statements:it.statements,line:it.line,parts:it.parts,blank:it.blank,card:it.card,body:it.body,emoji:it.emoji,scene:it.scene,tpl:it.tpl,mini:it.mini,stage:it.stage,mode:it.mode,format:b?'bonus':it.format,intro:b?null:it.intro,timed:b?null:it.timed,boss:it.boss,level:it.lvl,issued:it.issued};}
export function medalInfo(m,g){const t=g.byId[m.id];if(!t)return null;return{id:m.id,tier:m.tier,at:m.at,boss:!!m.boss,name:t.sn||t.name,ic:t.ic,subject:t.subject,domain:t.domain,why:t.kq?`${t.kq} → ${t.ka}`:t.self};}
// upgrade an in-flight old-style self-check (raw assessmentPrompt) to the kid-friendly item, keeping its mode
export function refresh(S,g,pack,now){const c=S.current;if(c&&c.kind==='self'&&/Yes, I can/.test(c.choices?.[0]||'')&&g.byId[c.topicId]){S.current=buildItem(S,g,c.topicId,c.mode,pack,now);return true;}return false;}

// ---------- quests ----------
export function questActive(S,pack){if(!pack?.quest)return false;const q=S.quests?.[pack.date];return !!(q?.started&&!q.done);}
export function questInfo(S,g,pack){if(!pack)return null;const Q=pack.quest||{},rec=S.quests?.[pack.date]||{};
  const stages=pack.topics.map((t,i)=>{const live=t.questions.map((q,j)=>[q,j]).filter(([q])=>!q._skip),n=live.length,d=live.filter(([,j])=>S.packSeen[`${pack.date}:${t.topicId}:${j}`]).length,tp=g.byId[t.topicId];
    return{name:t.stage?.name||t.intro?.title||tp?.sn||t.topicId,emoji:t.stage?.emoji||t.intro?.emoji||tp?.ic||'⭐',n,done:d,complete:d>=n,boss:t.format==='boss',deep:!!t.deepDive,review:!!t.review};});
  const total=stages.reduce((a,s)=>a+s.n,0),done=stages.reduce((a,s)=>a+s.done,0);
  return{date:pack.date,isQuest:!!pack.quest,title:Q.title||pack.title||('Adventure '+pack.date),hook:Q.hook||'',emoji:Q.emoji||'🗺️',medal:Q.medal||{name:(pack.title||'Adventure')+' medal',emoji:'🏅'},
    stages,current:stages.findIndex(s=>!s.complete),total,done,pct:total?Math.round(100*done/total):0,started:rec.started||null,completed:rec.done||null};}
// ---------- map mini-sessions ("Explore now!" on green/blue stones, "Practice now" on orange ones) ----------
export function startMini(S,g,id,pack,now){const s=stateOf(S,g,id,now);if(!['ready','learning','review'].includes(s))return{error:'That stone is not open yet!'};
  const t=g.byId[id],math=!!kindFor(t),review=s==='review';
  S.mini={topicId:id,mode:review?'review':'learn',left:review?(math?2:1):(math?3:2),n:0,ret:t.subject,startedAt:now};
  S.miniHold=S.current&&S.current.topicId!==id?S.current:null;return miniItem(S,g,pack,now);}
function miniItem(S,g,pack,now){const M=S.mini;let mode=M.mode,it;
  if(mode==='learn'&&M.n>0&&!kindFor(g.byId[M.topicId])&&!packQ(S,pack,M.topicId)){it={...selfCheck(g,M.topicId),format:'explore',id:now+'-'+R(0,999),topicId:M.topicId,mode:'learn',tries:0,stage:'main',issued:now};}
  else it=buildItem(S,g,M.topicId,mode,pack,now);
  it.mini={n:M.n+1,of:M.n+M.left,mode:M.mode};if(M.mode==='review'&&M.n>0)it.practice=true;if(M.mode==='learn'&&it.format==='review')it.format='explore';
  M.n++;M.left--;S.current=it;return it;}
// after an answer is done: next mini item, or end the mini-session (returns summary)
export function miniAfter(S,g,pack,now,r){const M=S.mini;if(!M)return null;
  const st=stateOf(S,g,M.topicId,now),mastered=M.mode==='learn'&&S.ts[M.topicId]?.st==='mastered';
  if(M.left>0&&!mastered&&!(M.mode==='review'&&st==='mastered'&&M.n>=1&&!kindFor(g.byId[M.topicId]))){miniItem(S,g,pack,now);return null;}
  const t=g.byId[M.topicId];S.mini=null;S.current=S.miniHold||null;S.miniHold=null;
  return{topicId:M.topicId,name:t.sn||t.name,subject:M.ret,state:st,mastered:!!mastered||(M.mode==='review'&&st==='mastered')};}
// catch-up boost for an unfinished quest (KV boost:<questDate>): shorter remaining stages, extra hints, a cheer message
export function applyBoost(pack,b){const p=JSON.parse(JSON.stringify(pack));const CARDS=['why','fact'];
  for(const t of p.topics){const n=b.trim?.[t.topicId];if(n>0){let g=0;for(const q of t.questions)if(!CARDS.includes(q.type)&&++g>n)q._skip=1;}
    const h=b.hints?.[t.topicId];if(h)for(const q of t.questions)if(!CARDS.includes(q.type))q.hint=`${h} ${q.hint||''}`.trim();}
  p.boost={message:b.message,emoji:b.emoji||'🚀',date:b.date};if(b.terms)p.terms={...(p.terms||{}),...b.terms};return p;}
