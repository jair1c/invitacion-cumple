/* ═══════════════════════════════════════════════════════
   app.js  —  Loop maestro único
   • Personajes animados (unicornio, hadas, princesa, mariposas)
   • Fuegos artificiales
   • Confeti
   • Partículas flotantes
   • Lógica de sobre, cuenta regresiva, música
═══════════════════════════════════════════════════════ */

/* ── CANVAS ── */
const canvas = document.getElementById('canvas-fx');
const ctx    = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

/* ── TIEMPO ── */
let T = 0;

/* ════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════ */
function drawStar(cx, cy, r, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a1 = (i * 2 * Math.PI / 5) - Math.PI / 2;
    const a2 = a1 + Math.PI / 5;
    i === 0
      ? ctx.moveTo(cx + Math.cos(a1)*r, cy + Math.sin(a1)*r)
      : ctx.lineTo(cx + Math.cos(a1)*r, cy + Math.sin(a1)*r);
    ctx.lineTo(cx + Math.cos(a2)*(r*0.4), cy + Math.sin(a2)*(r*0.4));
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ════════════════════════════════════════════════
   FUEGOS ARTIFICIALES
════════════════════════════════════════════════ */
let fwParticles = [];
let fwActive    = false;

class FWParticle {
  constructor(x, y) {
    this.x = x; this.y = y;
    const a = Math.random() * Math.PI * 2, s = Math.random() * 7 + 2;
    this.vx = Math.cos(a)*s; this.vy = Math.sin(a)*s;
    this.alpha = 1;
    this.decay = Math.random() * 0.022 + 0.01;
    this.size  = Math.random() * 3.5 + 1;
    const hues = [320,280,45,200,340,60,160,0];
    this.color = `hsl(${hues[Math.floor(Math.random()*hues.length)]},100%,65%)`;
  }
  tick() {
    this.x += this.vx; this.y += this.vy;
    this.vy += 0.08; this.vx *= 0.99;
    this.alpha -= this.decay;
    if (this.alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = Math.max(0,this.alpha);
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

function launchFW() {
  const x = Math.random()*W*0.8+W*0.1;
  const y = Math.random()*H*0.45+60;
  for (let i=0;i<100;i++) fwParticles.push(new FWParticle(x,y));
}

function startFireworks() {
  fwActive=true; fwParticles=[];
  let n=0; launchFW();
  const iv=setInterval(()=>{
    launchFW();
    if (Math.random()>0.4) launchFW();
    if (++n>20){
      clearInterval(iv);
      setTimeout(()=>{ fwActive=false; fwParticles=[]; },2500);
    }
  },380);
}

/* ════════════════════════════════════════════════
   CONFETI
════════════════════════════════════════════════ */
let cfParticles = [];
let cfActive    = false;
const CF_COLS = ['#f472b6','#a855f7','#f59e0b','#34d399','#60a5fa','#fb923c','#e879f9','#fde68a','#f87171'];

class CfParticle {
  constructor(init=false) { this.reset(init); }
  reset(init=false) {
    this.x   = Math.random()*W;
    this.y   = init ? Math.random()*H*-0.8 : -20;
    this.w   = Math.random()*14+4; this.h = Math.random()*7+3;
    this.col = CF_COLS[Math.floor(Math.random()*CF_COLS.length)];
    this.sh  = Math.floor(Math.random()*3);
    this.vy  = Math.random()*3+1.5; this.vx=(Math.random()-.5)*2.2;
    this.rot = Math.random()*Math.PI*2; this.rv=(Math.random()-.5)*.18;
  }
  tick() {
    this.x+=this.vx; this.y+=this.vy; this.rot+=this.rv;
    if (this.y>H+20) this.reset();
    ctx.save(); ctx.globalAlpha=.9;
    ctx.translate(this.x,this.y); ctx.rotate(this.rot);
    ctx.fillStyle=this.col;
    if (this.sh===0) { ctx.fillRect(-this.w/2,-this.h/2,this.w,this.h); }
    else if (this.sh===1) { ctx.beginPath();ctx.arc(0,0,this.w/2,0,Math.PI*2);ctx.fill(); }
    else {
      ctx.beginPath();
      for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2,r=this.w/2;i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
      ctx.closePath();ctx.fill();
    }
    ctx.restore();
  }
}

function startConfetti() {
  cfActive=true;
  cfParticles=Array.from({length:180},(_,i)=>new CfParticle(i<60));
  setTimeout(()=>{ cfActive=false; cfParticles=[]; },8000);
}

/* ════════════════════════════════════════════════
   UNICORNIO
════════════════════════════════════════════════ */
const unicorn = {
  x:-120, y:0, dir:1, speed:1.8, legP:0,
  init(){ this.y=H*0.82; },
  tick(){
    this.x += this.speed*this.dir; this.legP += 0.18;
    if (this.dir===1  && this.x>W+120){ this.dir=-1; }
    if (this.dir===-1 && this.x<-120) { this.dir=1;  }
    this.draw();
  },
  draw(){
    const x=this.x, y=this.y;
    const bob = Math.sin(this.legP)*3;
    const fl  = Math.sin(this.legP)*12;
    const bl  = Math.sin(this.legP+Math.PI)*12;
    ctx.save();
    ctx.translate(x, y+bob);
    if (this.dir===-1) ctx.scale(-1,1);

    // sombra
    ctx.beginPath(); ctx.ellipse(0,28,34,6,0,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,0.07)'; ctx.fill();

    // cuerpo
    ctx.beginPath(); ctx.ellipse(0,0,40,22,0,0,Math.PI*2);
    ctx.fillStyle='#f9a8d4'; ctx.fill();
    ctx.strokeStyle='#f472b6'; ctx.lineWidth=1.5; ctx.stroke();

    // cuello
    ctx.beginPath();
    ctx.moveTo(-18,-10); ctx.quadraticCurveTo(-26,-32,-14,-44);
    ctx.quadraticCurveTo(-8,-50,0,-46); ctx.quadraticCurveTo(6,-42,-10,-30);
    ctx.lineTo(-12,-12); ctx.closePath();
    ctx.fillStyle='#f9a8d4'; ctx.fill();

    // cabeza
    ctx.beginPath(); ctx.ellipse(-10,-50,16,12,-0.3,0,Math.PI*2);
    ctx.fillStyle='#fce7f3'; ctx.fill();

    // cuerno
    ctx.beginPath(); ctx.moveTo(-18,-60); ctx.lineTo(-10,-80); ctx.lineTo(-2,-60); ctx.closePath();
    ctx.fillStyle='#f59e0b'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-15,-62); ctx.lineTo(-10,-76);
    ctx.strokeStyle='#fde68a'; ctx.lineWidth=1.5; ctx.stroke();

    // oreja
    ctx.beginPath(); ctx.moveTo(0,-58); ctx.lineTo(5,-67); ctx.lineTo(10,-58); ctx.closePath();
    ctx.fillStyle='#f9a8d4'; ctx.fill();

    // ojo
    ctx.beginPath(); ctx.arc(-16,-50,3.5,0,Math.PI*2); ctx.fillStyle='#7c3aed'; ctx.fill();
    ctx.beginPath(); ctx.arc(-14.5,-51.5,1.2,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill();

    // melena
    const mc=['#c084fc','#f472b6','#fde68a','#a78bfa'];
    for(let i=0;i<4;i++){
      ctx.beginPath();
      ctx.moveTo(2-i*3,-60);
      ctx.quadraticCurveTo(-5-i*4,-40+i*3,-14-i*2,-20+i*5);
      ctx.strokeStyle=mc[i]; ctx.lineWidth=5-i; ctx.lineCap='round'; ctx.stroke();
    }

    // patas
    const legs=[{ox:-20,ph:fl},{ox:-8,ph:bl},{ox:8,ph:fl},{ox:20,ph:bl}];
    legs.forEach(lg=>{
      ctx.save(); ctx.translate(lg.ox,16); ctx.rotate(lg.ph*Math.PI/180);
      ctx.beginPath(); ctx.roundRect(-4,0,8,22,4);
      ctx.fillStyle='#f9a8d4'; ctx.fill();
      ctx.strokeStyle='#f472b6'; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0,23,5,3,0,0,Math.PI*2);
      ctx.fillStyle='#7c3aed'; ctx.fill();
      ctx.restore();
    });

    // cola
    const tc=['#c084fc','#f472b6','#fde68a'];
    for(let i=0;i<3;i++){
      ctx.beginPath();
      ctx.moveTo(36,-8+i*4);
      ctx.quadraticCurveTo(55+Math.sin(T*0.04+i)*8,10+i*6,50+i*3,30+i*5);
      ctx.strokeStyle=tc[i]; ctx.lineWidth=6-i*1.5; ctx.lineCap='round'; ctx.stroke();
    }

    // destellos
    if(Math.sin(T*0.1)>0.5){
      drawStar(55,-30,5,'#f59e0b',0.9);
      drawStar(62,-20,4,'#f472b6',0.7);
    }
    ctx.restore();
  }
};

/* ════════════════════════════════════════════════
   HADAS
════════════════════════════════════════════════ */
class Fairy {
  constructor(side, bodyColor, wandColor, hairColor){
    this.side=side; this.bodyColor=bodyColor;
    this.wandColor=wandColor; this.hairColor=hairColor;
    this.phase=side==='left'?0:Math.PI; this.wingP=0;
  }
  tick(){
    this.phase+=0.022; this.wingP+=0.18;
    const bx = this.side==='left' ? 38 : W-38;
    const x  = bx + Math.sin(this.phase)*20;
    const y  = H*0.4 + Math.sin(this.phase*0.7)*40;
    this.draw(x,y);
  }
  draw(x,y){
    const flip = this.side==='right' ? -1 : 1;
    const ws   = Math.abs(Math.cos(this.wingP));
    const glow = (Math.sin(T*0.08)+1)/2;

    ctx.save(); ctx.translate(x,y); ctx.scale(flip,1);

    // alas
    ['left','right'].forEach((side,i)=>{
      ctx.save();
      ctx.scale(i===0?ws:-ws,1);
      ctx.beginPath(); ctx.ellipse(-22,-8,22,32,-0.4,0,Math.PI*2);
      ctx.fillStyle=`rgba(196,181,253,${0.5+ws*0.3})`; ctx.fill();
      ctx.strokeStyle='rgba(167,139,250,0.4)'; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-18,14,14,20,-0.5,0,Math.PI*2);
      ctx.fillStyle=`rgba(249,168,212,${0.45+ws*0.25})`; ctx.fill();
      ctx.restore();
    });

    // cuerpo
    ctx.beginPath(); ctx.roundRect(-10,-5,20,35,[8,8,12,12]);
    ctx.fillStyle=this.bodyColor; ctx.fill();

    // cabeza
    ctx.beginPath(); ctx.arc(0,-22,14,0,Math.PI*2);
    ctx.fillStyle='#fde8d8'; ctx.fill();

    // pelo
    ctx.beginPath(); ctx.arc(0,-28,14,Math.PI,0);
    ctx.fillStyle=this.hairColor; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-13,-24); ctx.quadraticCurveTo(-20,-10,-14,10);
    ctx.strokeStyle=this.hairColor; ctx.lineWidth=5; ctx.lineCap='round'; ctx.stroke();

    // corona
    ctx.beginPath();
    [[-8,-38],[-4,-44],[0,-38],[4,-44],[8,-38]].forEach((p,i)=>
      i===0?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1])
    );
    ctx.lineTo(10,-36); ctx.moveTo(-10,-36); ctx.lineTo(-8,-38); ctx.closePath();
    // relleno simple
    ctx.beginPath();
    ctx.moveTo(-10,-36);
    [[-8,-38],[-4,-44],[0,-38],[4,-44],[8,-38]].forEach(p=>ctx.lineTo(p[0],p[1]));
    ctx.lineTo(10,-36); ctx.closePath();
    ctx.fillStyle='#f59e0b'; ctx.fill();
    ctx.beginPath(); ctx.arc(0,-38,2.5,0,Math.PI*2);
    ctx.fillStyle='#ec4899'; ctx.fill();

    // ojos
    ctx.beginPath(); ctx.arc(-5,-22,2.5,0,Math.PI*2); ctx.arc(5,-22,2.5,0,Math.PI*2);
    ctx.fillStyle='#7c3aed'; ctx.fill();
    ctx.beginPath(); ctx.arc(-4,-23,1,0,Math.PI*2); ctx.arc(6,-23,1,0,Math.PI*2);
    ctx.fillStyle='white'; ctx.fill();

    // sonrisa
    ctx.beginPath(); ctx.arc(0,-18,5,0.2,Math.PI-0.2);
    ctx.strokeStyle='#db2777'; ctx.lineWidth=1.5; ctx.stroke();

    // piernas
    ctx.beginPath();
    ctx.moveTo(-5,30); ctx.lineTo(-6,46);
    ctx.moveTo(5,30);  ctx.lineTo(6,46);
    ctx.strokeStyle='#fde8d8'; ctx.lineWidth=5; ctx.lineCap='round'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-6,47,5,3,0,0,Math.PI*2); ctx.ellipse(6,47,5,3,0,0,Math.PI*2);
    ctx.fillStyle=this.bodyColor; ctx.fill();

    // varita
    ctx.beginPath(); ctx.moveTo(12,5); ctx.lineTo(30,-12);
    ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.stroke();
    ctx.save();
    ctx.translate(32,-14);
    ctx.shadowColor=this.wandColor; ctx.shadowBlur=8+glow*16;
    drawStar(0,0,6+glow*3,this.wandColor,1);
    ctx.restore();

    ctx.restore();
  }
}

