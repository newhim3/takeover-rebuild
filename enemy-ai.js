/* CPU planning: every action uses the same paid interfaces as the player. */
(function(root){
'use strict';
const Intel=typeof module!=='undefined'?require('./ai-economy-intel.js'):root.AiEconomyIntel;
const Planner=typeof module!=='undefined'?require('./ai-combat-planner.js'):root.AiCombatPlanner;
const memory=new WeakMap(), physical=(a,b)=>Math.hypot(a.x-b.x,(a.y-b.y)*2);
const alive=u=>u.hp>0, field=u=>alive(u)&&!u.garrisonId;
const secured=(n,owner)=>n.owner===owner&&(!n.ruined||n.captureOwner===owner);
const types=['infantry','archers','cavalry','siege','magic'];
function stateFor(b,owner){
 let states=memory.get(b);if(!states){states={};memory.set(b,states);}
 return states[owner]||(states[owner]={decision:-Infinity,recruit:0,upgrade:0,spell:0,task:null,maneuver:null,maneuverAt:0,withdrawals:new Map(),recovering:new Set(),lastSpells:new Map(),orders:new Map(),targetBias:new Map(),lootSeen:new Set(),lootUpgrade:false,upgradeBudget:false,intel:Intel.createLedger(),personality:types.map(()=>.8+Math.random()*.4)});
}
function configuration(b){return {opening:10,decision:1,recruitEvery:2,recruitBurst:1,attackRatio:1.18,reinforcementRadius:220,minWave:2,upgradeAt:45,rankCap:3,huntOgres:true,treasureBias:55,chestRatio:1.35,openingArmy:1,upgradeChance:.4,lootUpgradeChance:.4,counterWeight:.7,typeWeights:[5,4,2,1,2],...b.settings};}
function route(b,from,to,cache){
 const key=`${from.id??`${from.x},${from.y}`}:${to.id??`${to.x},${to.y}`}`;
 if(cache?.has(key))return cache.get(key);
 const path=b.path(from,to),distance=path.length?b.routeLength(from,path):physical(from,to)<30?0:Infinity;
 cache?.set(key,distance);return distance;
}
function traits(u){return u.stats?.abilities||{};}
function remaining(u){return Math.max(0,Math.ceil((u.stats?.members||1)*u.hp/Math.max(1,u.maxHp)));}
/* Value surviving members, counters and effective HP together. */
function armyStrength(units,opponents=[],building=false){
 const foes=opponents.filter(alive),foeMembers=foes.reduce((n,u)=>n+remaining(u),0)||1;
 const ranged=foes.reduce((n,u)=>n+(u.stats?.range>0?remaining(u):0),0)/foeMembers;
 const cavalry=foes.reduce((n,u)=>n+(u.type==='cavalry'?remaining(u):0),0)/foeMembers;
 const shields=foes.reduce((n,u)=>n+(traits(u).ShieldWall||0)*remaining(u),0)/foeMembers;
 let hp=0,dps=0;
 for(const u of units.filter(alive)){
  const s=u.stats||{},a=traits(u),count=remaining(u);
  const average=Number.isFinite(s.damage)?s.damage/Math.max(1,s.members||count):1;
  let damage=count*((s.damageMin??average)+(s.damageMax??average))/2;
  damage*=u.damageScale??1;damage*=u.heroic>0?1.5:u.weakened>0?.5:1;
  if(u.bloodlust>0)damage+=count*4;
  if(a.Undead)damage*=1+(u.bonus?.[51]||0)/100;
  if(building)damage*=1+(a.SiegeWeapon||0)*.1+(u.bonus?.[18]||0)/100;
  else if(s.range>0){damage*=1-shields/100;damage*=1-(s.meleePenalty||0)/100*.25;}
  if(a.LongSpear)damage*=1+a.LongSpear/100*cavalry;
  if(a.Charge&&u.chargeReady)damage*=1+Math.min(1,(Number(a.Charge)-1)*.25);
  if(a.SplashDamage)damage*=1.2;
  if(a.FreezeArrow||a.FreezeBlast||a.Poisonous)damage*=1.12;
  if(u.frozen>0)damage*=.35;
  let health=u.hp/Math.max(.35,1-(a.ShieldWall||0)/100*ranged);
  if(u.enchanted>0)health/=Math.max(.4,1-(u.enchantReduction||0));
  if(u.poison>0)health=Math.max(1,health-(u.poisonDamage||0)*Math.min(4,u.poison));
  hp+=health;dps+=damage/Math.max(.4,s.attackInterval||2)*(s.range>50?1.08:1);
 }
 return {hp,dps,power:Math.sqrt(Math.max(0,hp*dps)),count:units.filter(alive).length};
}
function hostileField(b,owner){return b.units.filter(u=>u.owner!==owner&&field(u)&&!u.neutral);}
function battleForecast(allies,enemies){
 const project=(team,foes)=>team.filter(alive).map(u=>{const s=armyStrength([u],foes);return {hp:s.hp,dps:s.dps,cost:u.record?.cost||0};});
 return Planner.forecast(project(allies,enemies),project(enemies,allies));
}
function investmentFor(b,owner,troops,available,bases,goal,cfg,urgent){
 const cheapest=bases.length?Math.min(...bases.flatMap(n=>b.allowedUnits(n).map(t=>b.recruitCost(t,owner)))):100;
 const capacity=Math.max(1,b.cap(owner)-(troops.length-available.length)),minimum=Math.min(capacity,goal?.empty?1:cfg.minWave);
 const ourPower=armyStrength(available,goal?.guards||[]).power,needed=(goal?.power||0)*(goal?.kind==='chest'?cfg.chestRatio:cfg.attackRatio);
 return Planner.investment({time:b.time,opening:cfg.opening,tier:cfg.tacticalLevel||0,gold:b.factions[owner].gold,income:b.rates(owner).gold,freeSupply:Math.max(0,b.cap(owner)-b.pop(owner)),cheapest,available:available.length,minimum,ourPower,needed,goal,underPressure:urgent.length>0,armyFirst:cfg.armyFirst});
}
function guardsAt(b,n,owner,cfg,cache){
 return b.units.filter(u=>alive(u)&&u.owner!==owner&&!u.neutral&&(u.garrisonId===n.id||
  (!u.garrisonId&&physical(u,n)<=cfg.reinforcementRadius&&route(b,u,n,cache)<cfg.reinforcementRadius*1.6)||
  (u.owner===n.owner&&u.garrisonId&&physical(u,n)<cfg.reinforcementRadius*.7)));
}
function guardForChest(b,chest){return b.units.filter(u=>u.neutral&&alive(u)&&physical(u.home||u,chest)<170);}
function targetAssessment(b,owner,n,troops,cfg,cache){
 const guards=guardsAt(b,n,owner,cfg,cache),defense=armyStrength(guards,troops).power;
 // Castle HP and siege bonuses affect duration, not the ability to beat defenders.
 const siegeTime=n.ruined&&!n.captureOwner?0:(n.hp||0)/Math.max(1,armyStrength(troops,guards,true).dps);
 const distance=Math.min(...troops.map(u=>route(b,u,n,cache))),tier=cfg.tacticalLevel||0;
 const sites=(b.slots||[]).filter(s=>s.parent===n.id&&s.type);
 const value=sites.reduce((sum,s)=>sum+({mine:90,farm:65,obelisk:70}[s.type]||0),0)+(n.type==='MageTower'&&!b.owned(owner).some(h=>h.type==='MageTower')?100:0);
 let reinforcements=[],forecast=0;
 if(tier>=2&&!n.ruined&&n.owner!=='Gray'){
  const arrival=Math.min(...troops.map(u=>route(b,u,n,cache)/Math.max(1,(u.stats?.speed||24)*.88))),horizon=Math.min(18,arrival+Math.min(8,siegeTime));
  // Predict nearby relief reaching the target before the wall falls. Bound
  // both the horizon and candidates; this runs only on AI decision ticks.
  reinforcements=b.units.filter(u=>alive(u)&&u.owner===n.owner&&!u.neutral&&!guards.includes(u)).sort((a,c)=>physical(a,n)-physical(c,n)).slice(0,6).filter(u=>route(b,u,n,cache)/Math.max(1,u.stats.speed*.88)+(u.garrisonId?2:0)<=horizon);
  forecast=armyStrength(reinforcements,troops).power*(tier===2?.5:tier===3?.75:1);
 }
 return {kind:'castle',target:n,guards,power:defense+forecast,siegeTime,distance,empty:guards.length===0&&!reinforcements.length,value};
}
function options(b,owner,troops,bases,cfg,cache){
 const anchors=troops.length?troops:bases;if(!anchors.length)return [];
 const out=b.buildings.filter(n=>!secured(n,owner)).map(n=>targetAssessment(b,owner,n,anchors,cfg,cache));
 for(const chest of (b.chests||[]).filter(c=>!c.collected)){
  const guards=guardForChest(b,chest),nearEnemy=hostileField(b,owner).filter(u=>physical(u,chest)<cfg.reinforcementRadius*.65);
  if(guards.length&&!cfg.huntOgres)continue;
  out.push({kind:'chest',target:chest,guards:[...guards,...nearEnemy],power:armyStrength([...guards,...nearEnemy],troops).power,distance:Math.min(...anchors.map(u=>route(b,u,chest,cache))),empty:!guards.length&&!nearEnemy.length});
 }
 return out.filter(o=>Number.isFinite(o.distance));
}
function objectiveScore(o,ourPower,cfg){
 const ratio=o.power/Math.max(1,ourPower);
 return o.distance+Math.min(70,(o.siegeTime||0)*2)+(o.kind==='chest'?-cfg.treasureBias:0)+(o.target.ruined&&!o.target.captureOwner?-160:0)+Math.max(0,ratio-.65)*240+(o.empty?-85:0)-(o.value||0)*Math.min(1,(cfg.tacticalLevel||0)*.25);
}
function chooseTask(b,owner,troops,bases,state,cfg,cache){
 // A safe-loot runner is already reserved outside this main force. Do not
 // give its chest to a second scout or replace the whole army's objective.
 const choices=options(b,owner,troops,bases,cfg,cache).filter(o=>o.kind!=='chest'||o.target.id!==state.lootRunner?.chest),power=armyStrength(troops).power;
 for(const o of choices){
  const key=o.kind+':'+o.target.id;if(!state.targetBias.has(key))state.targetBias.set(key,Math.random()*40-20);
  const tier=cfg.tacticalLevel||0;o.economy=o.kind==='castle'?Intel.estimate(state.intel,o.target.owner):null;
  o.value=(o.value||0)+(tier>=2&&o.kind==='castle'?Intel.resourceValue(state.intel,o.target):0);
  o.forecast=tier>=2&&o.guards.length?battleForecast(troops,o.guards):null;
  // Visible production and spending give a soft reinforcement risk, not
  // fabricated defenders or access to another country's gold balance.
  const replacementRisk=tier>=3&&o.economy?Math.min(35,o.economy.incomeGold*3+(o.economy.walletMin+o.economy.walletMax)*.012)*o.economy.confidence:0;
  o.score=objectiveScore(o,power,cfg)+state.targetBias.get(key)+replacementRisk+(o.forecast?.loss||0)*Math.min(110,tier*28);
 }
 const full=b.pop(owner)>=b.cap(owner);for(const o of choices)o.viable=armyStrength(troops,o.guards).power>=o.power*(o.kind==='chest'?cfg.chestRatio:full?1:cfg.attackRatio);
 choices.sort((a,c)=>Number(c.viable)-Number(a.viable)||a.score-c.score||a.target.id-c.target.id);
 const prior=state.task,old=prior&&choices.find(o=>o.kind===prior.kind&&o.target.id===prior.target);
 // Safe nearby loot can be collected by one available unit below; it never replaces the whole army mission.
 const detour=choices.find(o=>o.kind==='castle'&&o.viable&&o.empty&&old&&o.target.id!==old.target.id&&o.distance+60<old.distance);if(detour&&prior?.phase==='attack'&&b.time-prior.phaseAt>=8&&!troops.some(u=>physical(u,old.target)<160)){state.task={kind:'castle',target:detour.target.id,phase:'attack',started:b.time,phaseAt:b.time,wave:new Set(troops.map(u=>u.id)),rally:null};return detour;}
 const treasureReady=prior?.phase==='gather'&&cfg.treasureBias>=200&&old?.kind==='castle'&&choices[0]?.kind==='chest'&&choices[0].viable;
 // Keep the mission through fighting, broken wall and entry. Once claimed,
 // reserveUnits assigns one repairer; the remaining army gets its next goal.
 if(prior){
  const clearlyOutmatched=old&&old.power>power*1.7&&choices[0]?.viable;
  if(old&&b.time-prior.started<8&&!clearlyOutmatched)return old;
  if(old&&!treasureReady&&!(prior.phase==='gather'&&!old.viable&&choices[0]?.viable)&&(prior.phase!=='gather'||b.time-prior.started<12||!choices[0]||choices[0].score>old.score-120))return old;
 }
 const selected=choices[0];if(!selected){state.task=null;return null;}
 state.task={kind:selected.kind,target:selected.target.id,phase:'gather',started:b.time,phaseAt:b.time,wave:new Set(),rally:null};
 return selected;
}
function send(b,u,target,state,forceMove=false,cache,avoidCombat=false){
 if(!target||!Number.isFinite(route(b,u,target,cache)))return false;if(u.neutral)return false;
 const isBuilding='queue' in target,enter=isBuilding&&b.canEnter(target,u.owner);
 const old=state.orders.get(u.id),same=u.order&&u.order.target===(target.id??null)&&(target.id!=null||physical(u.order,target)<5)&&u.order.enter===!!enter&&!!u.order.forceMove===forceMove&&!!u.order.avoidCombat===avoidCombat;
 if(u.garrisonId===target.id&&enter)return true;
 if(same&&(!old||b.time-old.at<6||u.path?.length))return true;
 if(same&&(u.pendingAttack||u.state==='attack'||u.combatTarget&&b.unit(u.combatTarget)?.hp>0))return true;
 // Do not restart a healthy path every decision; retry only a cleared order.
 if(forceMove&&target.id!==u.defendHome)u.defendHome=null;
 b.issue(u,target,target.id??null,{forceMove,avoidCombat});state.orders.set(u.id,{at:b.time});return true;
}
function dangerAt(b,home,owner,cache){
 return hostileField(b,owner).filter(u=>b.isHomeThreat(u,home,true)&&route(b,u,home,cache)<Math.max(260,u.stats.contactRange+100));
}
function lootOpportunity(b,owner,u,chest,cfg,cache){
 if(!chest||chest.collected||guardForChest(b,chest).length||u.hp<u.maxHp*.55||u.pendingAttack||u.state==='attack'||u.defendHome)return null;
 const distance=route(b,u,chest,cache),seconds=distance/Math.max(1,u.stats.speed*.88),enemies=hostileField(b,owner);
 if(!Number.isFinite(distance)||seconds>14||enemies.some(v=>physical(v,chest)<150||physical(v,u)<120))return null;
 const need=Math.max(0,b.recruitCost('infantry',owner)*2-b.factions[owner].gold),value=(chest.gold||500)+Math.min(150,need);
 // Losing an engaged attack or a rescue costs more than making this short economic detour.
 if(u.order?.target&&u.order.target!==chest.id){const target=b.building(u.order.target);if(target&&target.owner!==owner&&physical(u,target)<160)return null;}
 return {value:value/Math.max(5,seconds+3),distance};
}
function lootKeepsWave(b,owner,u,troops,taken,state,cfg,cache){
 const task=state.task;if(!task||!['attack','guard'].includes(task.phase)||!task.wave.has(u.id))return true;
 const target=b.building(task.target)||b.chest(task.target);if(!target||'queue' in target&&secured(target,owner))return true;
 const whole=troops.filter(v=>!taken.has(v.id)&&task.wave.has(v.id)),main=whole.filter(v=>v.id!==u.id);
 const goal='queue' in target?targetAssessment(b,owner,target,main,cfg,cache):{guards:[...guardForChest(b,target),...hostileField(b,owner).filter(v=>physical(v,target)<140)]};
 const empty=goal.empty??goal.guards.length===0,minimum=Math.min(Math.max(1,b.cap(owner)-taken.size),empty?1:cfg.minWave);
 if(main.length<minimum)return false;
 const needed=Math.max(goal.power||0,armyStrength(goal.guards,main).power)*(task.kind==='chest'?cfg.chestRatio:b.pop(owner)>=b.cap(owner)?1:cfg.attackRatio);
 if(armyStrength(main,goal.guards).power<needed)return false;
 if((cfg.tacticalLevel||0)>=3&&goal.guards.length){const before=battleForecast(whole,goal.guards),after=battleForecast(main,goal.guards);return after.win&&after.loss<=before.loss+.16;}
 return true;
}
function reserveUnits(b,owner,troops,bases,state,cfg,cache){
 const taken=new Set(),urgent=[];
 const liveIds=new Set(troops.map(u=>u.id));for(const id of state.recovering)if(!liveIds.has(id))state.recovering.delete(id);
 for(const [id,until] of state.withdrawals)if(!liveIds.has(id)||b.time>=until)state.withdrawals.delete(id);
 for(const [id] of state.orders)if(!liveIds.has(id))state.orders.delete(id);
 // Keep a repairer only while the gate is uncontested.
 for(const home of b.buildings.filter(n=>secured(n,owner)&&(n.ruined||n.hp<n.maxHp*.98))){
  if(dangerAt(b,home,owner,cache).length)continue;const crew=troops.filter(u=>!taken.has(u.id)).sort((a,c)=>(a.garrisonId===home.id?-1:0)-(c.garrisonId===home.id?-1:0)||route(b,a,home,cache)-route(b,c,home,cache));
  const worker=crew[0];if(worker&&send(b,worker,home,state,true,cache))taken.add(worker.id);
 }
 // Defense may respond during the initial development-only window.
 const threats=b.buildings.filter(n=>secured(n,owner)).map(home=>({home,enemies:dangerAt(b,home,owner,cache)})).filter(t=>t.enemies.length);
 for(const t of threats){t.fallIn=(t.home.hp||0)/Math.max(1,armyStrength(t.enemies,[],true).dps);const helpers=troops.filter(u=>route(b,u,t.home,cache)/Math.max(1,u.stats.speed*.88)<t.fallIn+2);t.saveable=armyStrength(helpers,t.enemies).power>=armyStrength(t.enemies,helpers).power*.85;t.rescueScore=(t.saveable?1000:0)+(t.home.type==='Castle'?60:0)+(t.home.type==='MageTower'?35:0)-t.fallIn;}
 threats.sort((a,c)=>c.rescueScore-a.rescueScore);
 for(const threat of threats){
  if(!threat.saveable&&threats.some(t=>t.saveable)&&cfg.counterWeight>=1)continue;
  const defenders=troops.filter(u=>!taken.has(u.id)&&u.defendHome===threat.home.id);
  for(const u of defenders){taken.add(u.id);u.defendUntil=b.time+5;}
  const candidates=troops.filter(u=>!taken.has(u.id)).sort((a,c)=>route(b,a,threat.home,cache)-route(b,c,threat.home,cache));
  const need=armyStrength(threat.enemies,defenders).power*1.12;
  for(const u of candidates){
   const commitment=state.orders.get(u.id);if(u.defendHome&&u.defendHome!==threat.home.id&&b.time-(commitment?.at||0)<6&&threats.some(t=>t.home.id===u.defendHome&&t.saveable))continue;
   if(cfg.counterWeight>=1&&route(b,u,threat.home,cache)/Math.max(1,u.stats.speed*.88)>threat.fallIn+2)continue;
   if(armyStrength(defenders,threat.enemies).power>=need)break;
   const enemy=threat.enemies.slice().sort((a,c)=>route(b,u,a,cache)-route(b,u,c,cache))[0];
   if(enemy&&send(b,u,enemy,state,false,cache)){u.defendHome=threat.home.id;u.defendUntil=b.time+5;defenders.push(u);taken.add(u.id);state.recovering.delete(u.id);state.withdrawals.delete(u.id);}
  }
  if(armyStrength(defenders,threat.enemies).power<need)urgent.push(threat);
 }
 for(const u of troops){
  if(taken.has(u.id))continue;
  if(u.defendHome&&!threats.some(t=>t.home.id===u.defendHome)){
   const home=b.building(u.defendHome);
   if(home&&secured(home,owner)&&(b.time<(u.defendUntil||0)||!u.garrisonId)){
    if(send(b,u,home,state,true,cache)){taken.add(u.id);continue;}
   }
   u.defendHome=null;
  }
  if(state.withdrawals.has(u.id)){taken.add(u.id);continue;}
  const recovering=state.recovering.has(u.id);
  if(recovering&&u.hp>=u.maxHp*.98){state.recovering.delete(u.id);continue;}
  if((recovering||u.hp<u.maxHp*(cfg.counterWeight>=1?.5:.35)||!u.path?.length&&u.state!=='attack'&&u.hp<u.maxHp*.9&&bases.some(n=>physical(u,n)<120))&&bases.length){
   const safe=bases.filter(n=>!dangerAt(b,n,owner,cache).length),home=(safe.length?safe:bases).slice().sort((a,c)=>route(b,u,a,cache)-route(b,u,c,cache))[0];
   if(home&&send(b,u,home,state,true,cache,true)){state.recovering.add(u.id);taken.add(u.id);}
  }
 }
 if(b.time>=cfg.opening){
  const runner=troops.find(u=>u.id===state.lootRunner?.unit),chest=state.lootRunner&&b.chest(state.lootRunner.chest);
  if(runner&&!taken.has(runner.id)&&lootKeepsWave(b,owner,runner,troops,taken,state,cfg,cache)&&lootOpportunity(b,owner,runner,chest,cfg,cache)){send(b,runner,chest,state,true,cache);taken.add(runner.id);}else state.lootRunner=null;
  if(!state.lootRunner){let best=null;for(const u of troops.filter(u=>!taken.has(u.id))){if(!lootKeepsWave(b,owner,u,troops,taken,state,cfg,cache))continue;for(const c of b.chests||[]){const offer=lootOpportunity(b,owner,u,c,cfg,cache);if(offer&&(!best||offer.value>best.offer.value))best={u,chest:c,offer};}}if(best&&send(b,best.u,best.chest,state,true,cache)){state.lootRunner={unit:best.u.id,chest:best.chest.id};taken.add(best.u.id);}}
 }

 return {available:troops.filter(u=>!taken.has(u.id)),urgent,threats};
}
function buildingCost(b,owner,type){return Math.round(({farm:70,mine:90,obelisk:100}[type])*(1+(b.bonusFor(owner)[31]||0)/100));}
function unlockedMagic(b,owner){return typeof b.spellState==='function'&&['fire','heal','summon'].some(type=>!b.spellState(type,owner).locked);}
function development(b,owner,troops,bases,state,cfg,urgent,cache){
 const purse=b.factions[owner],territory=b.buildings.filter(n=>secured(n,owner)),slots=(b.slots||[]).filter(s=>!s.type&&territory.some(n=>n.id===s.parent));
 const income=b.rates(owner),pop=b.pop(owner),cap=b.cap(owner),army=troops.filter(u=>u.hp>u.maxHp*.35);
 const cheapest=bases.length?Math.min(...bases.flatMap(n=>b.allowedUnits(n).map(t=>b.recruitCost(t,owner)))):100;
 let reserve=0;
 for(const chest of b.chests||[]){if(chest.collected&&chest.collectedBy===owner&&!state.lootSeen.has(chest.id)){state.lootSeen.add(chest.id);state.lootUpgrade=state.lootUpgrade||Math.random()<cfg.lootUpgradeChance;}}
 const armyReady=army.length>=Math.min(cfg.minWave,cap),openingReady=pop>=Math.min(cap,cfg.openingArmy);const underPressure=urgent.length||bases.some(n=>dangerAt(b,n,owner,cache).length);const warReserve=cfg.armyFirst?cheapest*Math.max(2,Math.min(4,army.length)):cheapest,investment=state.investment;
 if(slots.length&&typeof b.buildFor==='function'){
  const sites=(b.slots||[]).filter(s=>territory.some(n=>n.id===s.parent));
  const hasFarm=sites.some(s=>s.type==='farm'),hasMine=sites.some(s=>s.type==='mine'),magic=unlockedMagic(b,owner),incomeTarget=Math.max(3.6,cheapest/30);
  let type=null;
  // recruitEvery is a decision interval, not an affordable training interval.
  // Using it as an income target filled every site with mines on nightmare
  // and left no farm capacity for a mixed army.
  if(pop>=cap&&investment?.preparing)type='farm';
  else if(!underPressure&&income.gold<incomeTarget&&openingReady&&(pop<cap||hasFarm||!hasMine&&slots.length>=2))type='mine';
  else if(pop>=cap&&(!hasFarm||urgent.length))type='farm';
  else if(!urgent.length&&openingReady&&income.gold<Math.max(2.8,bases.length*1.8)&&(troops.length>=1||slots.length>=2&&purse.gold>=buildingCost(b,owner,'mine')+cheapest*2))type='mine';
  else if(!urgent.length&&troops.length>=2&&magic&&income.mana<Math.max(1.5,bases.length*.95))type='obelisk';
  else if(pop>=cap||pop>=cap-1&&troops.length>=2)type='farm';
  if(type){
   const cost=buildingCost(b,owner,type),first=underPressure||investment?.commit&&type!=='farm'?cheapest:troops.length?0:cheapest;
   if(purse.gold>=cost+first){
    slots.sort((a,c)=>dangerAt(b,b.building(a.parent),owner,cache).length-dangerAt(b,b.building(c.parent),owner,cache).length||a.id-c.id);
    b.buildFor(owner,slots[0].id,type);
   }else if(pop>=cap||troops.length>=2&&!urgent.length&&!cfg.armyFirst&&army.length>=cfg.minWave)reserve=cost;
  }
 }
 // Accumulate an upgrade budget instead of buying bronze infantry forever.
 if(typeof b.upgradeFor==='function'&&!underPressure&&!investment?.delayUpgrade&&army.length>=2&&(b.time>=cfg.upgradeAt||state.lootUpgrade)&&b.time>=state.upgrade&&(!cfg.armyFirst||armyReady)){
  const castle=bases.filter(n=>n.type==='Castle'&&n.level<cfg.rankCap&&!dangerAt(b,n,owner,cache).length).sort((a,c)=>a.level-c.level||a.id-c.id)[0];
  if(castle){
   if(!state.upgradeBudget&&!state.lootUpgrade){state.upgradeBudget=Math.random()<cfg.upgradeChance;if(!state.upgradeBudget){state.upgrade=b.time+20;return reserve;}}
   const cost=150*castle.level;
   if(purse.gold>=cost+reserve+warReserve&&b.upgradeFor(owner,castle.id)===null){state.upgrade=b.time+30;state.upgradeBudget=false;state.lootUpgrade=false;}
   else if(!reserve&&!cfg.armyFirst&&armyReady&&income.gold>=2.8)reserve=Math.min(cost,income.gold*8);
  }else{state.upgradeBudget=false;state.lootUpgrade=false;}
 }
 return urgent.length?0:Math.min(reserve,investment?.reserveCeiling??Infinity);
}
function desiredTypes(troops,goal,cfg,state){
 const counts=Object.fromEntries(types.map(t=>[t,troops.filter(u=>u.type===t).length]));
 const foes=goal?.guards||[],ranged=foes.filter(u=>u.stats?.range>30).length,cavalry=foes.filter(u=>u.type==='cavalry').length;
 const ranked=types.map(type=>{
  let score=cfg.typeWeights[types.indexOf(type)]*state.personality[types.indexOf(type)]-counts[type]*2;
  if(type==='infantry'&&(counts.infantry<Math.ceil(troops.length*.35)||cavalry))score+=5*cfg.counterWeight;
  if(type==='cavalry'&&ranged>cavalry)score+=6*cfg.counterWeight;if(type==='cavalry'&&!counts.cavalry&&troops.length>=3)score+=2*cfg.counterWeight;
  if(type==='siege'&&goal?.kind==='castle'&&!goal.target.ruined&&(goal.siegeTime||0)>12&&troops.length>=2)score+=counts.siege?0:6*cfg.counterWeight;
  if(type==='magic'&&counts.magic===0&&troops.length>=2)score+=3*cfg.counterWeight;
  if(type==='archers'&&counts.archers<Math.floor((troops.length+1)/3))score+=3;
  // Weighted sampling changes composition without replacing a mission every tick.
  return {type,score:Math.log(Math.max(.3,score))-Math.log(-Math.log(Math.max(.00001,Math.random())))};
 });
 ranked.sort((a,c)=>c.score-a.score||types.indexOf(a.type)-types.indexOf(c.type));return ranked.map(t=>t.type);
}
function recruit(b,owner,troops,bases,goal,state,cfg,reserve,urgent,cache){
 if(!bases.length||b.time<state.recruit)return;state.recruit=b.time+cfg.recruitEvery;const purse=b.factions[owner];const usefulTarget=goal&&goal.target&&!secured(goal.target,owner);if(!urgent.length&&!usefulTarget&&troops.length>=Math.max(2,cfg.minWave))return;
 // Reserve a specialist purchase rather than consuming every coin on infantry.
 const counts=Object.fromEntries(types.map(t=>[t,troops.filter(u=>u.type===t).length])),ranged=(goal?.guards||[]).filter(u=>u.stats.range>30).length;
 let specialty=!urgent.length&&goal?.kind==='castle'&&!goal.target.ruined&&(goal.siegeTime||0)>16&&troops.length>=3&&!counts.siege?'siege':!urgent.length&&ranged>0&&troops.length>=3&&!counts.cavalry?'cavalry':null;
 if(specialty&&!bases.some(base=>b.allowedUnits(base).includes(specialty)))specialty=null;
 if(specialty&&cfg.counterWeight>=.7&&troops.length>=cfg.minWave){const wait=(b.recruitCost(specialty,owner)-purse.gold)/Math.max(.1,b.rates(owner).gold);if(wait>0&&wait<=6&&armyStrength(troops,goal?.guards||[]).power>=armyStrength(goal?.guards||[],troops).power*cfg.attackRatio)return;}

 const ordered=bases.slice().sort((a,c)=>{
  const priority=urgent[0]?.home||goal?.target;
  return (priority?route(b,a,priority,cache)-route(b,c,priority,cache):0)||c.level-a.level||a.id-c.id;
 });
 // Paid recruitment is still paced during the opening; a large late-game
 // replacement burst must not empty the whole starting purse in one decision.
 const limit=b.time<cfg.opening?1:urgent.length?Math.max(2,cfg.recruitBurst):Math.max(cfg.recruitBurst,state.investment?.burst||1);
 for(let i=0;i<limit&&b.pop(owner)<b.cap(owner);i++){
  let wanted=desiredTypes(troops,goal,cfg,state);if(specialty&&!urgent.length&&purse.gold>=b.recruitCost(specialty,owner))wanted=[specialty,...wanted.filter(t=>t!==specialty)];let recruited=false;
  for(const type of wanted){
   if(b.factions[owner].gold-reserve<b.recruitCost(type,owner))continue;
   for(const base of ordered){
    if(!b.allowedUnits(base).includes(type))continue;
    if(b.queue(base,type)===null){troops=b.units.filter(u=>u.owner===owner&&!u.neutral&&alive(u));recruited=true;break;}
   }
   if(recruited){specialty=null;break;}
  }
  if(!recruited)break;
 }
}
function rallyPoint(b,units,target,bases,cache,minimum,needed,opponents){
 const anchor=(bases.length?bases:units).slice().sort((a,c)=>route(b,a,target,cache)-route(b,c,target,cache))[0];
 const front=units.filter(field).slice().sort((a,c)=>route(b,a,target,cache)-route(b,c,target,cache))[0];
 if(front&&(!anchor||route(b,front,target,cache)+80<route(b,anchor,target,cache))){
  const group=units.filter(u=>physical(u,front)<105);
  if(group.length>=minimum&&armyStrength(group,opponents).power>=needed)return b.nearest(front);
 }
 return anchor?b.nearest({x:anchor.x,y:anchor.y+('queue' in anchor?45:0)}):null;
}
function phase(state,name,time){if(state.task.phase!==name){state.task.phase=name;state.task.phaseAt=time;}}
function maneuverOrders(b,owner,available,bases,goal,state,cfg,threats,cache){
 const used=new Set(),level=cfg.tacticalLevel||0,intactCache=new Map();let wholeForecast=null;
 function mainIntact(squad){
  if(!goal)return true;if(goal.heldForRepair)return false;const ids=new Set(squad.map(u=>u.id)),main=available.filter(u=>!ids.has(u.id));
  const key=squad.map(u=>u.id).sort((a,c)=>a-c).join(':');if(intactCache.has(key))return intactCache.get(key);
  const minimum=Math.min(Math.max(1,b.cap(owner)-(b.units.filter(u=>u.owner===owner&&alive(u)).length-available.length)),goal.empty?1:cfg.minWave);
  let intact=main.length>=minimum&&armyStrength(main,goal.guards).power>=(goal.power||0)*Math.min(1.1,cfg.attackRatio);
  if(intact&&level>=3&&goal.guards.length){wholeForecast??=battleForecast(available,goal.guards);const split=battleForecast(main,goal.guards);intact=split.win&&split.loss<=wholeForecast.loss+.16;}
  intactCache.set(key,intact);return intact;
 }
 let mission=state.maneuver;
 if(mission){
  const target=mission.kind==='raid'?b.building(mission.target):b.unit(mission.target),squads=available.filter(u=>mission.ids.has(u.id));
  const complete=!target||(mission.kind==='raid'?secured(target,owner)&&!target.ruined:!alive(target)||target.garrisonId);
  const overwhelmed=squads.length&&armyStrength(squads).power<armyStrength(hostileField(b,owner).filter(v=>squads.some(u=>physical(u,v)<130)),squads).power*.8;
  const undermanned=!mainIntact(squads);
  if(complete||b.time>mission.until||!squads.length||overwhelmed||threats.length||undermanned){
   if(!complete&&!threats.length&&(overwhelmed||b.time>mission.until||undermanned))for(const u of squads){const home=bases.filter(n=>!dangerAt(b,n,owner,cache).length).sort((a,c)=>route(b,u,a,cache)-route(b,u,c,cache))[0];if(home&&send(b,u,home,state,true,cache,true)){state.withdrawals.set(u.id,b.time+4);used.add(u.id);}}
   state.maneuver=null;state.maneuverAt=b.time+6+Math.random()*4;
  }
  else for(const u of squads){if(send(b,u,target,state,false,cache))used.add(u.id);}
 }
 if(state.maneuver||level<2||b.time<cfg.opening||b.time<state.maneuverAt||threats.length||available.length<2||goal?.heldForRepair)return used;
 // Keep the main army intact. A small paid detachment can exploit a different
 // objective while the main force gathers or holds an opponent's attention.
 const spare=Math.min(level>=3?2:1,Math.max(1,Math.floor(available.length*.35)));
 const candidates=available.filter(u=>!used.has(u.id)&&u.hp>=u.maxHp*.7&&!u.pendingAttack&&u.state!=='attack'&&!(u.combatTarget&&b.unit(u.combatTarget)?.hp>0)&&u.type!=='siege').sort((a,c)=>(c.type==='cavalry')-(a.type==='cavalry')||c.stats.speed-a.stats.speed||a.id-c.id);
 if(!candidates.length)return used;
 const offers=[];
 for(const n of b.buildings.filter(n=>!secured(n,owner)&&n.owner!=='Gray'&&n.id!==goal?.target.id)){
  const squad=candidates.slice(0,spare),guards=guardsAt(b,n,owner,{...cfg,reinforcementRadius:150},cache),strength=armyStrength(squad,guards),distance=Math.min(...squad.map(u=>route(b,u,n,cache)));
  if(!mainIntact(squad)||!Number.isFinite(distance)||guards.some(u=>u.garrisonId)||strength.power<armyStrength(guards,squad).power*(level>=3?1:1.1))continue;
  const siege=(n.hp||0)/Math.max(1,armyStrength(squad,guards,true).dps);
  if(siege>45&&!n.ruined)continue;
  const flight=distance/Math.max(1,squad[0].stats.speed*.88),incoming=hostileField(b,owner).filter(v=>v.order?.target===n.id).some(v=>route(b,v,n,cache)/Math.max(1,v.stats.speed*.88)<flight);
  if(incoming)continue;
  offers.push({kind:'raid',target:n,squad,score:180-distance*.2-(guards.length?80:0)+state.personality[2]*15+Intel.resourceValue(state.intel,n)*.3});
 }
 if(level>=3)for(const v of hostileField(b,owner)){
  if(!['archers','magic','siege'].includes(v.type)&&v.hp>v.maxHp*.55)continue;
  const u=candidates.find(u=>u.type==='cavalry')||candidates[0],distance=route(b,u,v,cache);
  if(distance>250)continue;
  const support=hostileField(b,owner).filter(e=>physical(e,v)<140),squad=candidates.filter(c=>route(b,c,v,cache)<distance+90).slice(0,spare);
  if(!mainIntact(squad)||armyStrength(squad,support).power<armyStrength(support,squad).power*.95)continue;
  offers.push({kind:'harass',target:v,squad,score:120-distance*.25+(v.type==='siege'?30:0)+(1-v.hp/v.maxHp)*40});
 }
 offers.sort((a,c)=>c.score-a.score||a.target.id-c.target.id);const best=offers[0];if(!best)return used;
 const ids=new Set();for(const u of best.squad)if(send(b,u,best.target,state,false,cache)){ids.add(u.id);used.add(u.id);state.task?.wave.delete(u.id);}
 if(ids.size)state.maneuver={kind:best.kind,target:best.target.id,ids,until:b.time+(best.kind==='raid'?32:10)};
 return used;
}
function waveOrders(b,owner,wave,target,opponents,state,cfg,cache){
 if((cfg.tacticalLevel||0)<2){for(const u of wave)send(b,u,target,state,false,cache);return;}
 const enemies=opponents.filter(field),front=wave.filter(u=>u.type==='infantry'||u.avatar),frontmost=front.slice().sort((a,c)=>route(b,a,target,cache)-route(b,c,target,cache))[0];
 function behind(u,gap,escape=false){
  if(!frontmost)return false;const d=physical(frontmost,target);if(d<1)return false;
  const p=b.nearest({x:frontmost.x+(frontmost.x-target.x)*gap/d,y:frontmost.y+(frontmost.y-target.y)*gap/d}),old=state.orders.get(u.id);
  if(u.order&&!u.order.target&&u.path?.length&&old&&b.time-old.at<1.5)return true;
  return send(b,u,p,state,true,cache,escape);
 }
 for(const u of wave){
  const nearby=enemies.filter(v=>physical(u,v)<Math.max(160,u.stats.contactRange+30)),melee=nearby.filter(v=>!(v.stats.range>0));
  if(['archers','magic','siege'].includes(u.type)&&frontmost&&melee.some(v=>physical(u,v)<70)&&physical(u,frontmost)<170&&physical(frontmost,target)<physical(u,target)+50){if(behind(u,60,true))continue;}
  // Do not cancel a windup or change an actual contact opponent every AI tick.
  if(u.pendingAttack||u.combatTarget&&b.unit(u.combatTarget)?.hp>0)continue;
  if(u.type==='cavalry'&&enemies.length){
   const backline=nearby.filter(v=>v.stats.range>0).sort((a,c)=>physical(u,a)-physical(u,c))[0];
   const escort=front.some(v=>physical(u,v)<150),isolated=backline&&armyStrength([u],[backline]).power>=armyStrength(enemies.filter(v=>physical(v,backline)<120),[u]).power;
   if(backline&&(escort||isolated)){send(b,u,backline,state,false,cache);continue;}
   if(frontmost&&physical(u,target)+120<physical(frontmost,target)){if(behind(u,-80))continue;}
  }
  if(u.type==='infantry'&&traits(u).LongSpear){const horse=nearby.filter(v=>v.type==='cavalry').sort((a,c)=>physical(u,a)-physical(u,c))[0];if(horse){send(b,u,horse,state,false,cache);continue;}}
  if(['archers','magic'].includes(u.type)){const victim=nearby.slice().sort((a,c)=>(a.hp/a.maxHp)-(c.hp/c.maxHp)||physical(u,a)-physical(u,c))[0];if(victim){send(b,u,victim,state,false,cache);continue;}}
  if(u.type==='siege'&&frontmost&&enemies.length&&physical(u,target)+70<physical(frontmost,target)){if(behind(u,65))continue;}
  send(b,u,target,state,false,cache);
 }
}
function offensiveOrders(b,owner,troops,bases,available,goal,state,cfg,cache){
 if(b.time<cfg.opening||!goal||!state.task||!available.length)return;
 const task=state.task,target=goal.target;if(goal.heldForRepair)return;
 const chestOpponents=goal.kind==='chest'?[...guardForChest(b,target),...hostileField(b,owner).filter(u=>physical(u,target)<140)]:[];
 if(goal.kind==='chest'&&!chestOpponents.length){
  phase(state,'collect',b.time);
  const scout=available.find(u=>task.wave.has(u.id)&&u.order?.target===target.id)||available.filter(u=>!u.garrisonId&&u.hp>u.maxHp*.35).sort((a,c)=>route(b,a,target,cache)-route(b,c,target,cache))[0]||available[0];
  send(b,scout,target,state,true,cache);task.wave=new Set([scout.id]);return;
 }
 const opponents=goal.kind==='chest'?chestOpponents:goal.guards;
 const our=armyStrength(available,opponents).power;
 const effectiveCapacity=Math.max(1,b.cap(owner)-(troops.length-available.length)),full=b.pop(owner)>=b.cap(owner);
 const defense=goal.kind==='castle'?Math.max(goal.power||0,armyStrength(opponents,available).power):armyStrength(opponents,available).power;
 const needed=defense*(goal.kind==='chest'?cfg.chestRatio:full?1:cfg.attackRatio);
 const empty=goal.empty||target.ruined&&!target.captureOwner;
 const minimum=Math.min(effectiveCapacity,empty?1:cfg.minWave);
 // Reevaluate serious losses but retain normal engagement orders.
 if(task.phase==='attack'||task.phase==='guard'){
  const wave=available.filter(u=>task.wave.has(u.id)),near=wave.filter(u=>physical(u,target)<190||u.state==='attack');
  if(empty&&goal.kind==='castle'){
   waveOrders(b,owner,wave,target,opponents,state,cfg,cache);
   if(!wave.length)send(b,available[0],target,state,false,cache);return;
  }
  const localPower=armyStrength(near,opponents).power,nearDanger=near.length&&localPower<needed*.6;
  if(nearDanger)task.badSince??=b.time;else task.badSince=null;
  const sustainedLoss=nearDanger&&b.time-task.badSince>=3;
  if(!sustainedLoss&&(our>=needed*.85||near.length&&localPower>=needed*.65||b.time-task.phaseAt<4)){
   if(our>=needed)for(const u of available.filter(u=>!task.wave.has(u.id))){task.wave.add(u.id);wave.push(u);}
   waveOrders(b,owner,wave,goal.kind==='chest'?opponents[0]:target,opponents,state,cfg,cache);
   return;
  }
  phase(state,'gather',b.time);task.badSince=null;task.rally=null;task.wave.clear();task.regroupUntil=b.time+5;
 }
 // Wait for recruitment inside a safe home. Deploy to the rally only once
 // the available force can launch, so the tower does not empty into idle squads.
 if(our<needed||available.length<minimum||b.time<(task.regroupUntil||0)){phase(state,'gather',b.time);task.rally=null;task.wave.clear();for(const u of available){const home=bases.filter(n=>!dangerAt(b,n,owner,cache).length).sort((a,c)=>route(b,u,a,cache)-route(b,u,c,cache))[0];if(home)send(b,u,home,state,true,cache,u.state==='attack'||!!u.combatTarget);}return;}
 if(!task.rally)task.rally=rallyPoint(b,available,target,bases,cache,minimum,needed,opponents);
 const gathered=available.filter(u=>empty||!task.rally||physical(u,task.rally)<105);
 if(armyStrength(gathered,opponents).power>=needed&&gathered.length>=minimum){
  phase(state,goal.kind==='chest'?'guard':'attack',b.time);task.wave=new Set(gathered.map(u=>u.id));
  waveOrders(b,owner,gathered,goal.kind==='chest'?opponents[0]:target,opponents,state,cfg,cache);
 }else if(task.rally){
  for(const u of available){if(physical(u,task.rally)<45&&!u.order&&!u.garrisonId)continue;send(b,u,task.rally,state,true,cache);}
 }
}
function cluster(units,radius,weight=()=>1){return units.map(u=>({u,score:units.filter(v=>physical(u,v)<=radius).reduce((n,v)=>n+weight(v),0)})).sort((a,c)=>c.score-a.score||a.u.id-c.u.id)[0]?.u;}
function fighting(u,enemies){return u.state==='attack'||enemies.some(v=>physical(u,v)<Math.max(110,(u.stats?.contactRange||27)+55));}
function spellTarget(b,owner,type,troops,bases,goal,state){
 const spec=b.spellSpec(type,owner);if(!spec)return null;
 const enemies=b.units.filter(u=>u.owner!==owner&&field(u)),allies=troops.filter(field),active=allies.filter(u=>{const castle=u.order?.target&&b.building(u.order.target);return fighting(u,enemies)||castle&&castle.owner!==owner&&physical(u,castle)<u.stats.contactRange+80;}),radius=spec.row?.radius||75;
 const hostiles=enemies.filter(u=>!u.neutral&&active.some(v=>physical(u,v)<230));
 if(type==='ultimate'){
  if((b.ultimatePending||[]).some(p=>p.owner===owner))return null;
  const enemyArmy=b.units.filter(u=>alive(u)&&u.owner!==owner&&!u.neutral),threatened=bases.some(n=>dangerAt(b,n,owner).length),advanced=(b.settings.tacticalLevel||0)>=3;
  if(!enemyArmy.length)return null;
  if(owner==='Green'&&(enemyArmy.length<(advanced?2:3)&&!threatened||troops.some(u=>u.avatar)))return null;
  const convertible=enemyArmy.filter(u=>!u.garrisonId&&!traits(u).Mechanism);
  if(owner==='Purple'&&convertible.length<2)return null;
  if(owner==='Blue'&&enemyArmy.reduce((n,u)=>n+remaining(u),0)<(advanced?4:8))return null;
  if(owner==='Red'&&(enemyArmy.length<(advanced?2:3)&&!threatened||armyStrength(troops).power>armyStrength(enemyArmy).power*1.5&&!threatened))return null;
  if(!active.length&&!threatened&&!['attack','guard'].includes(state.task?.phase))return null;
  return cluster(enemyArmy,150);
 }
 const row=spec.row?.id;
 if(row===10)return cluster(allies.filter(u=>!u.protected&&['poison','frozen','chilled','weakened'].some(k=>u[k]>0)),radius);
 if(row===1||row===14){
  const wounded=allies.filter(u=>!traits(u).Mechanism&&u.maxHp-u.hp>=20&&u.hp<u.maxHp*.88);
  if(wounded.length)return cluster(wounded,radius,u=>u.maxHp-u.hp);
  if(row===14&&b.bonusFor(owner)[45]&&hostiles.length>1)return cluster(hostiles,radius);
  return null;
 }
 if(row===2)return cluster(active.filter(u=>!traits(u).Undead&&!traits(u).Mechanism&&!(u.heroic>0)),radius);
 if(row===6)return cluster(active.filter(u=>!(u.bloodlust>0)),radius);
 if(row===9)return cluster(active.filter(u=>(u.enchanted||0)<2),radius);
 if(spec.mode==='summon'){
  if(b.pop(owner)>=b.cap(owner)||!active.length)return null;
  const front=active.slice().sort((a,c)=>(a.stats?.range||0)-(c.stats?.range||0)||a.id-c.id)[0];return b.nearest(front);
 }
 if(row===12)return cluster(enemies.filter(u=>!traits(u).Undead&&!traits(u).Mechanism&&!traits(u).Discipline&&!u.protected&&!(u.weakened>0)&&active.some(v=>physical(u,v)<180)),radius);
 if(row===8)return cluster(enemies.filter(u=>!u.protected&&(u.frozen||0)<1&&active.some(v=>physical(u,v)<210)),radius);
 if(row===4){
  const castles=b.buildings.filter(n=>!secured(n,owner)&&(!n.ruined||n.captureOwner)&&active.some(u=>physical(u,n)<200));
  return cluster([...enemies.filter(u=>active.some(v=>physical(u,v)<200)),...castles],radius);
 }
 return cluster(enemies.filter(u=>active.some(v=>physical(u,v)<210)),radius);
}
function spells(b,owner,troops,bases,goal,state,cfg){
 if(typeof b.spellState!=='function'||b.time<state.spell)return;state.spell=b.time+(cfg.spellEvery||2);
 if(b.time<cfg.opening&&!bases.some(n=>dangerAt(b,n,owner).length))return;
 const offers=[];
 for(const type of ['ultimate','heal','fire','summon']){
  const status=b.spellState(type,owner);if(!status.ready||status.locked||status.affordable===false)continue;
  const p=spellTarget(b,owner,type,troops,bases,goal,state);if(!p)continue;
  const row=b.spellSpec(type,owner).row,previous=state.lastSpells.get(type);
  const repeat=row?.type===1?6:(cfg.tacticalLevel||0)>=3?2:4;
  if(previous&&b.time-previous.time<repeat&&physical(previous,p)<(row?.radius||75))continue;
  if((b.zones||[]).some(z=>z.owner===owner&&z.row.id===row?.id&&z.left>1&&physical(z,p)<(row?.radius||75)))continue;
  if((b.magicImpacts||[]).some(z=>z.owner===owner&&z.row.id===row?.id&&physical(z,p)<(row?.radius||75)))continue;
  const allies=troops.filter(u=>field(u)&&physical(u,p)<=(row?.radius||75)),foes=b.units.filter(u=>u.owner!==owner&&field(u)&&physical(u,p)<=(row?.radius||75));
  let value=foes.reduce((n,u)=>n+remaining(u),0)*.5;
  if([1,14].includes(row?.id))value=allies.reduce((n,u)=>n+(u.maxHp-u.hp)/Math.max(1,u.stats.hpPerMember),0)*.7+(allies.some(u=>u.hp<u.maxHp*.45)?5:0);
  if([2,6,9].includes(row?.id))value=allies.length*3;
  if(row?.id===10)value=allies.filter(u=>['poison','frozen','chilled','weakened'].some(k=>u[k]>0)).length*5;
  if(row?.id===4)value+=b.buildings.filter(n=>!secured(n,owner)&&physical(n,p)<100).length*5;
  if(status.spec.mode==='summon')value=4+Math.max(0,armyStrength(foes,allies).power/Math.max(1,armyStrength(allies,foes).power)-.8)*3;
  if(type==='ultimate')value=25;
  offers.push({type,p,value:value/Math.sqrt(Math.max(1,status.spec.cost/50))});
 }
 offers.sort((a,c)=>c.value-a.value);
 for(const offer of offers)if(b.cast(offer.type,offer.p,owner)===null){state.lastSpells.set(offer.type,{time:b.time,x:offer.p.x,y:offer.p.y});state.lastSpell=offer.type;return;}
}
function plan(b,owner){
 const cfg=configuration(b),state=stateFor(b,owner),cache=new Map();
 Intel.observe(state.intel,{time:b.time,buildings:b.buildings,slots:b.slots,units:b.units});
 let troops=b.units.filter(u=>u.owner===owner&&!u.neutral&&alive(u));const bases=b.owned(owner);
 let reservation=reserveUnits(b,owner,troops,bases,state,cfg,cache),goal=chooseTask(b,owner,reservation.available,bases,state,cfg,cache);
 state.investment=investmentFor(b,owner,troops,reservation.available,bases,goal,cfg,reservation.urgent);
 const reserve=development(b,owner,troops,bases,state,cfg,reservation.urgent,cache);
 recruit(b,owner,troops,bases,goal,state,cfg,reserve,reservation.urgent,cache);
 troops=b.units.filter(u=>u.owner===owner&&!u.neutral&&alive(u));
 reservation=reserveUnits(b,owner,troops,bases,state,cfg,cache);
 // New purchases change siege duration and counters; retain the selected
 // mission while refreshing its assessment instead of using a stale force.
 if(goal?.kind==='castle'&&!goal.heldForRepair)goal=targetAssessment(b,owner,goal.target,reservation.available.length?reservation.available:bases,cfg,cache);
 const maneuver=maneuverOrders(b,owner,reservation.available,bases,goal,state,cfg,reservation.threats,cache);
 offensiveOrders(b,owner,troops,bases,reservation.available.filter(u=>!maneuver.has(u.id)),goal,state,cfg,cache);

 spells(b,owner,troops,bases,goal,state,cfg);
 return {phase:state.task?.phase||'defend',target:state.task?.target||null,maneuver:state.maneuver?.kind||null,available:reservation.available.length,reserve,threats:reservation.threats.length,lastSpell:state.lastSpell||null,investment:state.investment,enemyEconomy:goal?.kind==='castle'?Intel.estimate(state.intel,goal.target.owner):null};
}
function run(b){
 if(b.result)return;
 for(const owner of Object.keys(b.factions)){
  if((b.humanOwners||[b.player]).includes(owner)||owner==='Gray')continue;
  const state=stateFor(b,owner),cfg=configuration(b);if(b.time<state.decision+cfg.decision-1e-6)continue;
  state.decision=b.time;plan(b,owner);
 }
}
const api={run,plan,armyStrength};if(typeof module!=='undefined')module.exports=api;else root.EnemyAI=api;
})(typeof window!=='undefined'?window:globalThis);

