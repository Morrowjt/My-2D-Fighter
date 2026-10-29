import {fighter,strike,advance,FLOOR} from './engine.js';
const canvas=document.querySelector('canvas'),c=canvas.getContext('2d'),keys=new Set();
let players,time,ended,flash=0,last=performance.now();
function reset(){players=[fighter(330,'#7efce4','ECHO'),fighter(770,'#ff86bf','NOVA')];time=90;ended=false;keys.clear();document.querySelector('#result').hidden=true;}
document.querySelector('#restart').onclick=reset;document.querySelector('#again').onclick=reset;
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function text(s,x,y,size,color='#fff',align='left'){c.fillStyle=color;c.font=`bold ${size}px Arial`;c.textAlign=align;c.fillText(s,x,y);}
function drawFighter(p){
 c.save();c.translate(p.x,p.y);c.scale(p.facing,1);
 c.fillStyle='#0006';c.beginPath();c.ellipse(0,FLOOR-p.y+4,45,10,0,0,Math.PI*2);c.fill();
 c.shadowColor=p.color;c.shadowBlur=16;
 rect(-22,-98,44,57,p.stun?'#fff':p.color);rect(-17,-137,35,31,p.color);rect(4,-128,18,7,'#15192b');
 rect(-24,-40,17,40,'#444d6d');rect(10,-40,17,40,'#444d6d');
 rect(-34,-91,12,43,p.color);rect(22,-87,p.attack&&p.kind==='punch'?72:22,14,p.color);
 if(p.attack&&p.kind==='kick'){rect(20,-47,92,16,p.color);}
 rect(-20,-49,40,7,'#f4f1ff');c.restore();
}
function render(){
 const bg=c.createLinearGradient(0,0,0,600);bg.addColorStop(0,'#161831');bg.addColorStop(1,'#38304e');c.fillStyle=bg;c.fillRect(0,0,1100,600);
 c.fillStyle='#c9c6f2';c.beginPath();c.arc(840,160,53,0,Math.PI*2);c.fill();
 for(let i=0;i<24;i++){const h=75+(i*73%170);rect(i*51,450-h,45,h,'#171c33');for(let j=0;j<5;j++)rect(i*51+12,470-h+j*26,5,9,i%3?'#55506b':'#9b667d');}
 rect(0,490,1100,110,'#171b2b');rect(0,490,1100,4,'#b280ae');
 for(let i=0;i<12;i++)rect(i*100,520,60,2,'#30354b');
 text('MIDNIGHT DISTRICT',550,420,14,'#74657e','center');
 for(let i=0;i<2;i++){let p=players[i],x=i?660:40;text(p.name,x,43,18,p.color);rect(x,56,400,18,'#39384a');rect(i?x+400-p.hp*4:x,56,p.hp*4,18,p.color);}
 text(String(Math.ceil(time)).padStart(2,'0'),550,74,40,'#f2ebff','center');text('ROUND 01',550,99,10,'#9799b4','center');players.forEach(drawFighter);
 if(flash>0)rect(0,0,1100,600,'#ffffff18');
}
function frame(now){const dt=Math.min((now-last)/1000,.033);last=now;
 if(!ended&&!document.hidden){time=Math.max(0,time-dt);const [a,b]=players;a.facing=a.x<b.x?1:-1;b.facing=-a.facing;
 advance(a,dt,Number(keys.has('d'))-Number(keys.has('a')),keys.has('w'));advance(b,dt,Number(keys.has('arrowright'))-Number(keys.has('arrowleft')),keys.has('arrowup'));
 if(Math.abs(a.x-b.x)<50&&Math.abs(a.y-b.y)<95){const mid=(a.x+b.x)/2,dir=a.x<b.x?1:-1;a.x=mid-dir*25;b.x=mid+dir*25;}
 for(const [p,target,punch,kick] of [[a,b,'f','g'],[b,a,'k','l']]){if(keys.has(punch)||keys.has(kick)){if(strike(p,target,keys.has(kick)?'kick':'punch'))flash=.09;}}
 if(time===0||players.some(p=>p.hp===0)){ended=true;document.querySelector('#winner').textContent=a.hp===b.hp?'DRAW':`${a.hp>b.hp?a.name:b.name} WINS`;document.querySelector('#result').hidden=false;}}
 flash=Math.max(0,flash-dt);render();requestAnimationFrame(frame);}
reset();requestAnimationFrame(frame);