/* ════════════════════════════════════════════════
   MINI PRINCESA CORRIENDO (arriba)
════════════════════════════════════════════════ */
const miniPrincess = {
  x:-80, y:0, dir:1, speed:2.2, legP:0,
  init(){ this.y=H*0.12+38; },
  tick(){
    this.x+=this.speed*this.dir; this.legP+=0.22;
    if(this.dir===1  && this.x>W+80){ this.dir=-1; }
    if(this.dir===-1 && this.x<-80) { this.dir=1;  }
    this.draw();
  },
  draw(){
    const x=this.x, y=this.y;
    const bob  = Math.abs(Math.sin(this.legP))*3;
    const arm  = Math.sin(this.legP)*25;
    const leg1 = Math.sin(this.legP)*22;
    const leg2 = Math.sin(this.legP+Math.PI)*22;

    ctx.save(); ctx.translate(x,y-bob);
    if(this.dir===-1) ctx.scale(-1,1);

    // sombra
    ctx.beginPath(); ctx.ellipse(0,40,18,4,0,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,0.07)'; ctx.fill();

    // falda
    ctx.beginPath();
    ctx.moveTo(-14,4); ctx.quadraticCurveTo(-22,22,-20,40);
    ctx.lineTo(20,40); ctx.quadraticCurveTo(22,22,14,4); ctx.closePath();
    const dg=ctx.createLinearGradient(-20,0,20,40);
    dg.addColorStop(0,'#f472b6'); dg.addColorStop(1,'#7c3aed');
    ctx.fillStyle=dg; ctx.fill();
    // capa falda
    ctx.beginPath(); ctx.ellipse(0,32,21,5,0,0,Math.PI);
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fill();

    // corpino
    ctx.beginPath(); ctx.roundRect(-10,-8,20,16,5);
    ctx.fillStyle='#db2777'; ctx.fill();

    // cabeza
    ctx.beginPath(); ctx.arc(0,-20,12,0,Math.PI*2);
    ctx.fillStyle='#fde8d8'; ctx.fill();

    // pelo
    ctx.beginPath(); ctx.arc(0,-26,12,Math.PI,0);
    ctx.fillStyle='#7c3aed'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-11,-22); ctx.quadraticCurveTo(-16,-10,-12,2);
    ctx.strokeStyle='#7c3aed'; ctx.lineWidth=4; ctx.lineCap='round'; ctx.stroke();

    // corona
    ctx.beginPath();
    [[-6,-32],[-3,-38],[0,-32],[3,-38],[6,-32]].forEach((p,i)=>
      i===0?ctx.moveTo(-8,-30):null || ctx.lineTo(p[0],p[1])
    );
    ctx.lineTo(8,-30); ctx.closePath();
    ctx.fillStyle='#f59e0b'; ctx.fill();
    ctx.beginPath(); ctx.arc(0,-32,2,0,Math.PI*2); ctx.fillStyle='#ec4899'; ctx.fill();

    // ojos
    ctx.beginPath(); ctx.arc(-4,-20,2,0,Math.PI*2); ctx.arc(4,-20,2,0,Math.PI*2);
    ctx.fillStyle='#581c87'; ctx.fill();

    // brazos
    [[-10,-30+arm],[ 10,30-arm]].forEach((a,i)=>{
      ctx.save(); ctx.translate(i===0?-10:10,-4);
      ctx.rotate((i===0?-30+arm:30-arm)*Math.PI/180);
      ctx.beginPath(); ctx.roundRect(-3,0,6,14,3);
      ctx.fillStyle='#fde8d8'; ctx.fill();
      ctx.restore();
    });

    // piernas
    [[- 6,leg1],[6,leg2]].forEach(([ox,angle])=>{
      ctx.save(); ctx.translate(ox,38); ctx.rotate(angle*Math.PI/180);
      ctx.beginPath(); ctx.roundRect(-3,0,6,16,3);
      ctx.fillStyle='#fde8d8'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0,17,5,3,0,0,Math.PI*2);
      ctx.fillStyle='#db2777'; ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }
};

