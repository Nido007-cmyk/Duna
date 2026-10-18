// Jane FX: polish layer for the kid app and the parent report. Uses the vendored UI bundle (window.UIK:
// Motion mini animate + spring, Floating UI, canvas-confetti, auto-animate) when it loaded, and degrades to
// plain CSS when it didn't. Respects prefers-reduced-motion. Sound is OFF by default (mute toggle in the header).
(()=>{
const U=()=>window.UIK||null;
const mq=matchMedia('(prefers-reduced-motion: reduce)');const reduced=()=>mq.matches;
const store={get:k=>{try{return localStorage.getItem('jane.'+k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem('jane.'+k,v)}catch{}}};
// ---------- animation helpers ----------
const SPRING=()=>U()?{type:U().spring,stiffness:420,damping:22}:{duration:.25};
function anim(el,kf,opt={}){if(!el||reduced())return null;const u=U();try{if(u){const a=u.animate(el,kf,{...SPRING(),...opt});const clr=()=>{for(const k of Object.keys(kf))el.style[k]='';};a?.finished?a.finished.then(clr,()=>{}):a?.then?.(clr,()=>{});return a;}return el.animate?.(Object.fromEntries(Object.entries(kf)),{duration:250,easing:'ease-out'});}catch{return null}}
function enter(el,{y=14,delay=0}={}){anim(el,{opacity:[0,1],transform:[`translateY(${y}px) scale(.98)`,'translateY(0) scale(1)']},{delay});}
function stagger(els,{y=12,step=.045,delay=0}={}){[...els].forEach((e,i)=>anim(e,{opacity:[0,1],transform:[`translateY(${y}px) scale(.96)`,'none']},{delay:delay+i*step}));}
function shake(el){anim(el,{transform:['translateX(0)','translateX(-9px)','translateX(8px)','translateX(-5px)','translateX(3px)','translateX(0)']},{type:undefined,duration:.42,ease:'ease-out'});}
function bump(el){anim(el,{transform:['scale(1)','scale(1.18)','scale(1)']},{type:undefined,duration:.4,ease:'ease-out'});}
// FLIP: animate children to their new spots after a DOM change (order cards)
function flip(container,mutate){const kids=[...container.children],a=new Map(kids.map(k=>[k,k.getBoundingClientRect()]));mutate();if(reduced())return;
  for(const k of kids){const r0=a.get(k),r1=k.getBoundingClientRect();const dy=r0.top-r1.top,dx=r0.left-r1.left;if(dx||dy)anim(k,{transform:[`translate(${dx}px,${dy}px)`,'translate(0,0)']});}}
// ---------- sound (Web Audio, synthesized: no files) ----------
let ac=null;const vol=()=>({off:0,quiet:.05,on:.12}[store.get('sound')||'off']??0);
function tone(seq){const v=vol();if(!v)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();let t=ac.currentTime;
  for(const [f,d,type='sine',gap=0] of seq){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d+.02);t+=d*.8+gap;}}catch{}}
const SFX={tap:[[660,.05,'triangle']],good:[[523,.09],[659,.09],[784,.16]],bad:[[247,.14,'triangle'],[208,.2,'triangle']],win:[[523,.1],[659,.1],[784,.1],[1047,.28]],pop:[[880,.06,'triangle']],open:[[392,.07],[523,.12]]};
const sound=n=>tone(SFX[n]||[]);
// ---------- haptics (Android/Chrome; silently ignored elsewhere) ----------
const HAP={tap:8,good:[12,40,18],bad:[30,30,30],win:[15,35,15,35,60]};
const haptic=n=>{if(store.get('haptics')==='off')return;try{navigator.vibrate?.(HAP[n]||10)}catch{}};
// ---------- confetti ----------
function burst(el,big){const u=U();if(!u||reduced())return false;const r=el?.getBoundingClientRect?.();const o=r?{x:(r.left+r.width/2)/innerWidth,y:(r.top+r.height/2)/innerHeight}:{x:.5,y:.6};
  const colors=['#7c4dff','#00b8d4','#ff6d00','#ffd600','#00c853','#e91e63'];
  u.confetti({particleCount:big?120:45,spread:big?100:70,startVelocity:big?45:32,origin:o,colors,scalar:.9,ticks:big?220:140,disableForReducedMotion:true,zIndex:60});
  if(big)setTimeout(()=>{u.confetti({particleCount:60,angle:60,spread:60,origin:{x:0,y:.75},colors,disableForReducedMotion:true,zIndex:60});u.confetti({particleCount:60,angle:120,spread:60,origin:{x:1,y:.75},colors,disableForReducedMotion:true,zIndex:60});},250);return true;}
// ---------- feedback bundles ----------
function good(el,big){sound(big?'win':'good');haptic(big?'win':'good');if(el)anim(el,{transform:['scale(1)','scale(1.03)','scale(1)']},{type:undefined,duration:.35});return burst(el,big);}
function bad(el){sound('bad');haptic('bad');shake(el);}
// ---------- tactile press (springy release) ----------
const PRESS='button,.tcell,.mrow,.qs,.chip,.tab,a.btn,[role=button]';
document.addEventListener('pointerdown',e=>{const b=e.target.closest?.(PRESS);if(!b||b.disabled)return;b.classList.add('pressing');if(document.body.dataset.fx!=='calm'){haptic('tap');sound('tap');}},{passive:true});
const release=e=>{document.querySelectorAll('.pressing').forEach(b=>{b.classList.remove('pressing');anim(b,{transform:['scale(.94)','scale(1)']},{stiffness:600,damping:15});});};
addEventListener('pointerup',release,{passive:true});addEventListener('pointercancel',release,{passive:true});
// ---------- view transitions ----------
function view(fn){if(document.startViewTransition&&!reduced()){try{const t=document.startViewTransition(fn);t.ready?.catch(()=>{});t.finished?.catch(()=>{});t.updateCallbackDone?.catch(()=>{});return t;}catch{}}fn();}
// ---------- popovers (Floating UI) ----------
function place(ref,pop,arrowEl){const u=U();if(!u){return false}pop.style.position='fixed';
  u.computePosition(ref,pop,{strategy:'fixed',placement:'bottom',middleware:[u.offset(10),u.flip({padding:8}),u.shift({padding:10}),arrowEl&&u.arrow({element:arrowEl})].filter(Boolean)}).then(({x,y,placement,middlewareData:m})=>{
    Object.assign(pop.style,{left:x+'px',top:y+'px'});pop.dataset.side=placement.split('-')[0];
    if(arrowEl&&m.arrow){const s=placement.startsWith('top')?'bottom':'top';Object.assign(arrowEl.style,{left:m.arrow.x!=null?m.arrow.x+'px':'',top:'',bottom:'',[s]:'-7px'});}});
  anim(pop,{opacity:[0,1],transform:['translateY(6px) scale(.92)','none']},{stiffness:500,damping:24});return true;}
// ---------- auto-animate lists ----------
const watched=new WeakSet();function autoList(el){const u=U();if(!u||!el||watched.has(el)||reduced())return;try{u.autoAnimate(el,{duration:220});watched.add(el)}catch{}}
// ---------- keyboard helpers ----------
function kbd(root,sel,label){root?.querySelectorAll(sel).forEach(el=>{if(el.hasAttribute('tabindex'))return;el.setAttribute('tabindex','0');el.setAttribute('role','button');if(label)el.setAttribute('aria-label',label(el));});}
document.addEventListener('keydown',e=>{const t=e.target;if((e.key==='Enter'||e.key===' ')&&t?.getAttribute?.('role')==='button'&&t.tagName!=='BUTTON'){e.preventDefault();t.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:0,clientY:0}));}});
// ---------- sound toggle ----------
const LBL={off:['/icons/sound-off.svg','Sound off'],quiet:['/icons/sound-quiet.svg','Sound quiet'],on:['/icons/sound-on.svg','Sound on']};
function soundButton(btn){if(!btn)return;const paint=()=>{const m=store.get('sound')||'off';btn.innerHTML=`<img src="${LBL[m][0]}" alt="" width="24" height="24">`;btn.title=LBL[m][1]+' (tap to change)';btn.setAttribute('aria-label',LBL[m][1]);btn.setAttribute('aria-pressed',m!=='off');};
  btn.onclick=()=>{const m=store.get('sound')||'off',n={off:'quiet',quiet:'on',on:'off'}[m];store.set('sound',n);paint();if(n!=='off')sound('pop');};paint();}
window.FX={anim,enter,stagger,shake,bump,flip,sound,haptic,burst,good,bad,view,place,autoList,kbd,soundButton,reduced};
})();
