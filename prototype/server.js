// Landon's adaptive learning app — tutor "Jane". Zero dependencies (Node 20).
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||8080, DATA=path.join(__dirname,'data'), TAX=path.join(__dirname,'..','data','marble');
const STATE_F=path.join(DATA,'progress.json'), LOG_F=path.join(DATA,'answers.log.jsonl');
const LLM_KEY=['XAI_API_KEY','OPENAI_API_KEY','ANTHROPIC_API_KEY'].find(k=>process.env[k]);
// ---------- taxonomy ----------
const topics=JSON.parse(fs.readFileSync(path.join(TAX,'topics.json'))).topics;
const deps=JSON.parse(fs.readFileSync(path.join(TAX,'dependencies.json'))).dependencies;
const byId=Object.fromEntries(topics.map(t=>[t.id,t]));
const prereqs={},unlocks={};
for(const d of deps){(prereqs[d.topicId]??=[]).push(d.prerequisiteId);(unlocks[d.prerequisiteId]??=[]).push(d.topicId);}
function kindFor(t){ if(!t||t.subject!=='Mathematics')return null; const n=t.name.toLowerCase(),dm=t.domain;
  if(/percent|decimal|tenth|hundredth/.test(n))return 'fracdec';
  if(dm==='Fractions'||/fraction/.test(n)){
    if(/compar/.test(n))return 'compare'; if(/equivalent|simplif/.test(n))return 'equiv';
    if(/divid/.test(n))return 'fracdiv'; if(/multipl|scaling|area/.test(n))return 'fracmul';
    if(/add|sum|subtract|mixed|improper/.test(n))return 'fracadd'; if(/of amounts/.test(n))return 'fracof';
    return 'pizza';}
  if(dm==='Multiplication & Division')return 'muldiv'; if(dm==='Addition & Subtraction')return 'addsub';
  if(dm==='Number Representation & Place Value')return 'place'; return null;}
const usable=id=>{const t=byId[id];return t&&kindFor(t)&&t.ageRangeStart<=12;};
const START='mt_e7filQgayF'; // Fractions > Fraction Word Problems (age 10+)
// ---------- math helpers ----------
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)), pick=a=>a[R(0,a.length-1)], gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const simp=(n,d)=>{const g=gcd(n,d);return[n/g,d/g]}, fs_=(n,d)=>{[n,d]=simp(n,d);return d===1?`${n}`:`${n}/${d}`};
function parseNum(s){s=String(s).trim().replace(/\s+/g,' ').replace(/,/g,'');let m;
  if(m=s.match(/^(-?\d+) (\d+)\/(\d+)$/))return +m[1]+ +m[2]/+m[3];
  if(m=s.match(/^(-?\d+)\s*\/\s*(\d+)$/))return +m[2]?+m[1]/+m[2]:NaN;
  if(m=s.match(/^(-?\d*\.?\d+)\s*%$/))return +m[1]/100;
  if(/^-?\d*\.?\d+$/.test(s))return +s; return NaN;}