/* ════════════════════════════════════════════════
   MARIPOSAS
════════════════════════════════════════════════ */
class Butterfly {
  constructor(ox,oy,cols){
    this.ox=ox; this.oy=oy; this.cols=cols;
    this.phase=Math.random()*Math.PI*2;
    this.wingP=Math.random()*Math.PI*2;
    this.spd=0.016+Math.random()*0.01;
  }
  tick(){
    this.phase+=this.spd; this.wingP+=0.25;
    const x=this.ox+Math.sin(this.phase)*38;
    const y=this.oy+Math.sin(this.phase*0.65)*30;
    const ws=Math.abs(Math.cos(this.wingP));
    this.draw(x,y,ws);
  }
  draw(x,y,ws){
    ctx.save(); ctx.translate(x,y);
    ctx.rotate(Math.sin(this.phase)*0.15);

    // alas
    [1,-1].forEach(flip=>{
      ctx.save(); ctx.scale(flip*ws,1);
      ctx.beginPath(); ctx.ellipse(-13,-6,17,12,-0.4,0,Math.PI*2);
      ctx.fillStyle=this.cols[0]; ctx.fill();
      ctx.beginPath(); ctx.ellipse(-11,8,12,9,-0.5,0,Math.PI*2);
      ctx.fillStyle=this.cols[1]; ctx.fill();
      ctx.restore();
    });

    // cuerpo
    ctx.beginPath(); ctx.ellipse(0,1,3,10,0,0,Math.PI*2);
    ctx.fillStyle=this.cols[2]; ctx.fill();
    ctx.beginPath(); ctx.arc(0,-9,3.5,0,Math.PI*2);
    ctx.fillStyle=this.cols[2]; ctx.fill();

    // antenas
    ctx.beginPath();
    ctx.moveTo(-1,-11); ctx.lineTo(-7,-20);
    ctx.moveTo( 1,-11); ctx.lineTo( 7,-20);
    ctx.strokeStyle=this.cols[2]; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.arc(-7,-20,2.5,0,Math.PI*2); ctx.arc(7,-20,2.5,0,Math.PI*2);
    ctx.fillStyle=this.cols[0]; ctx.fill();

    ctx.restore();
  }
}

