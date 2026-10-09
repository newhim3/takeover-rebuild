const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),{Battle}=require('./engine'),P=require('./progression');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('game-data.js','utf8'),ctx);const data=ctx.window.GAME_DATA;
for(const player of ['Green','Red','Blue','Purple'])for(let mission=0;mission<8;mission++){
 const b=new Battle(data.levels.find(l=>l.level===data.campaigns[player][mission]),{player,mission}),home=b.owned()[0];assert(home,player+mission);b.units=[];b.factions[player].gold=9999;
 for(const type of ['Castle','Town','MageTower']){home.type=type;b.units=[];const cap=b.cap();assert.equal(cap,b.owned().reduce((n,v)=>n+(v.type==='Castle'?2:1),0));
 for(let i=0;i<cap;i++)assert.equal(b.recruit(home.id,'infantry'),null);const before=b.factions[player].gold;assert.equal(b.recruit(home.id,'infantry'),'补给上限不足');assert.equal(b.factions[player].gold,before);assert(b.units.every(u=>u.garrisonId===home.id));b.units.pop();assert.equal(b.recruit(home.id,'infantry'),null);
 }
}
console.log('PASS: all 32 starts, all building capacities, recruitment inside, cap rejection without charge and recovery after losses');
const lane={grid:Array(60).fill('1'.repeat(80)),nodes:[{markerClass:'NodeCastleGreenClass',x:100,y:300,locationNum:0},{markerClass:'NodeTownPurpleClass',x:200,y:300,locationNum:1}]};
const repairLane=structuredClone(lane);repairLane.nodes.push({markerClass:'NodeCastleRedClass',x:700,y:300,locationNum:2});const b=new Battle(repairLane);b.ai=()=>{};const [home,target]=b.buildings,u=b.spawn(home,'infantry');b.issue(u,target,target.id);u.x=target.x;u.y=target.y;b.destroy(target);assert(u.order.enter);b.update(.04);assert.equal(u.garrisonId,target.id);const start=target.hp;b.update(1);assert(Math.abs(target.hp-start-12)<.01);assert(target.ruined,'Repair must not instantly restore the building');
const c=new Battle(lane);c.ai=()=>{};const enemy=c.spawn(c.buildings[1],'infantry');c.deploy(enemy);enemy.x=130;enemy.y=300;enemy.frozen=100;const hp=enemy.hp;c.update(2);assert.equal(enemy.hp,hp,'Empty strongholds cannot fire arrows');
console.log('PASS: automatic entry, repair 6 HP per half second per squad, no invented castle weapons');
const blue=new Battle(lane,{player:'Blue',edicts:Object.fromEntries(P.tree('Blue').map(e=>[e.n,3]))});blue.ai=()=>{};blue.factions.Blue.mana=500;const ally=blue.spawn(blue.owned()[0],'infantry');blue.deploy(ally);ally.hp-=30;blue.cast('heal',ally);assert.equal(ally.enchanted,10);assert.equal(ally.enchantReduction,.25);assert.equal(ally.heroic,undefined);ally.frozen=3;blue.cast('summon',ally);blue.update(.04);assert.equal(ally.frozen,0);assert(ally.protected>0);
console.log('PASS: frost enchantment and liberation protection are distinct effects');
