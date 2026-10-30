import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,beginRound,input,tick,tryAction,attackBox,isInvulnerable,MOVES,FLOOR} from '../src/engine.js';
function game(a='super',b='super'){const g=createGame(a,b,true,()=>.5);beginRound(g);g.players[0].x=400;g.players[1].x=480;g.players.forEach(p=>p.meter=100);return g;}
function step(g,n=1,controls=[{},{}]){for(let i=0;i<n;i++)tick(g,controls);}
function until(g,predicate,max=300,controls=[{},{}]){for(let i=0;i<max;i++){if(predicate())return;tick(g,controls);}assert.ok(predicate(),'condition reached within frame budget');}

test('light deals damage during active frames, never on button press or startup',()=>{const g=game(),[a,b]=g.players;input(g,0,'light');assert.equal(b.hp,1000);step(g,4);assert.equal(b.hp,1000);step(g);assert.equal(b.hp,956);assert.ok(a.move.connected);const hp=b.hp;step(g,10);assert.equal(b.hp,hp,'one hit per move');});
test('whiff cannot cancel and completes recovery',()=>{const g=game(),[a,b]=g.players;b.x=800;input(g,0,'light');step(g,8);assert.equal(a.move.connected,false);assert.equal(tryAction(g,a,'heavy'),false);step(g,13);assert.equal(a.move.key,'light');step(g);assert.equal(a.move,null);assert.equal(tryAction(g,a,'heavy'),true);});
test('confirmed light → heavy → special combo, buffered through hit-stop',()=>{const g=game(),[a,b]=g.players;input(g,0,'light');step(g,5);assert.equal(a.combo,1);input(g,0,'heavy');until(g,()=>a.move?.key==='heavy');assert.equal(a.move.key,'heavy');until(g,()=>a.combo===2);input(g,0,'special');until(g,()=>a.move?.key==='special');assert.equal(a.meter,100,'training restores meter');until(g,()=>a.combo===3);assert.ok(b.hp<800);});
test('guard reduces strikes and does not allow hit-confirm cancels',()=>{const g=game(),[a,b]=g.players;input(g,0,'heavy');step(g,12,[{},{guard:true}]);assert.equal(b.hp,1000-Math.ceil(92*.14));assert.equal(a.move.connected,false);assert.equal(tryAction(g,a,'special'),false);});
test('free command grab bypasses guard, visibly lifts, then slams once',()=>{const g=game('grabby'),[a,b]=g.players;a.meter=0;input(g,0,'grab');until(g,()=>g.throw!==null,30,[{},{guard:true}]);assert.equal(g.throw.sky,false);assert.equal(b.hp,1000);assert.equal(a.meter,100,'training replenishes meter');step(g,14);assert.ok(b.y<FLOOR-100);assert.equal(b.hp,1000,'no damage before impact');until(g,()=>g.throw?.impact);assert.equal(b.hp,815);until(g,()=>!g.throw);assert.ok(b.down>0);assert.equal(b.hp,815);});
test('orbital throw spends 50, sends BOTH fighters high and applies one dramatic knockdown',()=>{const g=game('grabby'),[a,b]=g.players;g.training=false;b.aiWait=999;a.meter=50;assert.equal(tryAction(g,a,'special'),true);assert.equal(a.meter,0);until(g,()=>!!g.throw);assert.equal(g.throw.sky,true);until(g,()=>g.throw?.t===41);assert.ok(a.y<FLOOR-500);assert.ok(b.y<FLOOR-500);assert.equal(b.hp,1000);until(g,()=>g.throw?.impact);assert.equal(b.hp,740);assert.ok(g.freeze>=16);assert.ok(g.shake>=14);until(g,()=>!g.throw);assert.ok(b.down>=50);assert.equal(b.hp,740);});
test('grabs fail against airborne targets and whiffs retain recovery',()=>{const g=game('grabby'),[a,b]=g.players;b.y=FLOOR-80;b.vy=-8;input(g,0,'grab');step(g,12);assert.equal(g.throw,null);assert.equal(b.hp,1000);assert.equal(a.move.key,'grab');});
test('Blitz Breaker is invulnerable only during travel/attack; recovery is punishable',()=>{const g=game('blitz'),[a,b]=g.players;b.x=950;tryAction(g,a,'special');assert.equal(isInvulnerable(a),false);step(g,6);assert.equal(a.move.key,'dash');assert.equal(isInvulnerable(a),true);const x=a.x;step(g,3);assert.ok(a.x>x+30);until(g,()=>a.move.t===25);assert.equal(isInvulnerable(a),false);assert.equal(a.vx,0);assert.equal(tryAction(g,a,'light'),false);b.x=a.x+65;b.facing=-1;tryAction(g,b,'light');until(g,()=>a.hp<a.maxHp);assert.ok(a.hp<a.maxHp);});
test('invulnerable Blitz ignores an overlapping projectile, then can be hit in recovery',()=>{const g=game('blitz'),[a,b]=g.players;b.x=1000;tryAction(g,a,'special');step(g,6);g.projectiles.push({owner:b,x:a.x,y:a.y-80,vx:0,r:100,life:200,data:MOVES.special});step(g);assert.equal(a.hp,a.maxHp);until(g,()=>a.move.t===25);g.projectiles.push({owner:b,x:a.x,y:a.y-80,vx:0,r:100,life:100,data:MOVES.special});step(g);assert.ok(a.hp<a.maxHp);});
test('aerial light reaches below feet; aerial heavy dives with a distinct box and stronger damage',()=>{const g=game(),[a,b]=g.players;a.y=FLOOR-90;a.vy=0;tryAction(g,a,'light');assert.equal(a.move.key,'airLight');assert.equal(attackBox(a).bottom,a.y+50);until(g,()=>b.hp<1000);assert.equal(b.hp,952);const h=game(),[c,d]=h.players;c.y=FLOOR-130;c.vy=-2;tryAction(h,c,'heavy');assert.equal(c.move.key,'airHeavy');assert.equal(attackBox(c).bottom,c.y+108);step(h,9);assert.ok(c.vy>=9);until(h,()=>d.hp<1000);assert.equal(d.hp,900);assert.ok(d.down>0);});
test('specials require meter, projectiles use character-specific speed and size',()=>{for(const id of ['super','witch','blitz','grabby']){const g=game(id),a=g.players[0];a.meter=49;assert.equal(tryAction(g,a,'special'),false);assert.equal(a.meter,49);}for(const id of ['super','witch']){const g=game(id);g.players[1].x=950;tryAction(g,g.players[0],'special');step(g,13);assert.equal(g.projectiles.length,1);assert.equal(g.projectiles[0].vx,id==='super'?9:6);}});
test('inactive training opponent, infinite meter and no timer',()=>{const g=game();const b={x:g.players[1].x,y:g.players[1].y};step(g,250);assert.equal(g.time,99*60);assert.equal(g.players[1].x,b.x);assert.equal(g.players[1].y,b.y);assert.equal(g.players[1].move,null);assert.equal(g.players[0].meter,100);});
test('first to two wins advances rounds and ends the match',()=>{const g=game();g.training=false;g.players[1].hp=0;step(g);assert.equal(g.phase,'roundEnd');assert.equal(g.players[0].wins,1);step(g,160);assert.equal(g.phase,'intro');assert.equal(g.round,2);assert.equal(g.players[0].hp,g.players[0].maxHp);step(g,100);assert.equal(g.phase,'fight');g.players[1].hp=0;step(g);step(g,160);assert.equal(g.phase,'matchEnd');assert.equal(g.players[0].wins,2);});
test('timer adjudicates the round, ties award neither fighter a win',()=>{const g=game();g.training=false;g.time=1;step(g);assert.equal(g.phase,'roundEnd');assert.equal(g.winner,-1);assert.deepEqual(g.players.map(p=>p.wins),[0,0]);});
test('movement, forward dash and jumping respond immediately',()=>{const g=game();const a=g.players[0];step(g,1,[{axis:1},{}]);assert.ok(a.x>400);input(g,0,'jump');step(g);assert.ok(a.y<FLOOR);assert.equal(tryAction(g,a,'forward'),false);until(g,()=>a.y===FLOOR);g.players[1].x=1000;const x=a.x;input(g,0,'forward');step(g,6);assert.ok(a.x>x+50);});
test('buffer expires so stale whiff inputs do not fire later',()=>{const g=game();g.players[1].x=1000;input(g,0,'heavy');step(g,3);input(g,0,'special');step(g,50);assert.equal(g.players[0].move,null);assert.equal(g.projectiles.length,0);});