const pizzaVis=(n,eaten)=>({type:'pizza',slices:n,eaten});
const barVis=(n,shade)=>({type:'bar',parts:n,shaded:shade});
// ---------- procedural generators: gen(level 1..5) ----------
const G={
 pizza(L){const d=pick([[4,6,8],[6,8,10],[8,10,12],[8,12,16],[10,12,16]][L-1]);const a=R(1,Math.max(1,Math.floor(d/3))),b=R(1,Math.max(1,Math.floor(d/3)));
  const food=pick(['pizza','pie','chocolate bar','cake']);const left=d-a-b;
  return{q:`A ${food} is cut into ${d} equal pieces. You eat ${a} and your friend eats ${b}. What fraction of the ${food} is left?`,a:fs_(left,d),
   hint:`Count the pieces that are still there: ${d} − ${a} − ${b}. Put that over the total, ${d}.`,
   explain:`${d} − ${a} − ${b} = ${left} pieces left, out of ${d}. So ${left}/${d}${gcd(left,d)>1?` = ${fs_(left,d)}`:''}.`,vis:food==='pizza'||food==='pie'?pizzaVis(d,a+b):barVis(d,a+b),
   bonus:[2,4,5,8,10,16,20].includes(simp(left,d)[1])?{q:'Bonus ⭐: write that as a decimal!',a:String(+(left/d).toFixed(4))}:null};},
 fracadd(L){const d=pick([[4,5,6],[6,8,10],[6,8,12],[0],[0]][L-1]);
  if(L<=3){const a=R(1,d-2),b=R(1,d-a-1);return{q:`What is ${a}/${d} + ${b}/${d}?`,a:fs_(a+b,d),hint:'Same bottom number? Just add the top numbers and keep the bottom!',explain:`${a} + ${b} = ${a+b}, so ${a+b}/${d}${gcd(a+b,d)>1?` = ${fs_(a+b,d)}`:''}.`,vis:barVis(d,a+b)};}
  const d1=pick([2,3,4]),d2=pick([3,4,6,8].filter(x=>x!==d1)),a=R(1,d1-1),b=R(1,d2-1),D=d1*d2/gcd(d1,d2),N=a*D/d1+b*D/d2;
  return{q:`What is ${a}/${d1} + ${b}/${d2}?${L===5?' (A mixed number like 1 1/4 is fine!)':''}`,a:fs_(N,D),hint:`Find a common denominator. Both ${d1} and ${d2} go into ${D}.`,explain:`${a}/${d1} = ${a*D/d1}/${D} and ${b}/${d2} = ${b*D/d2}/${D}. Add: ${N}/${D} = ${fs_(N,D)}.`};},
 equiv(L){const [n,d]=pick([[1,2],[1,3],[2,3],[1,4],[3,4],[2,5],[3,5]]),k=R(2,L+2);
  if(L%2)return{q:`${n}/${d} = ?/${d*k}  (fill in the missing top number)`,a:String(n*k),hint:`What did ${d} get multiplied by to make ${d*k}? Do the same to the top!`,explain:`${d} × ${k} = ${d*k}, so ${n} × ${k} = ${n*k}.`};
  return{q:`Simplify ${n*k}/${d*k} to lowest terms.`,a:`${n}/${d}`,needSimplest:true,hint:`Find a number that divides both ${n*k} and ${d*k}. Try ${k}!`,explain:`Divide top and bottom by ${k}: ${n*k}÷${k} = ${n}, ${d*k}÷${k} = ${d}.`};},
 compare(L){let a,b,c,d;do{d=R(2,4+L);b=L<3?d:R(2,4+L);a=R(1,d-1);c=R(1,b-1);}while(a*b===c*d&&L>1);const s=a*b>c*d?'>':a*b<c*d?'<':'=';
  return{q:`Which is bigger? Type >, < or =:   ${a}/${d}  ?  ${c}/${b}`,a:s,cmp:true,hint:L<3?'Same size pieces — more pieces means more!':'Turn them into decimals, or cross-multiply: compare top-left × bottom-right with top-right × bottom-left.',explain:`${a}/${d} ≈ ${(a/d).toFixed(2)} and ${c}/${b} ≈ ${(c/b).toFixed(2)}, so ${a}/${d} ${s} ${c}/${b}.`};},
 fracdec(L){const opts=[[[1,2],[1,10],[3,10],[7,10]],[[1,4],[3,4],[2,5],[9,100]],[[3,8],[1,8],[3,5],[27,100]],[[5,8],[7,20],[13,25]],[[7,8],[3,16],[11,40]]][L-1];const[n,d]=pick(opts);
  if(L>=3&&Math.random()<.4)return{q:`What is ${n}/${d} as a percent? (like 50%)`,a:`${+(100*n/d).toFixed(2)}%`,hint:'A percent is "out of 100". Turn it into a decimal first, then move the point 2 places right.',explain:`${n} ÷ ${d} = ${+(n/d).toFixed(4)} = ${+(100*n/d).toFixed(2)}%.`};
  return{q:`Write ${n}/${d} as a decimal.`,a:String(+(n/d).toFixed(4)),hint:d===10||d===100?`/${d} means ${d===10?'tenths':'hundredths'} — that's the place after the decimal point!`:`Divide ${n} by ${d}. Tip: 1/${d} = ${+(1/d).toFixed(4)}.`,explain:`${n} ÷ ${d} = ${+(n/d).toFixed(4)}.`,vis:d<=16?barVis(d,n):null};},
 fracof(L){const d=pick([[2,4],[3,4,5],[3,5,6,8],[4,6,8,10],[6,8,12]][L-1]),n=L<2?1:R(1,d-1),w=d*R(2,3+L);return{q:`What is ${n}/${d} of ${w}?`,a:String(w/d*n),hint:`First find 1/${d} of ${w} by dividing: ${w} ÷ ${d}. Then multiply by ${n}.`,explain:`${w} ÷ ${d} = ${w/d}, × ${n} = ${w/d*n}.`};},
 fracmul(L){if(L<=2){const n=R(1,4),d=R(n+1,6),w=R(2,5);return{q:`What is ${w} × ${n}/${d}?`,a:fs_(w*n,d),hint:`Multiply ${w} by the top number, keep the bottom.`,explain:`${w} × ${n} = ${w*n}, so ${w*n}/${d} = ${fs_(w*n,d)}.`};}
  const a=R(1,4),b=R(a+1,6),c=R(1,4),d=R(c+1,L+4);return{q:`What is ${a}/${b} × ${c}/${d}?`,a:fs_(a*c,b*d),hint:'Top × top, bottom × bottom!',explain:`${a}×${c} = ${a*c}, ${b}×${d} = ${b*d}, so ${fs_(a*c,b*d)}.`};},
 fracdiv(L){if(L<=3){const w=R(2,6),d=R(2,5);return Math.random()<.5?{q:`How many 1/${d}s fit in ${w}? (${w} ÷ 1/${d})`,a:String(w*d),hint:`Each whole has ${d} pieces of size 1/${d}.`,explain:`${w} × ${d} = ${w*d}.`}:{q:`What is 1/${d} ÷ ${w}?`,a:`1/${d*w}`,hint:`Split each 1/${d} piece into ${w} smaller pieces.`,explain:`1/${d} ÷ ${w} = 1/(${d}×${w}) = 1/${d*w}.`};}
  const a=R(1,4),b=R(a+1,6),c=R(1,4),d=R(c+1,6);return{q:`What is ${a}/${b} ÷ ${c}/${d}?`,a:fs_(a*d,b*c),hint:'Keep, Change, Flip: keep the first, change ÷ to ×, flip the second.',explain:`${a}/${b} × ${d}/${c} = ${a*d}/${b*c} = ${fs_(a*d,b*c)}.`};},
 muldiv(L){const hi=[5,10,12,25,99][L-1],a=R(2,hi),b=R(2,Math.min(12,hi));if(Math.random()<.5)return{q:`What is ${a} × ${b}?`,a:String(a*b),hint:a>10?`Break it up: ${a} × ${b} = ${Math.floor(a/10)*10}×${b} + ${a%10}×${b}.`:`Count by ${b}s, ${a} times.`,explain:`${a} × ${b} = ${a*b}.`};
  return{q:`What is ${a*b} ÷ ${b}?`,a:String(a),hint:`What number times ${b} makes ${a*b}?`,explain:`${a} × ${b} = ${a*b}, so ${a*b} ÷ ${b} = ${a}.`};},
 addsub(L){const hi=[20,100,500,1000,10000][L-1],a=R(hi/4,hi),b=R(1,a);return Math.random()<.5?{q:`What is ${a} + ${b}?`,a:String(a+b),hint:'Line up the ones, tens and hundreds and add each column.',explain:`${a} + ${b} = ${a+b}.`}:{q:`What is ${a} − ${b}?`,a:String(a-b),hint:`Count up from ${b} to ${a}.`,explain:`${a} − ${b} = ${a-b}.`};},
 place(L){const n=R(10**(L),10**(L+1)-1),s=String(n),i=R(0,s.length-1),names=['ones','tens','hundreds','thousands','ten-thousands','hundred-thousands'],p=s.length-1-i;
  return{q:`In the number ${n.toLocaleString('en-US')}, what is the VALUE of the digit ${s[i]} (it's in the ${names[p]} place)?`,a:String(+s[i]*10**p),hint:`The ${names[p]} place means × ${10**p}.`,explain:`${s[i]} × ${10**p} = ${+s[i]*10**p}.`};},
};
// ---------- state ----------
const blank=()=>({name:'Landon',points:0,stars:0,streak:0,bestStreak:0,solved:0,topicId:START,level:3,wrongInRow:0,rightInTopic:0,topics:{},current:null,sinceChoice:0,badges:[]});
let S; try{S=JSON.parse(fs.readFileSync(STATE_F))}catch{S=blank()}
const save=()=>{fs.writeFileSync(STATE_F+'.tmp',JSON.stringify(S,null,1));fs.renameSync(STATE_F+'.tmp',STATE_F)};
const log=o=>fs.appendFileSync(LOG_F,JSON.stringify({ts:new Date().toISOString(),...o})+'\n');
const tstat=id=>S.topics[id]??={name:byId[id].name,domain:byId[id].domain,attempted:0,correct:0,incorrect:0,mastered:false};
function newProblem(){let p;
  if(!S.current&&S.solved===0&&!S.firstDone)p={q:'A pizza is cut into 8 equal slices. You eat 3 slices and your friend eats 2. What fraction of the pizza is left?',a:'3/8',hint:'Count the slices that are still on the plate: 8 − 3 − 2. Put that number over 8, the total slices.',explain:'8 − 3 − 2 = 3 slices left out of 8, so 3/8 of the pizza is left!',vis:pizzaVis(8,5),bonus:{q:'Bonus ⭐: write 3/8 as a decimal!',a:'0.375'},first:true},S.firstDone=true;
  else p=G[kindFor(byId[S.topicId])](S.level);
  S.current={...p,id:Date.now(),topicId:S.topicId,level:S.level,tries:0,stage:'main'};save();return S.current;}
