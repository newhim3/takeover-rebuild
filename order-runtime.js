/* Explicit orders, automatic combat and garrison transitions share one priority. */
(function(root){
'use strict';
const R=typeof module!=='undefined'?require('./unit-rules.js'):root.UnitRules;
const distance=(a,b)=>Math.hypot(a.x-b.x,(a.y-b.y)*2);
const OGRE={acquire:90,chase:125,leash:145,returnReacquire:65};
// Decide contact from both retained destinations, not the old attack state.
// Marching into an opponent remains combat, including recovery orders.
function withdrawing(b,u,v){
 if(!u?.order||u.neutral||u.garrisonId||u.hp<=0||u.frozen>0||u.knockPath?.length||!v||u.order.target===v.id)return false;
 // A bow's local firing position is not an order to disengage. Determine
 // withdrawal from its retained destination while that temporary path runs.
 const next=u.pathTarget==='ranged-spacing'?u.order:u.path?.length?b.lookAhead(u):u.order,dx=next.x-u.x,dy=(next.y-u.y)*2,vx=v.x-u.x,vy=(v.y-u.y)*2;
 const length=Math.hypot(dx,dy),gap=Math.hypot(vx,vy);
 return length>.01&&gap>.01&&(dx*vx+dy*vy)<-.08*length*gap;
}
function mutualWithdrawal(b,u,v){return withdrawing(b,u,v)&&withdrawing(b,v,u);}
function target(b,u){
 if(!u.order?.target)return null;
 let t=b.unit(u.order.target)||b.building(u.order.target)||b.chest(u.order.target);
 if(t?.garrisonId&&t.owner!==u.owner){t=b.building(t.garrisonId);if(t){u.order.target=t.id;u.order.x=t.x;u.order.y=t.y;u.order.enter=b.canEnter(t,u.owner);u.path=[];u.pathTarget=null;}}
 if(!t||t.hp<=0&&!('queue' in t)||t.owner===u.owner&&!('queue' in t)&&!u.order.collect){u.order=null;u.path=[];u.pathTarget=null;return null;}
 if(t.ruined&&!t.captureOwner){u.order.enter=true;u.order.capture=true;u.order.forceMove=true;}
 if(t.ruined&&t.captureOwner&&t.owner!==u.owner){u.order.enter=false;u.order.forceMove=false;}
 return t;
}
function canKeep(b,u,v){
 if(!v||v.hp<=0||v.garrisonId||v.owner===u.owner)return false;
 if(u.pursuitBlocked?.target===v.id&&b.time<u.pursuitBlocked.until&&distance(u,v)>u.stats.contactRange+8)return false;
 if(u.neutral)return distance(u,v)<=OGRE.chase&&distance(v,u.home)<=OGRE.leash;
 return b.canEngage(u,v);
}
function enemy(b,u){
 if(u.neutral&&(u.returningHome||b.time<(u.returnUntil||0)))return null;
 const previous=b.unit(u.combatTarget);if(canKeep(b,u,previous))return previous;
 if(u.neutral&&b.time-(u.lastHitAt??-Infinity)<8){const attacker=b.unit(u.lastAttackerId);if(canKeep(b,u,attacker)){const path=b.path(u,attacker);if(path.length&&b.routeLength(u,path)<=155)return attacker;}}
 const radius=u.neutral?(u.returningHome?OGRE.returnReacquire:OGRE.acquire):Math.max(75,u.stats.contactRange+10);
 return (b.nearUnits?b.nearUnits(u,radius):b.units).filter(v=>distance(u,v)<=radius&&canKeep(b,u,v)&&(!u.neutral||distance(v,u.home)<=OGRE.leash)).sort((a,c)=>distance(u,a)-distance(u,c)||a.id-c.id)[0]||null;
}
function pursuit(b,u,v,dt){
 if(u.neutral||!v||'queue' in v||v.owner===u.owner)return true;
 const range=u.stats.contactRange,contact=distance(u,v)<=Math.max(75,range+10);
 // Walking to an explicitly ordered enemy is allowed. The leash starts
 // only after actual contact, so a distant initial destination still works.
 if(!u.pursuit&&contact)u.pursuit={x:u.x,y:u.y,chasing:0,lastContact:b.time};
 const chase=u.pursuit;if(!chase)return true;
 const leash=u.type==='cavalry'?180:u.stats.range>60?110:125;
 if(distance(u,v)<=range+8&&distance(u,chase)<=leash){chase.lastContact=b.time;chase.chasing=0;return true;}
 chase.chasing+=dt;
 if(distance(u,chase)<=leash&&distance(v,chase)<=leash+range&&chase.chasing<7)return true;
 u.pursuitBlocked={target:v.id,until:b.time+5};u.combatTarget=null;u.attackTarget=null;u.pendingAttack=null;u.pursuit=null;u.path=[];u.pathTarget=null;
 const directed=b.unit(u.order?.target);
 if(!u.order||directed){b.issue(u,{x:chase.x,y:chase.y},null,{forceMove:true,avoidCombat:true});}
 else u.path=b.path(u,b.building(u.order.target)||b.chest(u.order.target)||u.order);
 b.move(u,dt);return false;
}
function marchInContact(b,u,foe,assigned,dt){
 if(!foe||!u.order||(!u.order.manualMarch&&!u.order.avoidCombat&&!withdrawing(b,u,foe)))return false;
 u.pursuit=null;u.attackTarget=foe.id;
 const reach=distance(u,foe)<=u.stats.contactRange+8;
 if(reach&&u.attackCd<=0&&!u.pendingAttack){u.attackCd=u.stats.attackInterval/(u.chilled>0?u.chillScale:1);b.beginAttack(u,foe,false);}
 if(!u.path.length||u.pathTarget!==u.order.target){u.path=b.path(u,assigned||u.order);u.pathTarget=u.order.target;}
 const next=b.lookAhead(u),dx=next.x-u.x,dy=(next.y-u.y)*2,length=Math.hypot(dx,dy);
 // Direct contact blocks marching into an enemy. A withdrawal can move
 // away and counterattack without replacing the player's destination.
 const blocking=length>0&&(b.nearUnits?b.nearUnits(u,38):b.units).some(v=>v.hp>0&&!v.garrisonId&&v.owner!==u.owner&&distance(u,v)<38&&((v.x-u.x)*dx+(v.y-u.y)*2*dy)/length>0&&Math.abs((v.x-u.x)*dy-(v.y-u.y)*2*dx)/length<20);
 if(!blocking&&u.path.length){b.move(u,dt);if(u.pendingAttack)u.state='attack';}
 else {u.state='attack';b.steer(u,Math.atan2((foe.y-u.y)*2,foe.x-u.x),dt);}
 return true;
}
function clearRangedPosition(u){
 if(u.pathTarget==='ranged-spacing'){u.path=[];u.pathTarget=null;}
 u.rangedPosition=null;
}
function blocksPath(b,u,path){
 const next=path.find(p=>distance(u,p)>1);if(!next)return false;
 const dx=next.x-u.x,dy=(next.y-u.y)*2,length=Math.hypot(dx,dy);
 return (b.nearUnits?b.nearUnits(u,38):b.units).some(v=>v.hp>0&&!v.garrisonId&&v.owner!==u.owner&&distance(u,v)<38&&((v.x-u.x)*dx+(v.y-u.y)*2*dy)/length>0&&Math.abs((v.x-u.x)*dy-(v.y-u.y)*2*dx)/length<20);
}
// Shared bow handling, independent of AI difficulty. Keep the actual attack
// order and native speed/range; only its temporary road position changes.
function rangedSpacing(b,u,foe,dt){
 if(u.type!=='archers'||u.stats.range<=27||!foe||foe.hp<=0||u.stance==='hold'||u.order?.manualMarch||u.order?.forceMove||u.order?.collect||u.order?.enter){clearRangedPosition(u);return false;}
 const desired=Math.min(u.stats.contactRange-10,Math.max(45,u.stats.contactRange*.8)),near=(b.nearUnits?b.nearUnits(u,desired):b.units),old=u.rangedPosition;
 const eligible=v=>v&&v.hp>0&&!v.garrisonId&&v.owner!==u.owner&&distance(u,v)<desired&&!mutualWithdrawal(b,u,v);
 const nearest=near.filter(eligible).sort((a,c)=>distance(u,a)-distance(u,c)||a.id-c.id)[0],previous=b.unit(old?.threat);
 // Shoulder-to-shoulder opponents alternate as "nearest" every frame. Keep
 // the current threat while the difference is small instead of re-routing.
 const threat=eligible(previous)&&nearest&&distance(u,previous)<=distance(u,nearest)+12?previous:nearest;
 // Separate entry/release distances avoid stepping forward/back every tick.
 if(!threat||!old&&distance(u,threat)>=desired*.72){clearRangedPosition(u);return false;}
 // Complete the current shot before moving; do not turn ranged units into
 // perfect kiting units that can fire continuously while running backwards.
 if(u.pendingAttack||u.attackCd<=0)return false;
 if(!old||old.threat!==threat.id||b.time>=old.retryAt||!u.path.length){
  if(old&&old.threat===threat.id&&b.time<old.retryAt&&!old.point)return false;
  const gap=distance(u,threat),angle=Math.atan2((u.y-threat.y)*2,u.x-threat.x),step=Math.min(85,Math.max(30,desired-gap+10));let best=null;
  for(const turn of [0,-.65,.65]){
   const direction=angle+turn,point=b.nearest({x:u.x+Math.cos(direction)*step,y:u.y+Math.sin(direction)*step/2}),gain=distance(point,threat)-gap;
   if(gain<8||distance(u,point)<6)continue;
   const path=b.path(u,point),first=path.find(p=>distance(u,p)>1);if(!first||b.routeLength(u,path)>step+45||distance(first,threat)<gap-1||blocksPath(b,u,path))continue;
   if(near.some(v=>v!==threat&&v.hp>0&&!v.garrisonId&&v.owner!==u.owner&&distance(point,v)<38))continue;
   const score=gain-b.routeLength(u,path)*.08;if(!best||score>best.score)best={point,path,score};
  }
  u.rangedPosition={threat:threat.id,point:best?.point||null,retryAt:b.time+.4};
  if(!best){if(u.pathTarget==='ranged-spacing'){u.path=[];u.pathTarget=null;}return false;}
  u.path=best.path;u.pathTarget='ranged-spacing';
 }
 if(u.pathTarget!=='ranged-spacing'||!u.path.length||blocksPath(b,u,u.path))return false;
 u.attackTarget=foe.id;b.move(u,dt);return true;
}
function enter(b,u,home,dt){
 if(!b.canEnter(home,u.owner)){u.order.enter=false;u.order.forceMove=false;return false;}
 const hostileCrew=b.units.find(v=>v.hp>0&&v.owner!==u.owner&&v.garrisonId===home.id);
 if(hostileCrew){b.defend(home,u);return false;}const contest=b.units.find(v=>v.hp>0&&!v.neutral&&!v.garrisonId&&v.owner!==u.owner&&(distance(v,b.nearest(home))<130||v.defendHome===home.id&&distance(v,home)<220));if(contest){u.combatTarget=contest.id;u.path=[];u.pathTarget=null;return false;}
 const gate=b.nearest(home);
 if(distance(u,gate)>22){if(!u.path.length||u.pathTarget!==home.id){u.path=b.path(u,gate);u.pathTarget=home.id;}b.move(u,dt);return true;}
 b.claim(home,u.owner);u.garrisonId=home.id;u.defendHome=home.id;u.stayUntil=b.time+(u.order.manual?3:1);u.x=home.x;u.y=home.y;u.state=home.ruined?'capture':'repair';u.order=null;u.path=[];u.pathTarget=null;u.combatTarget=null;u.pendingAttack=null;return true;
}
function advanceOrder(b,u,assigned,dt){
 const destination=assigned||u.order;if(!destination)return;
 if(!u.path.length&&b.time>=(u.orderRetryAt||0)){u.path=b.path(u,destination);u.orderRetryAt=b.time+.35;}
 b.move(u,dt);
 // Empty paths can mean arrival or no route. Only arrival completes a ground
 // command; retain a blocked destination and retry without losing its version.
 if(!u.path.length&&!u.order?.target&&distance(u,b.nearest(destination))<4){u.order=null;u.pathTarget=null;u.moveVelocity=0;}
}
function tick(b,u,dt){
 if(u.hp<=0)return;
 if(R.tickCombatPassives)R.tickCombatPassives(u,dt);else{if(u.poison>0){u.poison-=dt;u.hp-=u.poisonDamage*dt;}if(u.record.name==='Giantbots')u.hp=Math.min(u.maxHp,u.hp+u.maxHp*(u.bonus?.[40]||0)/100*dt);}
 for(const key of ['heroic','weakened','frozen','enchanted','protected','bloodlust','chilled','levelGlow'])u[key]=Math.max(0,(u[key]||0)-dt);
 R.tickMorale(u,dt);if(u.hp<=0)return;
 if(u.frozen>0){u.pendingAttack=null;u.state='idle';return;}
 if(u.garrisonId){const home=b.building(u.garrisonId);if(!home||!b.canEnter(home,u.owner))b.deploy(u);else{const threat=b.defendingThreat(home);if(threat){b.defend(home,threat);if(!u.garrisonId)return;}u.x=home.x;u.y=home.y;u.anim+=dt;u.state=home.ruined?'capture':home.hp<home.maxHp?'repair':'garrison';if(home.owner===u.owner)u.hp=Math.min(u.maxHp,u.hp+8*dt);if(!home.ruined&&home.owner===u.owner){home.hp=Math.min(home.maxHp,home.hp+12*dt);if(home.level>u.rank)b.addXP(u,Math.min(1.25*dt*(1+(u.bonus?.[37]||0)/100),Math.max(0,R.experience(home.level)-u.xp)));}return;}}
 if(u.knockPath?.length){b.stepKnockback(u,dt);return;}
 const contact=b.unit(u.combatTarget||u.attackTarget);
 if(contact&&mutualWithdrawal(b,u,contact)){u.combatTarget=null;u.attackTarget=null;u.pendingAttack=null;u.pursuit=null;}
 b.finishAttack(u,dt);if(u.hp<=0)return;
 u.anim+=dt;u.attackCd=Math.max(0,u.attackCd-dt);u.repath-=dt;u.state=u.pendingAttack?'attack':'idle';
 let assigned=target(b,u);
 // A move order retains its destination while contact combat interrupts it.
 // Only a deliberately reserved recovery/escape order avoids interception.
 if(u.defendHome&&!u.order?.forceMove){const home=b.building(u.defendHome);if(!home||home.owner!==u.owner)u.defendHome=null;else{const intruder=b.defendingThreat(home);if(!intruder){b.issue(u,home,home.id,{forceMove:true});assigned=home;if(enter(b,u,home,dt))return;}else if(!assigned||u.order?.enter){b.issue(u,intruder,intruder.id);assigned=intruder;}}}
 let foe=enemy(b,u);const oldTarget=u.combatTarget;u.combatTarget=foe?.id||null;
 const pursuing=foe&&!withdrawing(b,u,foe);
 R.beginHorrificDash(u,pursuing?foe:null,pursuing?distance(u,foe):Infinity,b.time);
 if(foe&&(!oldTarget||oldTarget!==foe.id)&&!u.order?.manualMarch){u.path=[];u.pathTarget=null;}
 if(!foe&&oldTarget){u.path=[];u.pathTarget=null;if(u.order)u.path=b.path(u,assigned||u.order);}
 if(u.neutral){
  if(foe){u.returningHome=false;u.order=null;}
  else if(distance(u,u.home)>8){u.returningHome=true;u.pendingAttack=null;u.attackTarget=null;if(!u.path.length||u.pathTarget!=='home'){u.path=b.path(u,u.home);u.pathTarget='home';}b.move(u,dt);return;}
  else {if(u.returningHome)u.returnUntil=b.time+1;u.returningHome=false;u.path=[];u.pathTarget=null;u.moveVelocity=0;return;}
 }
 if(assigned&&'queue' in assigned&&u.order?.enter&&!foe){if(enter(b,u,assigned,dt))return;foe=b.unit(u.combatTarget)||null;}
 if(marchInContact(b,u,foe,assigned,dt))return;
 if(u.order?.collect){if(!assigned){u.order=null;u.path=[];return;}if(!foe){if(!u.path.length)u.path=b.path(u,assigned);b.move(u,dt);return;}}
 if(u.order?.forceMove&&!foe){advanceOrder(b,u,assigned,dt);return;}
 let victim=foe||assigned;if(victim?.garrisonId)victim=null;
 if(!foe&&(!victim||'queue' in victim)&&u.pursuit&&b.time-u.pursuit.lastContact>2)u.pursuit=null;
 if(!pursuit(b,u,victim,dt))return;
 if(!victim&&!u.order&&!u.neutral)victim=b.buildings.find(n=>(!n.ruined||n.captureOwner)&&n.owner!==u.owner&&distance(u,n)<u.stats.contactRange+25);
 if(rangedSpacing(b,u,victim&&!('queue' in victim)?victim:null,dt))return;
 if(victim){const isBuilding='queue' in victim,base=u.stats.contactRange+(isBuilding?20:0),range=base+(u.attackTarget===victim.id?8:0);
  if(distance(u,victim)<=range){u.attackTarget=victim.id;u.path=[];u.state='attack';b.steer(u,Math.atan2((victim.y-u.y)*2,victim.x-u.x),dt);if(u.attackCd<=0&&!u.pendingAttack){u.attackCd=u.stats.attackInterval/(u.chilled>0?u.chillScale:1);b.beginAttack(u,victim,isBuilding);}}
  else {u.attackTarget=null;if(!u.path.length||u.pathTarget!==victim.id||!isBuilding&&u.repath<=0){u.path=b.path(u,victim);u.pathTarget=victim.id;u.repath=.5;}b.move(u,dt);}
 }else if(u.order){advanceOrder(b,u,null,dt);}
}
const api={tick,OGRE,withdrawing,mutualWithdrawal};if(typeof module!=='undefined')module.exports=api;else root.OrderRuntime=api;
})(typeof window!=='undefined'?window:globalThis);
