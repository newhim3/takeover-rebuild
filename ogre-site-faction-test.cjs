/* Focused regression: native site positions, Ogre tuning, and country identity. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('./progression'),A=require('./unit-art'),R=require('./unit-rules');
const {Battle,TYPES,SITE_LIMIT,OGRE_BALANCE}=require('./engine');
const {duel}=require('./tools/ogre-balance.cjs');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('game-data.js','utf8'),context);
const D=context.window.GAME_DATA;
const originalMaps=JSON.parse(fs.readFileSync('assets/takeover/data/level_nodes.json','utf8')).levels;
const originalUnits=JSON.parse(fs.readFileSync('assets/takeover/data/units.json','utf8')).units;
const near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<.0001;
let buildingCount=0,siteCount=0,campCount=0,recruitChecks=0,spawnChecks=0;

assert.equal(D.levels.length,25);
assert.equal(originalMaps.length,25);
for(const map of D.levels){
 const raw=originalMaps.find(d=>d.level===map.level);
 assert(raw,'Missing source map '+map.level);
 const b=new Battle(map,{player:map.nativePlayer||'Green'});
 for(const city of b.buildings){
  buildingCount++;
  const sourceCity=raw.nodes.find(n=>/Node(Castle|Town|MageTower|Camp)(Green|Red|Blue|Purple)Class/.test(n.markerClass)&&n.locationNum===city.location&&near(n,city));
  assert(sourceCity,'Building lost its source position: level '+map.level);
  const sites=b.slots.filter(s=>s.parent===city.id);
  assert(sites.length<=SITE_LIMIT[city.type],`Level ${map.level}, ${city.type}: too many signs`);
  const positions=new Set();
  for(const site of sites){
   assert(raw.nodes.some(n=>n.markerClass==='NodeBuildHereClass'&&n.locationNum===city.location&&near(n,site)),`Level ${map.level}: invented or reparented sign`);
   const key=site.x+','+site.y;
   assert(!positions.has(key),'Duplicate sign at '+key);
   positions.add(key);siteCount++;
  }
  if(sourceCity.markerClass.startsWith('NodeCamp')){
   campCount++;
   assert.equal(city.visualType,'Warcamp');
   assert.equal(city.type,'Town');
   assert.deepEqual(b.allowedUnits(city),['infantry','archers']);
   assert.equal(city.maxHp,500);
  }else assert.equal(city.visualType,city.type,'Only source Camp markers may use Warcamp art');
 }
 assert(b.slots.every(s=>b.building(s.parent)),'Orphan building site');
}
assert(campCount>0,'The Camp regression was not exercised');

// Keep the extracted original record intact; tune only the neutral runtime enemy.
const ogreSource=originalUnits.find(r=>r.name==='Ogre'),ogreRecord=P.UNITS.find(r=>r.name==='Ogre');
assert.deepEqual(ogreRecord,ogreSource);
assert.equal(ogreRecord.hp,400);assert.equal(ogreRecord.damageMin,8);assert.equal(ogreRecord.damageMax,12);
assert.deepEqual(OGRE_BALANCE,{hp:520,damageMin:11,damageMax:14});
const lane={grid:Array(60).fill('1'.repeat(80)),roads:{points:[{x:100,y:300},{x:700,y:300}],edges:[[0,1]]},nodes:[{markerClass:'NodeCastleGreenClass',x:100,y:300,locationNum:0},{markerClass:'NodeCastleRedClass',x:700,y:300,locationNum:1}]};
const fight=new Battle(lane);fight.ai=()=>{};fight.addXP=()=>{};
const ogre=fight.spawnOgre({x:400,y:300}),defender=fight.spawn(fight.owned()[0],'infantry');
assert.equal(ogre.record,ogreRecord);assert.equal(ogre.maxHp,520);assert.equal(ogre.stats.hpPerMember,520);
assert.equal(ogre.stats.damageMin,11);assert.equal(ogre.stats.damageMax,14);
assert.equal(ogre.stats.attackInterval,ogreRecord.attackSpeed/10);
assert.equal(ogre.stats.speed,ogreRecord.speed);assert.equal(ogre.stats.abilities.SplashDamage,25);
fight.deploy(defender);defender.x=373;defender.y=300;fight.issue(defender,ogre,ogre.id);
const random=Math.random;Math.random=()=>.5;
try{fight.update(.01);assert.equal(defender.hp,defender.maxHp,'Damage waits for native impact frame');for(let i=0;i<100&&defender.hp===defender.maxHp;i++)fight.update(.01);}finally{Math.random=random;}
assert(defender.hp<defender.maxHp,'Ogre did not attack');
assert(defender.x<373&&defender.knockPath?.length,'Ogre attack lost its road knockback');
assert.equal(defender.y,300,'Knockback left the road');
assert.equal(defender.order.target,ogre.id,'Knockback discarded the attack order');
assert(Math.abs(ogre.attackCd-(3-fight.time+.01))<.001,'Ogre original attack cadence changed');
const seeds=[1,2,3,4,5,6];
const tuning={hp:OGRE_BALANCE.hp,min:OGRE_BALANCE.damageMin,max:OGRE_BALANCE.damageMax};
const legion=seeds.map(seed=>duel('Legionaries',{...tuning,seed}));
const swordPairs=seeds.map(seed=>duel('Swordsmen',{...tuning,seed,teams:2}));
const legionWins=legion.filter(r=>r.winner==='troop');
assert(legionWins.length>seeds.length/2,'A single ordinary Legionaries squad should usually win');
const survivor=legionWins.reduce((v,r)=>v+r.fraction,0)/legionWins.length;
assert(survivor>.05&&survivor<.4,'A single Legionaries squad should win with substantial losses');
assert(swordPairs.every(r=>r.winner==='troop'),'Two ordinary Swordsmen squads should beat the Ogre');
assert.deepEqual(ogreRecord,ogreSource,'Balance trials mutated the extracted original record');

// Exercise every stage and actual paid recruitment, especially Red/Purple 11..18.
assert.deepEqual(Array.from(D.campaigns.Red),[11,12,13,14,15,16,17,18]);
assert.deepEqual(Array.from(D.campaigns.Purple),[11,12,13,14,15,16,17,18]);
for(const player of Object.keys(P.FACTIONS)){
 assert.equal(D.campaigns[player].length,8);
 for(const [mission,level] of Array.from(D.campaigns[player]).entries()){
  const map=D.levels.find(d=>d.level===level);
  assert.equal(map.nativePlayer,level<10?'Green':level<20?'Red':'Blue','Wrong native map country');
  const b=new Battle(map,{player,mission,difficulty:'normal'});
  assert(b.owned().length,player+' has no home in stage '+level);
  for(const u of b.units.filter(u=>!u.neutral))assert.equal(u.record.faction,P.FACTIONS[u.owner],'Initial troop has the wrong country');
  function checkUnit(u,type,city){
   const expected=P.unit(city.owner,TYPES[type].sprite,1);
   assert.equal(u.owner,city.owner);
   assert.equal(u.record,expected,`${player}/${level}: mismatched ${type}`);
   assert.equal(u.record.faction,P.FACTIONS[city.owner]);
   assert.equal(A.prefix(u.record),city.owner+u.record.unitType);
   assert.equal(A.icon(u.record),`IconT1_${A.letters[city.owner]}_${u.record.unitType}Class`);
   assert(D.sprites[A.icon(u.record)],'Missing original icon '+A.icon(u.record));
   assert(D.sprites[A.prefix(u.record)+'Down_Go'],'Missing original walking art');
  }
  for(const city of b.buildings){
   // Direct spawn is also used by spells/AI and must never inherit map color.
   for(const type of Object.keys(TYPES)){
    b.units=[];
    checkUnit(b.spawn(city,type),type,city);spawnChecks++;
   }
   for(const type of b.allowedUnits(city)){
    b.units=[];b.factions[city.owner].gold=5000;
    const price=b.recruitCost(type,city.owner);
    const error=city.owner===player?b.recruit(city.id,type):b.queue(city,type);
    assert.equal(error,null,`${player}/${level}: recruitment rejected ${type}`);
    assert.equal(b.units.length,1,'Recruitment must produce one squad immediately');
    assert.equal(b.factions[city.owner].gold,5000-price,'Incorrect recruitment payment');
    checkUnit(b.units[0],type,city);recruitChecks++;
   }
  }
 }
}
console.log(`PASS: 25 native maps, ${buildingCount} buildings, ${siteCount} capped source signs, ${campCount} native Camps; Ogre source/runtime split and knockback; ${legionWins.length}/6 single-Legionaries wins with ${(survivor*100).toFixed(1)}% HP remaining, 6/6 two-Swordsmen wins; 32 campaign stages, ${spawnChecks} country-correct spawns and ${recruitChecks} paid recruits.`);