function check(given,ans,cmp,needSimplest){given=String(given).trim();if(cmp)return given.replace(/\s/g,'')===ans||(ans==='>'&&/bigger|greater|first|left/i.test(given))||(ans==='<'&&/smaller|less|second|right/i.test(given));
  const g=parseNum(given),a=parseNum(ans);if(isNaN(g))return false;if(Math.abs(g-a)>1e-6)return false;
  if(needSimplest){const m=given.match(/^(\d+)\s*\/\s*(\d+)$/);if(m&&gcd(+m[1],+m[2])>1)return 'notSimplest';}return true;}
const praise=['Amazing, Landon! 🎉','You nailed it! 🌟','Brilliant thinking! 🧠','Wow, superstar! ⭐','That\'s exactly right! 🙌','You\'re on fire! 🔥'];
const comfort=['Ooh, so close! Let\'s think it through together.','Good try! Mistakes help our brains grow. 🌱','Not quite — but I love that you tried!'];
function moveTopic(dir){const list=(dir==='down'?prereqs:unlocks)[S.topicId]||[];let c=list.filter(usable).filter(id=>dir==='down'||!S.topics[id]?.mastered);
  if(!c.length){const t=byId[S.topicId];c=topics.filter(x=>usable(x.id)&&x.domain===t.domain&&x.id!==S.topicId&&(dir==='down'?x.ageRangeStart<t.ageRangeStart:x.ageRangeStart>=t.ageRangeStart&&!S.topics[x.id]?.mastered)).map(x=>x.id);}
  if(!c.length)return null;const id=pick(c);S.topicId=id;S.level=dir==='down'?3:2;S.rightInTopic=0;S.wrongInRow=0;return byId[id].name;}
