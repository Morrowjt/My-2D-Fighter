// All combat advances at 60 Hz. Rendering never determines hit timing.
export const FLOOR=472, WIDTH=1100, STEP=1/60;
const WAKE_THROW_PROTECTION=12; // Throw immunity only: wake-up strikes remain vulnerable.
export const ROSTER=[
 {id:'super',name:'Super Fighting Man',short:'SUPER',role:'ALL-ROUNDER',color:'#c5f567',dark:'#325574',skin:'#e4ac80',speed:4.3,jump:13.5,hp:1000,tag:'A cape. A cause. A very good right hook.',special:'Super Shot',grab:'Heroic Toss'},
 {id:'grabby',name:'Grabby Guy',short:'GRABBY',role:'GRAPPLER',color:'#f3aa57',dark:'#683958',skin:'#c88c68',speed:3.1,jump:12,hp:1180,tag:'Personal space is a suggestion.',special:'Orbital Eviction',grab:'Rent Is Due'},
 {id:'witch',name:'Witch Bitch',short:'WITCH',role:'ZONER',color:'#ce99ff',dark:'#503562',skin:'#c5a5c9',speed:3.8,jump:13,hp:900,tag:'Bad intentions. Excellent range.',special:'Hex Appeal',grab:'Cursed Goodbye'},
 {id:'blitz',name:'Blitz Bastard',short:'BLITZ',role:'RUSHDOWN',color:'#ff7771',dark:'#793e3b',skin:'#c2987e',speed:5.4,jump:14,hp:940,tag:'No brakes. No inside voice.',special:'Blitz Breaker',grab:'Back Alley'}
];
export const MOVES={
 light:{startup:5,active:4,recovery:13,damage:44,reach:91,height:72,stun:24,push:4.5},
 heavy:{startup:11,active:5,recovery:24,damage:92,reach:125,height:84,stun:30,push:7},
 airLight:{startup:5,active:9,recovery:13,damage:48,reach:94,height:115,stun:25,push:4.2},
 airHeavy:{startup:9,active:14,recovery:22,damage:100,reach:110,height:153,stun:32,push:8,down:true},
 grab:{startup:7,active:3,recovery:30,damage:145,reach:82,height:70,throw:true},
 special:{startup:13,active:5,recovery:27,damage:120,reach:130,height:85,stun:34,push:9,down:true,cost:50},
 sky:{startup:10,active:4,recovery:39,damage:260,reach:108,height:80,throw:true,cost:50},
 dash:{startup:6,active:19,recovery:28,damage:170,reach:110,height:85,stun:36,push:14,down:true,cost:50}
};
export function createFighter(id,x,side){const spec=ROSTER.find(p=>p.id===id)||ROSTER[0];return {...spec,x,y:FLOOR,vx:0,vy:0,facing:side,maxHp:spec.hp,meter:0,state:'idle',move:null,stun:0,down:0,invuln:false,throwProtection:0,guard:false,buffer:[],combo:0,comboDamage:0,comboLife:0,wins:0,aiWait:0,dash:0,landing:0};}
export function createGame(p1='super',p2='grabby',training=false,rng=Math.random){return {players:[createFighter(p1,310,1),createFighter(p2,790,-1)],training,rng,frame:0,time:99*60,round:1,phase:'intro',phaseTime:100,freeze:0,shake:0,particles:[],projectiles:[],events:[],throw:null,announcement:'ROUND 1',winner:null};}
export function beginRound(g){g.phase='fight';g.phaseTime=0;g.announcement='';}
export function input(g,index,action){const p=g.players[index];if(g.phase!=='fight')return;p.buffer.push({action,ttl:9});if(p.buffer.length>5)p.buffer.shift();}
export function moveData(p,key){const m={...MOVES[key]};if(p.id==='grabby'){if(key==='light'){m.reach+=9;m.damage+=8;}if(key==='heavy'){m.damage+=25;m.startup+=3;}if(key==='grab'){m.reach=102;m.damage=185;}}if(p.id==='blitz'&&key==='light'){m.startup=3;m.recovery=10;m.stun=23;}if(p.id==='witch'&&key==='heavy'){m.reach=165;m.damage=78;}return m;}
export function isAir(p){return p.y<FLOOR-2;}
export function tryAction(g,p,action){
 if(p.stun||p.down||g.throw||p.landing)return false;
 let key=action;
 if(action==='special'){if(p.meter<50||isAir(p))return false;key=p.id==='grabby'?'sky':p.id==='blitz'?'dash':'special';}
 if(action==='grab'&&isAir(p))return false;
 if((action==='light'||action==='heavy')&&isAir(p))key=action==='light'?'airLight':'airHeavy';
 if(p.move){const old=p.move;const chain=(['light','airLight'].includes(old.key)&&['heavy','airHeavy'].includes(key))||(['heavy','airHeavy'].includes(old.key)&&['special','sky','dash'].includes(key));if(!old.connected||!chain)return false;}
 else if(p.dash)return false;
 if(action==='jump'){if(isAir(p))return false;p.vy=-p.jump;p.state='jump';p.guard=false;return true;}
 if(action==='forward'){if(isAir(p))return false;p.dash=13;p.state='dash';p.guard=false;return true;}
 if(!MOVES[key])return false;
 const data=moveData(p,key);if(data.cost)p.meter-=data.cost;
 p.move={key,t:0,data,connected:false,hit:false,spawned:false};p.guard=false;p.state='attack';
 g.events.push({type:'move',x:p.x,y:p.y-80,label:key==='special'||key==='sky'||key==='dash'?p.special:'',key});return true;
}
export function attackBox(p){if(!p.move)return null;const {key,data:m}=p.move;let top=p.y-113,bottom=p.y-23;
 if(key==='airLight'){top=p.y-65;bottom=p.y+50;}if(key==='airHeavy'){top=p.y-45;bottom=p.y+108;}
 return {left:p.facing===1?p.x+8:p.x-m.reach,right:p.facing===1?p.x+m.reach:p.x-8,top,bottom};}