test('all four archetypes can confirm light → heavy → special at close range',()=>{for(const id of ['super','grabby','witch','blitz']){const g=game(id),a=g.players[0],b=g.players[1];b.x=475;input(g,0,'light');until(g,()=>a.combo===1);input(g,0,'heavy');until(g,()=>a.combo===2);assert.ok(b.stun>0);input(g,0,'special');until(g,()=>g.throw!==null||a.combo===3);if(id==='grabby'){assert.equal(g.throw.sky,true);until(g,()=>g.throw?.impact);assert.equal(a.combo,3);}else assert.equal(a.combo,3);}});
test('free grab works at zero meter outside training and builds rather than spends meter',()=>{const g=game('grabby');g.training=false;const [a,b]=g.players;a.meter=0;b.aiWait=999;input(g,0,'grab');until(g,()=>g.throw?.impact,200,[{},{guard:true}]);assert.equal(b.hp,815);assert.equal(a.meter,10);});

test('normal throw gives wake-up counterplay in either player slot, including at walls',()=>{
 for(const slot of [0,1])for(const x of [110,550,990]){
  const g=game(slot===0?'grabby':'super',slot===1?'grabby':'super'),a=g.players[slot],b=g.players[1-slot];
  a.x=x;b.x=x+(x>900?-70:70);a.facing=b.x>a.x?1:-1;
  input(g,slot,'grab');until(g,()=>!!g.throw);until(g,()=>!g.throw);
  assert.equal(b.down,32);assert.equal(a.landing,26);
  // Time the next grab to overlap the first frames of the defender's wake-up.
  until(g,()=>b.down===7);input(g,slot,'grab');
  until(g,()=>b.down===0);assert.equal(g.throw,null);assert.ok(b.throwProtection>0);
  input(g,1-slot,'light');until(g,()=>a.hp<a.maxHp);
  assert.equal(g.throw,null,'wake-up jab punishes the repeated grab');
 }
});
test('buffered wake-up jump escapes a repeated command grab',()=>{
 const g=game('grabby'),[a,b]=g.players;input(g,0,'grab');until(g,()=>!!g.throw);until(g,()=>!g.throw);
 until(g,()=>b.down===7);input(g,0,'grab');input(g,1,'jump');
 until(g,()=>b.down===0);step(g,5);
 assert.ok(b.y<FLOOR-40);assert.equal(g.throw,null);assert.equal(b.hp,815);
});
test('wake-up protection stops both throws, expires, and leaves strikes effective',()=>{
 for(const action of ['grab','special']){
  const g=game('grabby'),[a,b]=g.players;b.throwProtection=20;input(g,0,action);step(g,14);
  assert.equal(g.throw,null);assert.equal(b.hp,b.maxHp);assert.ok(a.move,'protected throw has whiff recovery');
  until(g,()=>!a.move);assert.equal(b.throwProtection,0);a.x=b.x-70;a.facing=1;
  input(g,0,action);until(g,()=>!!g.throw);assert.equal(g.throw.sky,action==='special');
 }
 const g=game(),b=g.players[1];b.throwProtection=20;input(g,0,'light');step(g,5);assert.equal(b.hp,956,'protection is not strike invulnerability');
});