function submit(answer){const c=S.current;if(!c)return{error:'no problem'};const isBonus=c.stage==='bonus';
  const ok=check(answer,isBonus?c.bonus.a:c.a,c.cmp&&!isBonus,c.needSimplest&&!isBonus);const st=tstat(c.topicId);
  log({topic:byId[c.topicId].name,topicId:c.topicId,level:c.level,stage:c.stage,question:isBonus?c.bonus.q:c.q,expected:isBonus?c.bonus.a:c.a,given:answer,correct:ok===true,try:c.tries+1});
  const r={correct:ok===true};
  if(ok==='notSimplest'){c.tries++;save();return{correct:false,retry:true,jane:'Yes, that\'s the right amount! Can you simplify it even more? 🤏'};}
  if(isBonus){if(ok){S.points+=15;S.stars++;r.jane='BONUS! You\'re a decimal wizard! 🧙‍♂️ +15 points and a ⭐';}else{r.jane=`Good try! ${c.bonus.a} is the decimal. Tip: divide the top number by the bottom number.`;r.reveal=c.bonus.a;}
    r.done=true;S.current=null;save();return r;}
  if(ok){st.attempted++;st.correct++;const pts=c.tries?5:10+c.level*2;S.points+=pts;S.streak++;S.bestStreak=Math.max(S.bestStreak,S.streak);S.solved++;S.rightInTopic++;S.wrongInRow=0;
    if(c.first)S.firstDone=true;if(S.streak%3===0)S.stars++;r.jane=`${pick(praise)} +${pts} points${S.streak>=3?` — ${S.streak} in a row!`:''}`;
    if(c.tries===0&&!c.first){if(S.level<5){S.level++;r.levelUp=S.level;}else if(S.rightInTopic>=4){st.mastered=true;S.badges.push(byId[c.topicId].name);r.mastered=byId[c.topicId].name;const n=moveTopic('up');if(n)r.jane+=` You MASTERED "${r.mastered}"! 🏆 Next up: ${n}.`;}}
    if(c.bonus){c.stage='bonus';c.tries=0;r.bonus=c.bonus.q;r.jane+=' Want a bonus challenge?';}else{r.done=true;S.current=null;}
    S.sinceChoice++;if(r.done&&S.sinceChoice>=5){r.askChoice=true;S.sinceChoice=0;}save();return r;}
  c.tries++;S.streak=0;
  if(c.tries===1){r.retry=true;r.hint=c.hint;r.jane=`${pick(comfort)} Here's a hint: ${c.hint}`;save();return r;}
  st.attempted++;st.incorrect++;S.wrongInRow++;r.reveal=c.a;r.jane=`Let me show you how: ${c.explain} You'll get the next one! 💪`;
  if(S.level>1){S.level--;r.levelDown=S.level;}else if(S.wrongInRow>=2){const n=moveTopic('down');if(n)r.jane+=` Let's warm up with "${n}" first.`;}
  r.done=true;S.current=null;S.sinceChoice++;if(S.sinceChoice>=5){r.askChoice=true;S.sinceChoice=0;}save();return r;}
