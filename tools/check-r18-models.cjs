'use strict';
const assert=require('node:assert/strict');
const Intel=require('../ai-economy-intel'),Planner=require('../ai-combat-planner');
let failed=0;
function check(name,fn){try{fn();console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.stack);}}
const castle={id:1,owner:'Red',type:'Castle',level:1,ruined:false},mine={id:2,parent:1,type:'mine'};
const view=(time,buildings=[castle],slots=[],units=[])=>({time,buildings,slots,units});
const team=(n,hp=100,dps=10)=>Array.from({length:n},()=>({hp,dps}));
function finiteOutcome(result){for(const k of ['loss','seconds','enemyRemaining'])assert(Number.isFinite(result[k]),k+' is not finite');assert(result.loss>=0&&result.loss<=1);assert(result.enemyRemaining>=0&&result.enemyRemaining<=1);assert(result.seconds>=0);}
check('Public projections do not inspect wallets, bonuses, queues or actual paid costs',()=>{
 const hidden=()=>{throw Error('private field read');},home={...castle},site={...mine},unit={id:3,owner:'Red',hp:100,garrisonId:1,record:{cost:100}};
 for(const [row,keys]of [[home,['queue','bonus','gold']],[site,['paidCost']],[unit,['bonus','paidCost','mana']]])for(const key of keys)Object.defineProperty(row,key,{get:hidden});
 const input=view(0,[home],[site],[unit]);Object.defineProperty(input,'factions',{get:hidden});
 const l=Intel.createLedger();Intel.observe(l,input);Intel.observe(l,{...input,time:1});assert.equal(Intel.estimate(l,'Red').spentMax,0);
});
check('Paused observations settle visible purchases but accrue no simulation income',()=>{
 const l=Intel.createLedger();Intel.observe(l,view(0));Intel.observe(l,view(5));
 Intel.observe(l,view(5,[castle],[mine]));Intel.observe(l,view(5,[castle],[mine]));
 assert.equal(Intel.estimate(l,'Red').earned,5);assert.equal(Intel.estimate(l,'Red').spentMax,90*1.35);
 Intel.observe(l,view(6,[castle],[mine]));assert.equal(Intel.estimate(l,'Red').earned,7.8);
});
check('Older snapshots cannot rewind levels and count the same upgrade twice',()=>{
 const l=Intel.createLedger();Intel.observe(l,view(0));Intel.observe(l,view(10,[{...castle,level:2}]));
 const before=Intel.estimate(l,'Red');Intel.observe(l,view(9));Intel.observe(l,view(10,[{...castle,level:2}]));
 assert.equal(Intel.estimate(l,'Red').spentMax,before.spentMax);assert.equal(Intel.estimate(l,'Red').earned,before.earned);assert.equal(l.time,10);
});
check('Invalid clock snapshots do not poison later income',()=>{
 const l=Intel.createLedger();Intel.observe(l,view(NaN));assert.equal(l.time,null);
 Intel.observe(l,view(0));Intel.observe(l,view(Infinity));Intel.observe(l,view(2));assert.equal(Intel.estimate(l,'Red').earned,2);
});
check('Captures and surviving-unit conversions are not charged as purchases',()=>{
 const l=Intel.createLedger(),u={id:3,owner:'Red',hp:100,garrisonId:1,record:{cost:100}};
 Intel.observe(l,view(0,[castle],[mine],[u]));Intel.observe(l,view(1,[{...castle,owner:'Blue'}],[mine],[{...u,owner:'Blue'}]));
 assert.equal(Intel.estimate(l,'Blue').spentMax,0);assert.equal(Intel.estimate(l,'Blue').incomeGold,2.8);
});
check('Inactive unclaimed sites have no production value; occupied ruins retain active sites',()=>{
 const l=Intel.createLedger(),farm={id:3,parent:1,type:'farm'},ruin={...castle,ruined:true,captureOwner:null};
 Intel.observe(l,view(0,[ruin],[mine,farm]));assert.equal(Intel.resourceValue(l,ruin),0);assert.equal(Intel.estimate(l,'Red').incomeGold,0);
 const claimed={...ruin,captureOwner:'Red'};Intel.observe(l,view(1,[claimed],[mine,farm]));
 assert.equal(Intel.resourceValue(l,claimed),66);assert.equal(Intel.estimate(l,'Red').incomeGold,1.8);
});
check('Free public unit records do not fall back to a nonzero estimated stats cost',()=>{
 const l=Intel.createLedger();Intel.observe(l,view(0));Intel.observe(l,view(1,[castle],[],[{id:3,owner:'Red',hp:100,record:{cost:0},stats:{cost:100}}]));
 assert.equal(Intel.estimate(l,'Red').spentMax,0);assert.equal(Intel.estimate(l,'Red').replacementGold,0);
});
check('Empty sides have consistent outcomes without mutating inputs',()=>{
 assert.deepEqual(Planner.forecast([],[]),{win:false,loss:0,seconds:0,enemyRemaining:0});
 assert.equal(Planner.forecast(team(1),[]).win,true);assert.equal(Planner.forecast([],team(1)).win,false);
 const a=team(4),e=team(3),before=JSON.stringify([a,e]);finiteOutcome(Planner.forecast(a,e));assert.equal(JSON.stringify([a,e]),before);
});
check('Simultaneous elimination is not treated as a surviving victory',()=>{
 const result=Planner.forecast(team(1),team(1));assert.equal(result.win,false);assert.equal(result.loss,1);assert.equal(result.enemyRemaining,0);
});
check('A zero-damage side predicts attrition; two harmless sides remain a stalemate',()=>{
 const helpless=Planner.forecast(team(1,100,0),team(1));assert.equal(helpless.win,false);assert.equal(helpless.loss,1);finiteOutcome(helpless);
 const stale=Planner.forecast(team(1,100,0),team(1,100,0));assert.equal(stale.win,false);assert.equal(stale.loss,0);assert.equal(stale.enemyRemaining,1);
 const safe=Planner.forecast(team(1),team(1,100,0));assert.equal(safe.win,true);assert.equal(safe.loss,0);
});
check('The bounded event tail resolves large matched armies instead of exposing partial losses',()=>{
 const matched=Planner.forecast(team(40),team(40));assert.equal(matched.win,false);assert.equal(matched.loss,1);assert.equal(matched.enemyRemaining,0);finiteOutcome(matched);
 const advantage=Planner.forecast(team(64),team(60));assert(advantage.win);assert.equal(advantage.enemyRemaining,0);finiteOutcome(advantage);
});
check('Nonfinite damage and dead or invalid HP do not leak NaN into planning',()=>{
 for(const [a,e]of [[[{hp:100,dps:NaN}],team(1)],[[{hp:NaN,dps:10},{hp:Infinity,dps:20}],team(1)],[[{hp:100,dps:Infinity}],team(1,100,0)]])finiteOutcome(Planner.forecast(a,e));
});
check('A surviving squad below one HP still represents its full remaining fraction',()=>{
 const stale=Planner.forecast(team(1,.5,0),team(1,.25,0));assert.equal(stale.enemyRemaining,1);assert.equal(stale.loss,0);
 const a=Planner.forecast(team(64,.1,.01),team(60,.1,.01)),b=Planner.forecast(team(64),team(60));
 assert(Math.abs(a.loss-b.loss)<1e-9);assert.equal(a.win,b.win);
});
const request={time:20,opening:10,tier:3,gold:250,income:2.8,freeSupply:3,cheapest:100,available:1,minimum:3,ourPower:100,needed:300,goal:{distance:200,empty:false},underPressure:false,armyFirst:false};
check('Recruiting an undersized army releases affordable reserves without changing its fees',()=>{
 const p=Planner.investment(request);assert(p.commit&&p.delayUpgrade);assert.equal(p.burst,2);assert.equal(p.reserveCeiling,50);assert.equal(p.affordable,2);
 assert(!Planner.investment({...request,time:9}).commit);assert(!Planner.investment({...request,freeSupply:0}).commit);
});
check('A country with no finite available recruit price does not lock upgrades for phantom purchases',()=>{
 for(const cheapest of [Infinity,NaN,0,-1]){const p=Planner.investment({...request,cheapest});assert.equal(p.commit,false);assert.equal(p.delayUpgrade,false);assert.equal(p.affordable,0);assert(!Number.isNaN(p.reserveCeiling));}
});
process.exitCode=failed?1:0;