export function hurtBox(p){const w=p.id==='grabby'?39:27;return {left:p.x-w,right:p.x+w,top:p.y-(p.id==='grabby'?145:133),bottom:p.y};}
export function overlap(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}
export function isInvulnerable(p){return p.invuln||p.down>0;}
function sparks(g,x,y,color,big=false){for(let i=0;i<(big?23:12);i++){const angle=g.rng()*Math.PI*2,s=2+g.rng()*10;g.particles.push({x,y,vx:Math.cos(angle)*s,vy:Math.sin(angle)*s,life:big?24:15,max:big?24:15,color});}}
export function hit(g,a,b,m,projectile=false){
 if(isInvulnerable(b))return false;
 const blocked=b.guard&&!isAir(b)&&!m.throw;
 const damage=blocked?Math.ceil(m.damage*.14):Math.round(m.damage*Math.max(.55,1-a.combo*.09));
 b.hp=Math.max(0,b.hp-damage);b.stun=blocked?12:m.stun||24;b.move=null;b.dash=0;b.invuln=false;
 b.state=blocked?'block':'hurt';b.vx=a.facing*(blocked?2:m.push||6);b.guard=blocked;
 if(!blocked){a.combo++;a.comboDamage+=damage;a.comboLife=100;if(m.down){b.down=40;b.vy=-5;}}
 a.meter=Math.min(100,a.meter+(blocked?3:9));b.meter=Math.min(100,b.meter+4);
 g.freeze=blocked?4:m.damage>=90?9:6;g.shake=blocked?1:m.damage>=90?5:2;
 sparks(g,b.x-a.facing*20,b.y-75,blocked?'#8ccfff':a.color,m.damage>=90);
 g.events.push({type:blocked?'block':'hit',damage,x:b.x,y:b.y-90,heavy:m.damage>=90,projectile});return true;
}
function startThrow(g,a,b,sky){g.throw={a,b,sky,t:0,ax:a.x,bx:b.x,baseX:Math.max(130,Math.min(970,(a.x+b.x)/2)),damage:sky?260:a.id==='grabby'?185:145,impact:false};a.move=null;b.move=null;a.dash=b.dash=0;a.guard=b.guard=false;b.stun=999;a.state='throw';b.state='captured';g.events.push({type:'grab',x:b.x,y:b.y-90,label:sky?'ORBITAL EVICTION':a.grab});}
function updateThrow(g){const t=g.throw,{a,b,sky}=t;t.t++;
 if(sky){
  if(t.t<19){a.x=t.baseX-24*a.facing;b.x=t.baseX+18*a.facing;a.y=FLOOR;b.y=FLOOR-25-(t.t/19)*35;}
  else if(t.t<63){const f=(t.t-19)/44;const h=Math.sin(f*Math.PI)*590;a.x=t.baseX-20*a.facing;b.x=t.baseX+20*a.facing;a.y=FLOOR-h;b.y=a.y-48;}
  else {a.y=FLOOR;b.y=FLOOR;}
 }else{const f=Math.min(1,t.t/34);a.x=t.baseX-30*a.facing;a.y=FLOOR;b.x=a.x+Math.cos(f*Math.PI)*65*a.facing;b.y=FLOOR-Math.sin(f*Math.PI)*157;}
 const impactFrame=sky?63:34;
 if(t.t===impactFrame){t.impact=true;b.hp=Math.max(0,b.hp-t.damage);b.y=FLOOR;b.vy=0;a.meter=Math.min(100,a.meter+10);b.meter=Math.min(100,b.meter+8);a.combo++;a.comboDamage+=t.damage;a.comboLife=100;g.freeze=sky?17:10;g.shake=sky?14:7;sparks(g,b.x,FLOOR-8,a.color,true);g.events.push({type:'slam',x:b.x,y:FLOOR,sky,damage:t.damage});}
 if(t.t>impactFrame+15){b.stun=0;b.down=sky?55:32;b.state='down';a.state='idle';a.landing=sky?10:26;g.throw=null;}
}
function cpu(g,p,b){
 if(g.training||g.phase!=='fight')return {};
 const distance=Math.abs(p.x-b.x);p.aiWait--;
 const control={axis:distance>140?(b.x>p.x?1:-1):distance<75&&p.id==='witch'?(b.x>p.x?-1:1):0,guard:!!b.move&&distance<180&&g.rng()<.84};
 if(p.aiWait<=0&&!p.move&&!p.stun&&!p.down){p.aiWait=15+Math.floor(g.rng()*22);const r=g.rng();if(distance<105&&p.id==='grabby')input(g,1,p.meter>=50&&r<.5?'special':'grab');else if(p.meter>=50&&(distance>150||r<.3))input(g,1,'special');else if(distance<175)input(g,1,r<.6?'light':'heavy');else if(r<.18)input(g,1,'jump');else if(r<.4)input(g,1,'forward');}
 if(p.move?.connected&&p.aiWait<15){if(['light','airLight'].includes(p.move.key))input(g,1,'heavy');else if(p.meter>=50)input(g,1,'special');}return control;
}
function updateFighter(g,p,b,controls){
 if(p.comboLife>0)p.comboLife--;else {p.combo=0;p.comboDamage=0;}
 if(p.landing)p.landing--;if(p.stun)p.stun--;if(p.down){p.down--;p.state='down';p.guard=false;if(p.down===0){p.state='idle';p.stun=0;}}
 p.invuln=false;
 if(!p.down&&!p.stun){
  p.guard=!!controls.guard&&!isAir(p)&&!p.move&&!p.dash;
  if(!p.move&&!p.dash)p.facing=b.x>=p.x?1:-1;
  for(let i=0;i<p.buffer.length;i++){if(tryAction(g,p,p.buffer[i].action)){p.buffer.splice(0,i+1);break;}}
  if(!p.move&&!p.dash){p.vx=p.guard?0:(controls.axis||0)*p.speed;p.state=isAir(p)?'jump':p.guard?'guard':p.vx?'walk':'idle';}
 }
 for(const buf of p.buffer)buf.ttl--;p.buffer=p.buffer.filter(i=>i.ttl>0);
 if(p.dash){p.dash--;p.vx=p.facing*10;}
 if(p.move){const move=p.move,m=move.data;move.t++;
  const active=move.t>=m.startup&&move.t<m.startup+m.active;
  if(move.key==='dash'){p.invuln=move.t>=m.startup&&move.t<m.startup+m.active;p.vx=p.invuln?p.facing*15:0;}
  else if(move.key==='sky')p.vx=move.t<m.startup?p.facing*4.5:0;
  else if(!isAir(p))p.vx*=.6;
  if(move.key==='airHeavy'&&move.t>=m.startup){p.vy=Math.max(p.vy,9);p.vx=p.facing*4;}
  if(active&&!move.spawned&&move.key==='special'&&(p.id==='super'||p.id==='witch')){move.spawned=true;g.projectiles.push({owner:p,x:p.x+p.facing*55,y:p.y-80,vx:p.facing*(p.id==='witch'?6:9),life:130,r:p.id==='witch'?25:19,data:m});}
  if(active&&!move.hit&&!(move.key==='special'&&(p.id==='super'||p.id==='witch'))){
   if(overlap(attackBox(p),hurtBox(b))&&!isInvulnerable(b)){
    if(m.throw){if(!b.throwProtection&&!isAir(b)&&(move.key==='sky'||!b.stun)&&!b.move?.data.throw){move.hit=true;startThrow(g,p,b,move.key==='sky');return;}}
    else {const blocked=b.guard;if(hit(g,p,b,m)){move.hit=true;move.connected=!blocked;}}
   }
  }
  if(move.t>=m.startup+m.active+m.recovery){p.move=null;p.invuln=false;p.state='idle';}
 }
 p.x=Math.max(42,Math.min(WIDTH-42,p.x+p.vx));if(p.stun||p.down)p.vx*=.85;
 p.vy+=.65;p.y+=p.vy;if(p.y>=FLOOR){if(p.vy>2&&p.move?.key.startsWith('air')){p.move=null;p.landing=9;}p.y=FLOOR;p.vy=0;}
}
function finishRound(g){const [a,b]=g.players;g.phase='roundEnd';g.phaseTime=160;const winner=a.hp===b.hp?-1:a.hp>b.hp?0:1;g.winner=winner;if(winner>=0)g.players[winner].wins++;g.announcement=winner<0?'DOUBLE K.O.':`${g.players[winner].short} WINS`;if(g.players.some(p=>p.wins>=2))g.announcement+=' · MATCH';g.events.push({type:'round'});}
export function tick(g,controls=[{},{}]){
 g.events=[];g.frame++;if(g.freeze>0){g.freeze--;return;}
 g.shake*=.8;for(const s of g.particles){s.x+=s.vx;s.y+=s.vy;s.vy+=.3;s.life--;}g.particles=g.particles.filter(p=>p.life>0);
 if(g.phase==='intro'){g.phaseTime--;if(g.phaseTime===40)g.announcement='FIGHT';if(g.phaseTime<=0)beginRound(g);return;}
 if(g.phase==='roundEnd'){g.phaseTime--;if(g.phaseTime<=0){if(g.players.some(p=>p.wins>=2)){g.phase='matchEnd';return;}const wins=g.players.map(p=>p.wins),ids=g.players.map(p=>p.id);g.players=[createFighter(ids[0],310,1),createFighter(ids[1],790,-1)];g.players.forEach((p,i)=>p.wins=wins[i]);g.projectiles=[];g.round++;g.time=99*60;g.phase='intro';g.phaseTime=100;g.announcement=`ROUND ${g.round}`;}return;}
 if(g.phase!=='fight')return;
 if(!g.training)g.time--;
 if(g.throw)updateThrow(g);else{
 // Set wake-up protection before either fighter resolves a hit, regardless of slot.
 for(const p of g.players){
  if(p.throwProtection>0)p.throwProtection--;
  if(p.down===1)p.throwProtection=WAKE_THROW_PROTECTION;
 }
 const ai=cpu(g,g.players[1],g.players[0]);
 // Establish guards simultaneously before resolving either fighter's attacks.
 g.players.forEach((p,i)=>{const ctl=i===1&&!g.training?ai:controls[i]||{};p.guard=!!ctl.guard&&!isAir(p)&&!p.move&&!p.stun&&!p.down;});
 updateFighter(g,g.players[0],g.players[1],controls[0]||{});
 if(!g.throw)updateFighter(g,g.players[1],g.players[0],g.training?controls[1]||{}:ai);
 if(!g.throw){const [a,b]=g.players;const gap=a.id==='grabby'||b.id==='grabby'?66:54;if(Math.abs(a.x-b.x)<gap&&Math.abs(a.y-b.y)<100){const dir=a.x<=b.x?1:-1,mid=Math.max(gap/2+42,Math.min(WIDTH-gap/2-42,(a.x+b.x)/2));a.x=mid-dir*gap/2;b.x=mid+dir*gap/2;}}
 }
 for(const shot of g.projectiles){shot.x+=shot.vx;shot.life--;const b=g.players.find(p=>p!==shot.owner);if(shot.life>0&&overlap({left:shot.x-shot.r,right:shot.x+shot.r,top:shot.y-shot.r,bottom:shot.y+shot.r},hurtBox(b))){if(hit(g,shot.owner,b,shot.data,true))shot.life=0;}}
 g.projectiles=g.projectiles.filter(p=>p.life>0&&p.x>-80&&p.x<WIDTH+80);
 if(g.training){g.players.forEach(p=>{p.meter=100;if(p.hp<=0)p.hp=p.maxHp;});}
 else if(!g.throw&&(g.players.some(p=>p.hp<=0)||g.time<=0))finishRound(g);
}
