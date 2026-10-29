export const FLOOR=490;
export function fighter(x,color,name){return {x,y:FLOOR,vx:0,vy:0,color,name,hp:100,facing:x<550?1:-1,cooldown:0,attack:0,kind:'punch',stun:0};}
export function strike(a,b,kind){
  if(a.cooldown>0||a.stun>0)return false;
  a.kind=kind;a.attack=.18;a.cooldown=kind==='kick'?.65:.4;
  const distance=(b.x-a.x)*a.facing;
  if(distance>0&&distance<(kind==='kick'?145:105)&&Math.abs(a.y-b.y)<85){b.hp=Math.max(0,b.hp-(kind==='kick'?14:9));b.stun=.18;b.vx=a.facing*370;return true;}
  return false;
}
export function advance(p,dt,axis,jump){
 p.cooldown=Math.max(0,p.cooldown-dt);p.attack=Math.max(0,p.attack-dt);p.stun=Math.max(0,p.stun-dt);
 if(p.stun===0){p.vx=axis*260;if(jump&&p.y>=FLOOR)p.vy=-650;}
 p.vy+=1700*dt;p.x=Math.max(45,Math.min(1055,p.x+p.vx*dt));p.y+=p.vy*dt;
 if(p.y>=FLOOR){p.y=FLOOR;p.vy=0;}
}
