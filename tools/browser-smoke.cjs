// Optional integration check. Install playwright-core outside the project and set
// PLAYWRIGHT_MODULE to its module path; uses a separately running npm start.
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
 const page=await browser.newPage({hasTouch:true,viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:3000');
 assert.equal(await page.locator('.fighter-card').count(),4);
 await page.click('#sound');assert.equal(await page.getAttribute('#sound','aria-pressed'),'true');
 await page.click('#training');await page.click('.fighter-card:nth-child(2)');await page.click('#fight');
 await page.waitForFunction(()=>badCompany.phase==='fight');
 await page.evaluate(()=>{const [a,b]=badCompany.players;a.x=430;b.x=510;});
 await page.keyboard.press('i');await page.waitForFunction(()=>badCompany.throw?.t===16||badCompany.throw?.t>16);
 assert.ok(await page.evaluate(()=>badCompany.players[1].y<350));
 await page.waitForFunction(()=>!badCompany.throw);assert.equal(await page.evaluate(()=>badCompany.players[1].hp),995);
 await page.waitForFunction(()=>badCompany.players[1].down===0);
 await page.evaluate(()=>{const [a,b]=badCompany.players;a.x=430;b.x=510;});
 await page.keyboard.press('l');await page.waitForFunction(()=>badCompany.throw?.sky&&badCompany.throw.t>=39);
 assert.ok(await page.evaluate(()=>badCompany.players.every(p=>p.y<-60)));
 await page.waitForFunction(()=>!badCompany.throw);assert.equal(await page.evaluate(()=>badCompany.players[1].hp),735);
 await page.click('#choose');await page.click('.fighter-card:nth-child(4)');await page.click('#fight');await page.waitForFunction(()=>badCompany.phase==='fight');
 await page.keyboard.press('l');await page.waitForFunction(()=>badCompany.players[0].invuln);
 assert.equal(await page.evaluate(()=>badCompany.players[0].move.key),'dash');
 await page.waitForFunction(()=>!badCompany.players[0].invuln);await page.waitForFunction(()=>!badCompany.players[0].move);
 await page.keyboard.press('w');await page.waitForTimeout(100);await page.keyboard.press('k');
 await page.waitForFunction(()=>badCompany.players[0].move?.key==='airHeavy'&&badCompany.players[0].move.t>=9);
 assert.ok(await page.evaluate(()=>badCompany.players[0].vy>=9));
 await page.keyboard.press('Escape');assert.equal(await page.locator('#overlay-title').textContent(),'PAUSED');
 await page.click('#resume');await page.click('#choose');await page.click('#arcade');await page.click('#fight');
 await page.waitForFunction(()=>badCompany.phase==='fight');await page.waitForTimeout(2200);
 assert.ok(await page.evaluate(()=>badCompany.players[1].x!==790));
 // Force low-health round endpoints through the live browser simulation.
 await page.evaluate(()=>{badCompany.players[1].hp=0;badCompany.freeze=0;});await page.waitForFunction(()=>badCompany.phase==='roundEnd');
 assert.equal(await page.evaluate(()=>badCompany.players[0].wins),1);
 await page.evaluate(()=>badCompany.phaseTime=1);await page.waitForFunction(()=>badCompany.phase==='intro'&&badCompany.round===2);
 await page.evaluate(()=>badCompany.phaseTime=1);await page.waitForFunction(()=>badCompany.phase==='fight');
 await page.evaluate(()=>badCompany.players[1].hp=0);await page.waitForFunction(()=>badCompany.phase==='roundEnd');
 await page.evaluate(()=>badCompany.phaseTime=1);await page.waitForFunction(()=>badCompany.phase==='matchEnd');
 assert.equal(await page.locator('#overlay').isVisible(),true);assert.equal(await page.locator('#resume').isVisible(),false);
 await page.click('#overlay-rematch');assert.equal(await page.evaluate(()=>badCompany.players[0].wins),0);
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.waitForFunction(()=>badCompany.phase==='fight');await page.locator('#touch [data-action="jump"]').tap();
 await page.waitForFunction(()=>badCompany.players[0].y<450);
 assert.deepEqual(errors,[]);console.log('Browser PASS: roster, sound, throw + sky slam, invulnerable dash, aerial dive, pause, CPU, two rounds, rematch, touch jump, mobile width; no console errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