/* ════════════════════════════════════════════════
   ESTRELLAS EN ESQUINAS
════════════════════════════════════════════════ */
const CORNERS = [
  { e:'👑', gx:0, gy:0, px:28, py:28  },
  { e:'🌟', gx:1, gy:0, px:-28,py:28  },
  { e:'🌸', gx:0, gy:1, px:28, py:-28 },
  { e:'💖', gx:1, gy:1, px:-28,py:-28 },
];
function drawCorners(){
  CORNERS.forEach((c,i)=>{
    const scale = 0.8+Math.sin(T*0.05+i*1.2)*0.3;
    const alpha = 0.45+Math.sin(T*0.07+i*0.9)*0.45;
    const x = c.gx===0 ? c.px : W+c.px;
    const y = c.gy===0 ? c.py : H+c.py;
    ctx.save();
    ctx.globalAlpha=Math.max(0,Math.min(1,alpha));
    ctx.font=`${Math.round(30*scale)}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(c.e,x,y);
    ctx.restore();
  });
}

/* ════════════════════════════════════════════════
   INSTANCIAS
════════════════════════════════════════════════ */
const fairy1 = new Fairy('left',  '#c084fc','#f472b6','#f59e0b');
const fairy2 = new Fairy('right', '#e879f9','#a855f7','#c084fc');

let butterflies = [];
function initButterflies(){
  butterflies = [
    new Butterfly(W*0.05, H*0.1,  ['rgba(244,114,182,0.78)','rgba(167,139,250,0.72)','#7c3aed']),
    new Butterfly(W*0.93, H*0.13, ['rgba(196,181,253,0.78)','rgba(252,211,77,0.72)', '#ec4899']),
    new Butterfly(W*0.04, H*0.73, ['rgba(52,211,153,0.72)', 'rgba(244,114,182,0.68)','#a855f7']),
    new Butterfly(W*0.95, H*0.71, ['rgba(251,146,60,0.72)', 'rgba(196,181,253,0.72)','#db2777']),
  ];
}

window.addEventListener('resize',()=>{
  initButterflies();
  unicorn.y     = H*0.82;
  miniPrincess.y= H*0.12+38;
});

unicorn.init();
miniPrincess.init();
initButterflies();

/* ════════════════════════════════════════════════
   LOOP MAESTRO
════════════════════════════════════════════════ */
function masterLoop(){
  ctx.clearRect(0,0,W,H);
  T++;

  // fuegos
  if(fwActive){
    fwParticles=fwParticles.filter(p=>p.alpha>0);
    fwParticles.forEach(p=>p.tick());
  }
  // confeti
  if(cfActive) cfParticles.forEach(p=>p.tick());

  // personajes
  unicorn.tick();
  fairy1.tick();
  fairy2.tick();
  miniPrincess.tick();
  butterflies.forEach(b=>b.tick());
  drawCorners();

  requestAnimationFrame(masterLoop);
}
masterLoop();

/* ════════════════════════════════════════════════
   PARTÍCULAS FLOTANTES (DOM)
════════════════════════════════════════════════ */
(function initParticles(){
  const c=document.getElementById('particles');
  const E=['✨','💖','⭐','💜','🌸','👑','💫','🦋','🌺','💕'];
  for(let i=0;i<42;i++){
    const el=document.createElement('div'); el.classList.add('particle');
    const s=Math.random()*18+10;
    el.style.cssText=`left:${Math.random()*100}%;bottom:${Math.random()*-20}%;width:${s}px;height:${s}px;font-size:${s*.85}px;animation-duration:${Math.random()*10+8}s;animation-delay:${Math.random()*10}s;background:transparent;`;
    el.textContent=E[Math.floor(Math.random()*E.length)];
    c.appendChild(el);
  }
})();

/* ════════════════════════════════════════════════
   LÓGICA SOBRE + INVITACIÓN
════════════════════════════════════════════════ */
function openEnvelope(){
  const v=document.getElementById('guest-input').value.trim();
  window._gname = v || 'Invitad@ especial';
  document.getElementById('screen-name').style.display='none';
  document.getElementById('env-overlay').classList.add('active');
  setTimeout(()=>{
    document.getElementById('env-flap').classList.add('open');
    setTimeout(()=>document.getElementById('env-letter').classList.add('rise'),500);
  },700);
}

function openInvite(){
  document.getElementById('env-overlay').classList.remove('active');
  const name = window._gname || 'Invitad@ especial';
  document.getElementById('display-name').textContent = name;

  const msg = encodeURIComponent(`¡Hola! Soy ${name} y confirmo mi asistencia al cumpleaños de Anna 🎀👑`);
  document.getElementById('wa-link').href = `https://wa.me/51931336424?text=${msg}`;

  document.getElementById('screen-invite').style.display='block';

  // Animaciones de entrada
  ['hdr','card','ftr'].forEach((id,i)=>{
    const el=document.getElementById(id)||document.querySelector(`.${id}`);
    if(!el) return;
    const cls=['anim-pop','anim-up1','anim-up2'][i];
    el.classList.add(cls);
  });
  document.getElementById('hdr').classList.add('anim-pop');
  document.getElementById('card').classList.add('anim-up1');
  document.getElementById('ftr').classList.add('anim-up2');

  window.scrollTo({top:0,behavior:'smooth'});

  setTimeout(()=>{
    startFireworks();
    startConfetti();
    const audio=document.getElementById('bg-music');
    audio.volume=0.45;
    audio.play().catch(()=>{});
    startCountdown();
  },150);
}

document.getElementById('guest-input').addEventListener('keydown',e=>{
  if(e.key==='Enter') openEnvelope();
});

/* ════════════════════════════════════════════════
   CUENTA REGRESIVA
════════════════════════════════════════════════ */
function startCountdown(){
  const target=new Date('2026-03-25T00:00:00');
  function tick(){
    const diff=target-new Date();
    if(diff<=0){
      document.getElementById('countdown').style.display='none';
      document.getElementById('party-msg').style.display='block';
      return;
    }
    document.getElementById('cd-dias').textContent  = String(Math.floor(diff/86400000)).padStart(2,'0');
    document.getElementById('cd-horas').textContent = String(Math.floor((diff%86400000)/3600000)).padStart(2,'0');
    document.getElementById('cd-min').textContent   = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
    document.getElementById('cd-seg').textContent   = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
  }
  tick(); setInterval(tick,1000);
}