function choose(c){let msg;if(c==='harder'){if(S.level<5)S.level++;else moveTopic('up');msg='Ooh, a challenge! Let\'s go! 🚀';}
  else if(c==='easier'){if(S.level>1)S.level--;else moveTopic('down');msg='Great choice — practice makes perfect!';}
  else if(c==='different'){const t=byId[S.topicId];const c2=topics.filter(x=>usable(x.id)&&x.domain!==t.domain&&x.ageRangeStart>=8&&x.ageRangeStart<=11);const n=pick(c2);S.topicId=n.id;S.level=2;S.rightInTopic=0;msg=`Something new: ${n.domain} → ${n.name}! 🎨`;}
  else if(c==='fractions'){const c2=topics.filter(x=>usable(x.id)&&x.domain==='Fractions'&&x.ageRangeStart>=9);const n=pick(c2);S.topicId=n.id;S.level=3;msg=`Back to fractions: ${n.name}! 🍕`;}
  else msg='Keep going — you\'re doing great!';S.current=null;save();return{jane:msg};}
const pub=()=>{const t=byId[S.topicId],c=S.current;return{name:S.name,points:S.points,stars:S.stars,streak:S.streak,bestStreak:S.bestStreak,solved:S.solved,level:S.level,badges:S.badges,
  topic:{name:t.name,domain:t.domain,description:t.description},engine:LLM_KEY?'llm':'procedural',
  problem:c&&{id:c.id,q:c.stage==='bonus'?c.bonus.q:c.q,vis:c.vis,stage:c.stage}};};
