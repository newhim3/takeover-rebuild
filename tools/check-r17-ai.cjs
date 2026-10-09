'use strict';
const assert=require('node:assert/strict'),{Battle}=require('../engine'),AI=require('../enemy-ai');
const base={width:1100,height:300,grid:Array(30).fill('1'.repeat(110)),nodes:[
 {x:100,y:105,locationNum:1,markerClass:'NodeCastleRedClass'},
 {x:450,y:105,locationNum:2,markerClass:'NodeCastleGreenClass'},
 {x:750,y:105,locationNum:3,markerClass:'NodeTownGreenClass'}]};
const rng=Math.random;Math.random=()=>.25;
let failed=0;function check(name,fn){try{fn();console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.message);}}
check('A two-squad main force is not split below the required assault size',()=>{
 const b=new Battle(base,{player:'Green',difficulty:'hard'});b.time=12;b.factions.Red.gold=0;
 b.spawn(b.buildings[0],'infantry');b.spawn(b.buildings[0],'infantry');b.spawn(b.buildings[1],'infantry');
 const p=AI.plan(b,'Red');assert.equal(p.target,b.buildings[1].id);assert.equal(p.maneuver,null);assert.equal(p.phase,'attack');
});
check('Upgrade savings do not freeze paid recruitment for an undersized assault',()=>{
 const data={...base,nodes:base.nodes.slice(0,2)};
 for(const [i,x]of [80,100,120].entries())data.nodes.push({x,y:145,locationNum:1,markerClass:'NodeBuildHereClass'});
 const b=new Battle(data,{player:'Green',difficulty:'normal'});b.time=60;b.factions.Red.gold=150;
 for(const type of ['mine','mine','farm']){const s=b.slots.find(s=>!s.type);s.type=type;}
 b.spawn(b.buildings[0],'infantry');b.spawn(b.buildings[0],'infantry');
 for(let i=0;i<3;i++)b.spawn(b.buildings[1],'infantry');
 AI.plan(b,'Red');assert(b.units.filter(u=>u.owner==='Red').length>2);assert(b.factions.Red.gold<150);
});
check('Opening development never dispatches an unprovoked attack',()=>{
 const b=new Battle(base,{player:'Green',difficulty:'nightmare'});b.time=9;b.factions.Red.gold=0;
 const u=b.spawn(b.buildings[0],'infantry');AI.plan(b,'Red');assert.equal(u.garrisonId,b.buildings[0].id);assert.equal(u.order,null);
});
check('Planning never reads an opposing country gold balance',()=>{
 const b=new Battle(base,{player:'Green',difficulty:'nightmare'});b.time=12;
 Object.defineProperty(b.factions.Green,'gold',{get(){throw new Error('hidden purse accessed');}});
 b.spawn(b.buildings[0],'infantry');AI.plan(b,'Red');
});
check('Two-front relief keeps the salvageable base and does not interrupt its defender windup',()=>{
 const data={...base,nodes:[{x:100,y:105,locationNum:1,markerClass:'NodeCastleRedClass'},{x:300,y:105,locationNum:2,markerClass:'NodeTownRedClass'},{x:850,y:105,locationNum:3,markerClass:'NodeCastleGreenClass'}]};
 const b=new Battle(data,{player:'Green',difficulty:'expert'}),[doomed,safe,enemyHome]=b.buildings;b.time=15;b.factions.Red.gold=0;doomed.hp=10;
 const troops=[b.spawn(safe,'infantry'),b.spawn(safe,'infantry')];
 for(let i=0;i<2;i++){const e=b.spawn(enemyHome,'infantry');b.deploy(e);e.x=110;e.y=105;b.issue(e,doomed,doomed.id);}
 const siege=b.spawn(enemyHome,'siege');b.deploy(siege);siege.x=315;siege.y=105;b.issue(siege,safe,safe.id);
 AI.plan(b,'Red');assert(troops.some(u=>u.defendHome===safe.id));assert(!troops.some(u=>u.order?.target===doomed.id));
 const defender=troops.find(u=>u.defendHome===safe.id),windup={target:siege.id,left:.2};defender.pendingAttack=windup;defender.state='attack';
 b.time=16;AI.plan(b,'Red');assert.equal(defender.defendHome,safe.id);assert.equal(defender.pendingAttack,windup);
});
check('The same moving enemy target does not restart an existing attack windup',()=>{
 const data={...base,nodes:[base.nodes[0],{...base.nodes[1],x:850},{x:450,y:105,markerClass:'NodeChestClass'},{x:450,y:105,markerClass:'NodeDefenderOgreClass'}]};
 const b=new Battle(data,{player:'Green',difficulty:'normal'});b.time=12;b.factions.Red.gold=0;
 const troops=[b.spawn(b.buildings[0],'infantry'),b.spawn(b.buildings[0],'infantry')],ogre=b.units.find(u=>u.neutral);
 assert.equal(AI.plan(b,'Red').phase,'guard');const u=troops[0];u.x=440;u.y=105;b.time=12.9;b.beginAttack(u,ogre,false);assert(u.pendingAttack);
 const windup=u.pendingAttack;ogre.x+=8;b.time=13;AI.plan(b,'Red');assert.equal(u.pendingAttack,windup);
});
check('An already concentrated forward force keeps advancing instead of rallying back at home',()=>{
 const data={...base,nodes:[base.nodes[0],{...base.nodes[1],x:850}]},b=new Battle(data,{player:'Green',difficulty:'hard'});b.time=15;b.factions.Red.gold=0;
 for(const x of [500,520]){const u=b.spawn(b.buildings[0],'infantry');b.deploy(u);u.x=x;u.y=105;}
 b.spawn(b.buildings[1],'infantry');const p=AI.plan(b,'Red');assert.equal(p.phase,'attack');
 for(const u of b.units.filter(u=>u.owner==='Red'))assert.equal(u.order?.target,b.buildings[1].id);
});
check('Concentrating a force reduces expected attrition against the same defender',()=>{
 const Planner=require('../ai-combat-planner'),squad=()=>({hp:100,dps:10});
 const concentrated=Planner.forecast(Array.from({length:4},squad),Array.from({length:3},squad));
 const divided=Planner.forecast(Array.from({length:2},squad),Array.from({length:3},squad));
 assert(concentrated.win);assert(!divided.win);assert(concentrated.loss<divided.loss);
});
check('Capturing built sites or converting surviving units is not counted as spending',()=>{
 const Intel=require('../ai-economy-intel'),l=Intel.createLedger(),home={id:1,owner:'Green',type:'Castle',level:1},site={id:2,parent:1,type:'mine'},unit={id:3,owner:'Green',hp:100,garrisonId:1,record:{cost:100}};
 Intel.observe(l,{time:0,buildings:[home],slots:[site],units:[unit]});
 Intel.observe(l,{time:10,buildings:[{...home,owner:'Red'}],slots:[site],units:[{...unit,owner:'Red'}]});
 assert.equal(Intel.estimate(l,'Red').spentMax,0);assert.equal(Intel.estimate(l,'Red').incomeGold,2.8);
 Intel.observe(l,{time:11,buildings:[{...home,owner:'Red',level:2}],slots:[site],units:[{...unit,owner:'Red'},{...unit,id:4,owner:'Red'}]});
 assert(Intel.estimate(l,'Red').spentMin>0);assert(Intel.estimate(l,'Red').replacementGold>=200);
});
Math.random=rng;process.exitCode=failed?1:0;
