import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fighter,strike,advance,FLOOR} from '../src/engine.js';
test('attacks respect distance, facing, damage and cooldown',()=>{const a=fighter(100,'','a'),b=fighter(180,'','b');assert.equal(strike(a,b,'punch'),true);assert.equal(b.hp,91);assert.equal(strike(a,b,'punch'),false);a.cooldown=0;a.facing=-1;assert.equal(strike(a,b,'kick'),false);a.cooldown=0;a.facing=1;b.x=230;assert.equal(strike(a,b,'kick'),true);assert.equal(b.hp,77);});
test('jump lands and movement stays inside arena',()=>{const a=fighter(100,'','a');advance(a,.016,0,true);assert.ok(a.y<FLOOR);for(let i=0;i<180;i++)advance(a,1/60,-1,false);assert.equal(a.y,FLOOR);assert.equal(a.x,45);});