// ---------- http ----------
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css'};
http.createServer((req,res)=>{const u=new URL(req.url,'http://x');const J=(o,s=200)=>{res.writeHead(s,{'content-type':'application/json'});res.end(JSON.stringify(o))};
  const body=()=>new Promise(r=>{let b='';req.on('data',d=>b+=d);req.on('end',()=>{try{r(JSON.parse(b||'{}'))}catch{r({})}})});
  (async()=>{
  if(u.pathname==='/api/state'){if(!S.current)newProblem();return J(pub());}
  if(u.pathname==='/api/answer'&&req.method==='POST'){const b=await body();const r=submit(b.answer??'');if(r.done&&!r.askChoice)newProblem();return J({...r,state:pub()});}
  if(u.pathname==='/api/next'&&req.method==='POST'){if(!S.current)newProblem();return J(pub());}
  if(u.pathname==='/api/skipbonus'&&req.method==='POST'){S.current=null;newProblem();return J(pub());}
  if(u.pathname==='/api/choice'&&req.method==='POST'){const b=await body();const r=choose(b.choice);newProblem();return J({...r,state:pub()});}
  if(u.pathname==='/parent'){const lines=fs.existsSync(LOG_F)?fs.readFileSync(LOG_F,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).reverse():[];
    res.writeHead(200,{'content-type':'text/html; charset=utf-8'});const e=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    return res.end(`<meta name=viewport content="width=device-width"><style>body{font-family:sans-serif;padding:12px}td,th{border:1px solid #ccc;padding:4px;font-size:14px}table{border-collapse:collapse}</style><h2>Parent view — ${e(S.name)}</h2><p>Points ${S.points} · Stars ${S.stars} · Solved ${S.solved} · Best streak ${S.bestStreak} · Current: ${e(byId[S.topicId].name)} (level ${S.level})</p><h3>Topics</h3><table><tr><th>Topic</th><th>Domain</th><th>Tried</th><th>✔</th><th>✘</th><th>Mastered</th></tr>${Object.values(S.topics).map(t=>`<tr><td>${e(t.name)}</td><td>${e(t.domain)}</td><td>${t.attempted}</td><td>${t.correct}</td><td>${t.incorrect}</td><td>${t.mastered?'🏆':''}</td></tr>`).join('')}</table><h3>Answer log</h3><table><tr><th>Time</th><th>Topic</th><th>Lvl</th><th>Question</th><th>Expected</th><th>Given</th><th>OK</th></tr>${lines.map(l=>`<tr><td>${new Date(l.ts).toLocaleString('en-US',{timeZone:'America/Los_Angeles'})}</td><td>${e(l.topic)}</td><td>${l.level}</td><td>${e(l.question)}</td><td>${e(l.expected)}</td><td>${e(l.given)}</td><td>${l.correct?'✅':'❌'}</td></tr>`).join('')}</table>`);}
  const f=path.join(__dirname,'public',u.pathname==='/'?'index.html':path.normalize(u.pathname).replace(/^(\.\.[\/\\])+/,''));
  if(f.startsWith(path.join(__dirname,'public'))&&fs.existsSync(f)&&fs.statSync(f).isFile()){res.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});return res.end(fs.readFileSync(f));}
  res.writeHead(404);res.end('not found');})().catch(e=>{console.error(e);J({error:String(e)},500)});
}).listen(PORT,()=>console.log('Landon app on :'+PORT,'engine=',LLM_KEY?'llm':'procedural'));
