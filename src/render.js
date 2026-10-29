import {FLOOR,ROSTER} from './engine.js';
const TAU=Math.PI*2;
function poly(c,pts,fill,stroke='#11151b',line=3){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.lineJoin='round';c.stroke();}}
function line(c,points,color,width){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function circle(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=color;c.fill();}
function label(c,s,x,y,size=16,color='#fff',align='left'){c.font=`900 ${size}px Arial`;c.textAlign=align;c.fillStyle=color;c.fillText(s,x,y);}
export function pose(p,frame){
 const walk=p.state==='walk'?Math.sin(frame*.23):0,bob=Math.sin(frame*.065)*2;
 let head=[1,-139+bob],hip=[0,-62],chest=[-2,-112+bob],frontHand=[39,-97+bob],backHand=[-28,-101+bob],frontElbow=[26,-83],backElbow=[-35,-82],frontKnee=[22+walk*13,-34],backKnee=[-20-walk*13,-31],frontFoot=[27+walk*20,0],backFoot=[-28-walk*20,0],tilt=0;
 if(p.guard){frontHand=[24,-140];frontElbow=[37,-108];backHand=[6,-123];backElbow=[-17,-104];head=[-5,-135];}
 if(p.dash||p.move?.key==='dash'){chest=[21,-107];head=[32,-130];frontHand=[49,-96];backHand=[-57,-69];frontKnee=[31,-28];frontFoot=[51,0];backFoot=[-56,-3];}
 if(p.y<FLOOR-2){hip=[-3,-67];frontKnee=[27,-62];frontFoot=[37,-34];backKnee=[-28,-32];backFoot=[-12,-10];backHand=[-42,-119];}
 if(p.move){const {t,key,data:m}=p.move;const startup=t<m.startup,active=t<m.startup+m.active;const extension=startup?-.45*Math.sin(t/m.startup*Math.PI/2):active?1:Math.max(0,1-(t-m.startup-m.active)/m.recovery);const e=extension<0?extension:Math.sin(Math.min(1,extension)*Math.PI/2);
  if(key==='light'){frontHand=[35+e*65,-104];frontElbow=[28+e*31,-99];chest=[e*9,-112];head=[e*12,-138];backHand=[-6,-122];}
  if(key==='heavy'){hip=[-4,-58];chest=[e*26-10,-108];head=[e*27-10,-135];frontHand=[22+e*91,-78-e*37];frontElbow=[28+e*40,-77];backHand=[-49+e*25,-99];frontFoot=[40,0];backFoot=[-43,0];}
  if(p.id==='grabby'&&key==='heavy'){frontHand=[24+e*57,-122-e*24];frontElbow=[42+e*48,-97];backHand=[-32,-103];chest=[e*20,-111];head=[e*17,-141];}
  if(p.id==='witch'&&key==='heavy'){frontHand=[40+e*90,-117];backHand=[-35,-88];chest=[e*12,-116];head=[e*14,-146];}
  if(key==='airLight'){chest=[13,-112];head=[22,-137];frontHand=[38,-95];frontKnee=[38,-46];frontFoot=[30+e*55,12+e*34];backFoot=[-24,-40];}
  if(key==='airHeavy'){chest=[23,-101];head=[37,-123];frontHand=[51,-79];backHand=[-24,-111];frontKnee=[24,-31];frontFoot=[27+e*48,20+e*59];backKnee=[-27,-63];backFoot=[-37,-31];}
  if(key==='special'){frontHand=[40+e*25,-95];frontElbow=[26,-96];backHand=[37+e*19,-104];backElbow=[-3,-82];head=[3,-142];}
  if(key==='grab'||key==='sky'){frontHand=[35+e*39,-103];backHand=[23+e*43,-72];frontElbow=[28,-76];backElbow=[-14,-57];chest=[e*13,-106];head=[e*13,-134];}
 }
 if(p.state==='throw'){frontHand=[37,-165];backHand=[-13,-166];frontElbow=[43,-122];backElbow=[-35,-128];head=[-6,-143];frontFoot=[36,0];backFoot=[-37,0];}
 if(p.state==='hurt'){chest=[-19,-107];head=[-28,-134];frontHand=[30,-78];backHand=[-49,-80];frontKnee=[18,-26];}
 if(p.state==='captured'){frontHand=[-44,-127];backHand=[36,-137];frontFoot=[47,-12];backFoot=[-39,-19];tilt=-1.5;}
 if(p.down){head=[0,-133];tilt=-1.4;}
 return {head,hip,chest,frontHand,backHand,frontElbow,backElbow,frontKnee,backKnee,frontFoot,backFoot,tilt};
}
export function drawFighter(c,p,frame,alpha=1){
 const q=pose(p,frame),big=p.id==='grabby',witch=p.id==='witch',blitz=p.id==='blitz',superman=p.id==='super';
 c.save();c.globalAlpha=alpha;c.translate(p.x,p.y);c.scale(p.facing,1);
 if(p.down){c.translate(0,-16);c.rotate(q.tilt);c.scale(.86,.86);}else if(p.state==='captured'){c.rotate(q.tilt);}
 const size=big?1.19:1;c.scale(size,size);
 const {hip,chest,head,frontHand,backHand,frontElbow,backElbow,frontKnee,backKnee,frontFoot,backFoot}=q;
 if(superman){const sway=Math.sin(frame*.12)*8;c.beginPath();c.moveTo(chest[0]-13,chest[1]-9);c.bezierCurveTo(-54,-118,-42,-61,-72-sway,-26);c.quadraticCurveTo(-47,-42,-22,-30);c.quadraticCurveTo(-17,-56,hip[0]+5,hip[1]);c.closePath();c.fillStyle='#b94653';c.fill();c.strokeStyle='#161921';c.lineWidth=3;c.stroke();line(c,[[-30,-99],[-43,-45]],'#f98577',2);}
 if(witch){poly(c,[[chest[0]-16,-112],[-38,-52],[-46,-24],[-9,-38],[20,-26],[29,-47],[chest[0]+16,-112]],p.dark);poly(c,[[-29,-55],[-41,-30],[-17,-41],[5,-29],[25,-38],[19,-58]],p.color);}
 function limb(points,color,width){line(c,points,'#11151b',width+5);line(c,points,color,width);}
 const legColor=superman?'#335b76':blitz?'#263b43':big?'#784055':'#64506e';
 limb([hip,backKnee,backFoot],legColor,big?24:17);limb([chest,backElbow,backHand],big?p.skin:p.dark,big?24:15);
 circle(c,...backHand,big?13:9,p.skin);line(c,[[backFoot[0]-4,backFoot[1]],[backFoot[0]+13,backFoot[1]]],superman?'#d95659':'#141d25',15);
 limb([hip,frontKnee,frontFoot],legColor,big?26:18);line(c,[[frontFoot[0]-3,frontFoot[1]],[frontFoot[0]+14,frontFoot[1]]],superman?'#d95659':'#18252b',16);
 const body=big?p.skin:p.dark;
 c.beginPath();c.moveTo(chest[0]-25,chest[1]-9);c.quadraticCurveTo(chest[0]-3,chest[1]-21,chest[0]+23,chest[1]-7);c.bezierCurveTo(chest[0]+30,chest[1]+11,hip[0]+17,hip[1]-11,hip[0]+19,hip[1]+5);c.lineTo(hip[0]-21,hip[1]+4);c.quadraticCurveTo(chest[0]-18,chest[1]+18,chest[0]-25,chest[1]-9);c.fillStyle=body;c.fill();c.strokeStyle='#11151b';c.lineWidth=3;c.stroke();
 if(big){line(c,[[chest[0]-19,chest[1]+7],[chest[0]-3,chest[1]+13],[chest[0]+15,chest[1]+7]],'#9a6555',3);line(c,[[0,-88],[0,-70]],'#a36c57',2);poly(c,[[-29,-119],[-18,-126],[-8,-64],[-20,-61]],'#242d36');}
 else if(superman){poly(c,[[chest[0]-10,chest[1]+2],[chest[0]+13,chest[1]+2],[chest[0]+3,chest[1]+23]],p.color);line(c,[[chest[0]-1,-103],[chest[0]+7,-103]],'#fff4bd',2);}
 else if(blitz){poly(c,[[chest[0]-27,-118],[chest[0]-6,-117],[-9,-64],[-26,-69]],p.color);poly(c,[[chest[0]+9,-115],[chest[0]+24,-111],[18,-66],[8,-64]],p.color);line(c,[[4,-111],[-4,-82],[4,-86],[-1,-69]],'#f9d35d',3);}
 else {line(c,[[chest[0]-14,-116],[chest[0]+9,-95],[chest[0]+19,-115]],p.color,3);circle(c,chest[0]+5,-105,4,'#e4ff97');}
 line(c,[[hip[0]-20,hip[1]],[hip[0]+19,hip[1]]],big?'#242d36':p.color,8);circle(c,hip[0]+4,hip[1],5,'#f6e2a5');
 limb([chest,frontElbow,frontHand],big?p.skin:p.dark,big?25:16);
 if(big){circle(c,(chest[0]+frontElbow[0])/2,(chest[1]+frontElbow[1])/2,15,p.skin);line(c,[[frontElbow[0]-3,frontElbow[1]-5],[frontHand[0]-5,frontHand[1]-5]],'#e9b38b',3);}
 line(c,[[frontHand[0]-8,frontHand[1]],[frontHand[0]+1,frontHand[1]]],p.color,big?22:18);circle(c,frontHand[0]+6,frontHand[1]-1,big?12:9,p.skin);line(c,[[frontHand[0]+5,frontHand[1]-5],[frontHand[0]+10,frontHand[1]-4]],'#f5d7b1',2);line(c,[[frontHand[0]+11,frontHand[1]+1],[frontHand[0]+11,frontHand[1]+5]],'#8c6658',2);
 if(witch){line(c,[[frontHand[0]+6,frontHand[1]],[frontHand[0]+20,frontHand[1]-14]],p.skin,4);circle(c,frontHand[0]+23,frontHand[1]-21,5+Math.sin(frame*.2)*2,p.color);}
 const [hx,hy]=head;line(c,[[hx,hy+19],[chest[0],chest[1]]],p.skin,16);
 poly(c,[[hx-17,hy-13],[hx+12,hy-16],[hx+20,hy-3],[hx+17,hy+15],[hx+4,hy+23],[hx-14,hy+12]],p.skin);
 if(witch){poly(c,[[hx-20,hy-5],[hx-20,hy+35],[hx-9,hy+23],[hx-7,hy-5]],'#b9c9d3');poly(c,[[hx-31,hy-15],[hx-15,hy-25],[hx-8,hy-72],[hx+14,hy-44],[hx+20,hy-20],[hx+36,hy-10]],'#332d49');line(c,[[hx-18,hy-24],[hx+20,hy-20]],p.color,7);}
 else if(big){poly(c,[[hx-17,hy-8],[hx-15,hy-19],[hx+10,hy-20],[hx+18,hy-9]],'#302c30');poly(c,[[hx-11,hy+12],[hx+17,hy+9],[hx+12,hy+23],[hx-1,hy+25]],'#443134');}
 else if(blitz){poly(c,[[hx-19,hy],[hx-23,hy-21],[hx-11,hy-19],[hx-7,hy-35],[hx+3,hy-21],[hx+14,hy-30],[hx+15,hy-14],[hx+23,hy-11]],'#e6e6d5');line(c,[[hx-16,hy+2],[hx+14,hy-3]],'#262a34',6);}
 else {poly(c,[[hx-17,hy-2],[hx-21,hy-18],[hx-9,hy-26],[hx+14,hy-23],[hx+20,hy-11],[hx+4,hy-15],[hx-4,hy-5]],'#25333d');}
 line(c,[[hx+3,hy+1],[hx+13,hy]],p.stun?'#fff':'#22252e',3);line(c,[[hx+6,hy+12],[hx+14,hy+10]],'#714c4a',2);
 if(p.invuln){c.globalCompositeOperation='screen';c.shadowBlur=15;c.shadowColor='#b9ff70';line(c,[[-60,-151],[-6,-160],[65,-119]],'#d4ff9b',3);line(c,[[-75,-53],[-5,-33],[53,-64]],'#b9ff70',3);}
 c.restore();
}
export function drawPortrait(canvas,id){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);const spec=ROSTER.find(p=>p.id===id);c.save();c.translate(canvas.width/2,canvas.height+25);c.scale(.98,.98);drawFighter(c,{...spec,x:0,y:0,facing:1,state:'idle'},0);c.restore();}
export function draw(c,g,{debug=false}={}){
 const w=1100,h=600;c.clearRect(0,0,w,h);
 const bg=c.createLinearGradient(0,0,0,600);bg.addColorStop(0,'#101c2b');bg.addColorStop(1,'#49374f');c.fillStyle=bg;c.fillRect(0,0,w,h);
 // Deterministic skyline, layered parallax, blinking windows.
 circle(c,857,143,43,'#c5d2c6');circle(c,840,130,43,'#172333');
 for(let layer=0;layer<2;layer++)for(let i=0;i<25;i++){const x=i*51-layer*16,bh=65+(i*67+layer*31)%175,y=425-bh+layer*12;c.fillStyle=layer?'#1c2838':'#293247';c.fillRect(x,y,46,bh);c.fillRect(x+18,y-12,3,13);for(let j=0;j<6;j++)for(let k=0;k<3;k++){if((i*3+j+k)%4===0)continue;c.fillStyle=(i+j)%7===0?'#96b89588':'#728da42c';c.fillRect(x+7+k*12,y+12+j*23,4,7);}}
 c.save();c.translate(0,Math.sin(g.frame*.008)*2);c.shadowColor='#d49bff';c.shadowBlur=13;label(c,'不良会社',145,271,32,'#ca99f1');label(c,'OPEN ALL NIGHT',928,333,10,'#b9e97d','center');c.restore();
 c.fillStyle='#17222a';c.fillRect(0,418,w,182);c.fillStyle='#34434a';c.fillRect(0,422,w,9);c.fillStyle='#99bd6b';c.fillRect(0,430,w,2);
 c.fillStyle='#222f37';c.fillRect(0,FLOOR,w,128);c.fillStyle='#4d5b56';c.fillRect(0,FLOOR,w,3);
 for(let i=0;i<14;i++){line(c,[[i*92-100,600],[i*76+30,FLOOR]],'#354248',1);}for(let i=0;i<3;i++)line(c,[[0,500+i*42],[1100,500+i*42]],'#354248',1);
 c.globalAlpha=.09;label(c,'BAD COMPANY',550,574,58,'#d5e6c2','center');c.globalAlpha=1;
 c.save();if(g.shake>0.2)c.translate(Math.sin(g.frame*7)*g.shake,Math.cos(g.frame*11)*g.shake*.5);
 // The orbital throw zooms out so both fighters remain visible at its apex.
 const orbital=g.throw?.sky;const target=orbital?.46:1;g.cameraZoom=(g.cameraZoom??1)+(target-(g.cameraZoom??1))*.12;
 c.translate(550,FLOOR);c.scale(g.cameraZoom,g.cameraZoom);c.translate(-550,-FLOOR);
 for(const p of g.players){c.save();c.globalAlpha=.4;c.fillStyle='#060d15';c.beginPath();c.ellipse(p.x,FLOOR+4,46,p.id==='grabby'?10:7,0,0,TAU);c.fill();c.restore();}
 for(const p of g.players){if(p.invuln){for(let i=3;i>=1;i--)drawFighter(c,{...p,x:p.x-p.facing*i*24},g.frame,.1+(3-i)*.05);}drawFighter(c,p,g.frame);}
 for(const p of g.players){if(p.move){const {t,data:m,key}=p.move;if(t>=m.startup&&t<m.startup+m.active&&!m.throw&&key!=='special'){c.save();c.translate(p.x,p.y);c.scale(p.facing,1);c.strokeStyle=p.color;c.globalAlpha=.65;c.lineWidth=key.includes('Heavy')||key==='heavy'?8:4;c.beginPath();if(p.id==='witch'&&key==='heavy'){c.shadowColor=p.color;c.shadowBlur=12;c.ellipse(66,-100,95,42,-.3,-1.2,1.4);}else if(key.startsWith('air'))c.ellipse(40,-12,64,72,-.6,-1.8,1.1);else c.ellipse(25,-92,94,44,0,-1.1,.7);c.stroke();c.restore();}}}
 for(const s of g.projectiles){c.save();c.translate(s.x,s.y);c.shadowColor=s.owner.color;c.shadowBlur=24;const witch=s.owner.id==='witch';c.rotate(g.frame*.14);if(witch){poly(c,[[0,-s.r],[s.r,0],[0,s.r],[-s.r,0]],s.owner.color);circle(c,0,0,9,'#f0d9ff');c.strokeStyle=s.owner.color;c.lineWidth=2;c.beginPath();c.arc(0,0,s.r+8,0,TAU);c.stroke();}else{circle(c,0,0,s.r,s.owner.color);circle(c,-4,-3,s.r*.6,'#fcffe6');}c.restore();}
 for(const s of g.particles){c.globalAlpha=s.life/s.max;line(c,[[s.x,s.y],[s.x-s.vx*1.7,s.y-s.vy*1.7]],s.color,3);}c.globalAlpha=1;
 if(g.throw?.impact){const t=g.throw;c.save();c.translate(t.b.x,FLOOR);c.scale(1,.27);c.strokeStyle=t.sky?'#e0ff98':t.a.color;c.lineWidth=4;c.beginPath();c.arc(0,0,(t.t-(t.sky?63:34))*13+20,0,TAU);c.stroke();c.restore();}
 if(debug){for(const p of g.players){c.strokeStyle='#66aaff';c.strokeRect(p.x-28,p.y-133,56,133);if(p.move){const m=p.move;const active=m.t>=m.data.startup&&m.t<m.data.startup+m.data.active;c.strokeStyle=active?'#ff5151':'#ffdf5188';const air=m.key==='airLight'?50:m.key==='airHeavy'?108:-23;const top=m.key==='airLight'?-65:m.key==='airHeavy'?-45:-113;c.strokeRect(p.x+(p.facing===1?8:-m.data.reach),p.y+top,m.data.reach-8,air-top);}}}
 c.restore();
 for(let i=0;i<2;i++){const p=g.players[i];if(p.combo>=2&&p.comboLife>0){const x=i?1048:52;label(c,`${p.combo} HITS`,x,198,31,p.color,i?'right':'left');label(c,`${p.comboDamage} DAMAGE`,x,219,12,'#e2e8da',i?'right':'left');}}
 if(g.phase==='intro'||g.phase==='roundEnd'){c.fillStyle='#101c28b0';c.fillRect(0,235,w,100);label(c,g.announcement,550,299,g.announcement.length>15?36:54,'#d6f786','center');}
 if(g.training){label(c,'TRAINING  /  INFINITE METER',550,591,10,'#badb8b','center');}
}
