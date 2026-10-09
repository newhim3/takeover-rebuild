/* Original stat conversions: battle/§_-iq§.as and §implements§/§_-02§.as.
 * attackSpeed / 10: §implements§/§_-vg§.as, §_-eD§().
 * Squad collision/contact distance is separate from the original attack range.
 */
(function(root){
function abilities(text){return Object.fromEntries(text.split(';').filter(Boolean).map(s=>{const [name,value]=s.trim().split(' ');return[name,value===undefined?true:Number(value)];}));}
function veteran(value,level){return Math.round(Math.max(Math.ceil(value*(1+level/10)),value+level));}
// Custom balance requested on 2026-10-06. One destroyed squad contributes
// 50 XP, shared by actual damage contribution; buildings do not grant XP.
function experience(rank){return [0,0,100,200][rank]||0;}
function rankForXP(xp){return xp>=200?3:xp>=100?2:1;}
const RANK_SCALE={infantry:{hp:[1,1.5,2],damage:[1,1.15,1.3]},archers:{hp:[1,1.25,1.5],damage:[1,1.33,1.75]},magic:{hp:[1,1.25,1.5],damage:[1,1.33,1.75]},cavalry:{hp:[1,1,1],damage:[1,1.3,1.6],speed:[1,1.2,1.4]},siege:{hp:[1,1.2,1.4],damage:[1,1.3,1.66]}};
function walkFrame(distance,record){return distance/(record.baseSpeedAnimWalk||11)*30;}
// Source: qG/Y2 tT starts a 0.5s SPEED property on pursuing a new target.
// pP increaseSpeed adds floor((SPEED / 2) * 15), rather than multiplying by 16.
// The engagement envelope follows the web engine's road/contact model;
// preserve its existing normal movement speed instead of rescaling the world.
function beginHorrificDash(u,target,distance,time){
 if(!target){u.horrificDashTarget=null;u.horrificDashUntil=0;return false;}
 const t=u.stats,ability=t?.abilities;
 if(!ability?.HorrificDash||ability.Charge||u.hp<=0||u.garrisonId||u.frozen>0||target.hp<=0||target.owner===u.owner||target.garrisonId||'queue' in target)return false;
 if(distance<=t.contactRange||distance>Math.max(115,t.contactRange+35,target.stats?.range||0)||u.horrificDashTarget===target.id)return false;
 u.horrificDashTarget=target.id;u.horrificDashUntil=time+.5;return true;
}
function horrificDashStep(u,dt,speed,time){
 const active=Math.min(dt,Math.max(0,(u.horrificDashUntil||0)-time));
 return speed*dt+Math.floor(speed*15/2)*active;
}
function formation(members){if(members>=9)return [[0,0],[0,14],[0,-14],[-14,0],[-14,14],[-14,-14],[-28,0],[-28,14],[-28,-14],[-42,0],[-42,14],[-42,-14]];if(members>=7)return [[0,0],[-21,14],[-21,-14],[-42,14],[-42,-14],[-63,14],[-63,-14]];if(members>=6)return [[0,0],[-14,10.5],[-14,-10.5],[-21,0],[-31.5,10.5],[-31.5,-10.5]];if(members>=5)return [[0,0],[-21,14],[-21,-14],[-42,14],[-42,-14]];return members>=3?[[0,0],[-14,7],[-14,-7]]:[[0,0]];}
function damageMultiplier(attacker,target,distance,isBuilding=false){const t=attacker.stats,bonus=attacker.bonus||{},ranged=t.range>0&&distance>=27;let amount=1;if(isBuilding)amount*=(1+(bonus[18]||0)/100)*(1+(t.abilities.SiegeWeapon||0)*10/100);if(t.range>0&&!ranged&&!t.abilities.MartialArtists)amount*=1-t.meleePenalty/100;if(!isBuilding&&ranged)amount*=1-(target.stats?.abilities.ShieldWall||0)/100;if(!isBuilding&&target.type==='cavalry')amount*=1+(t.abilities.LongSpear||0)/100;return amount;}
// Original squad morale: implements/§_-ok§.as. Empire edict47's +15%
// fear wording is verified in the update video; applying it to pressure is an
// adaptation until that update's source specifies its exact trigger formula.
function moraleState(u){const abil=u.stats?.abilities||abilities(u.record?.abilities||'');const base=Math.min(800,Math.max(200,Math.round((u.stats?.morale??u.record?.morale??50)*10)));u.moraleBase??=base;u.moraleValue??=u.moraleBase;u.moraleMode??='normal';u.moraleCalmClock??=0;return abil;}
function onMoraleHit(attacker,target){
 const immune=moraleState(target),a=attacker.stats?.abilities||abilities(attacker.record?.abilities||'');
 if(immune.Undead||immune.Mechanism)return 0;
 const loss=Math.floor((50+(Number(a.Intimidiation)||0))*(1+(attacker.bonus?.[47]||0)/100));
 target.moraleValue=Math.max(0,target.moraleValue-loss);
 if(target.moraleValue===0&&!immune.Discipline&&!target.protected&&target.moraleMode==='normal'){target.moraleMode='fear';target.weakened=Math.max(target.weakened||0,10);target.moraleCalmClock=0;}
 return loss;
}
function tickMorale(u,dt){
 const immune=moraleState(u);if(immune.Undead||immune.Mechanism)return;
 if(u.moraleMode==='fear'){if((u.weakened||0)>0)return;u.moraleValue=200;u.moraleMode='normal';u.moraleCalmClock=0;return;}
 if(u.moraleMode==='heroic'){if((u.heroic||0)>0)return;u.moraleValue=800;u.moraleMode='normal';u.moraleCalmClock=0;return;}
 if((u.heroic||0)>0){u.moraleMode='heroic';return;}
 if(u.moraleValue>=1000){u.moraleMode='heroic';u.heroic=Math.max(u.heroic||0,10);return;}
 if(u.moraleValue<=0&&!immune.Discipline&&!u.protected){u.moraleMode='fear';u.weakened=Math.max(u.weakened||0,10);return;}
 u.moraleCalmClock+=dt;const calm=Math.round(u.moraleBase*.01);
 while(u.moraleCalmClock>=.5){u.moraleCalmClock-=.5;u.moraleValue+=Math.sign(u.moraleBase-u.moraleValue)*Math.min(calm,Math.abs(u.moraleBase-u.moraleValue));}
}
// Per-member source effects (vg.ix / kQ). Poison's native property lasts
// 3000ms and pulses at entry, then every 3 seconds; it is not squad-level DPS.
function memberCount(u){return Math.max(0,Math.min(u.stats.members,Math.ceil(u.stats.members*u.hp/u.maxHp)));}
function tickCombatPassives(u,dt){
 if(u.hp<=0)return;
 if(u.poison>0){
  const step=Math.min(dt,u.poison);u.poisonPulse=(u.poisonPulse??0)-step;
  while(u.poisonPulse<=0&&u.hp>0){
   u.poisonPulse+=3;
   const resist=u.enchanted>0?u.enchantReduction||0:0;
   const raw=u.poisonDamage||0,perMember=Math.max(0,raw-Math.round(raw*resist));
   u.hp-=perMember*memberCount(u);u.lastDamageOwner=u.poisonOwner||u.lastDamageOwner;
  }
  u.poison=Math.max(0,u.poison-dt);
 }
 if(u.hp>0&&u.record?.name==='Giantbots')u.hp=Math.min(u.maxHp,u.hp+u.maxHp*(u.bonus?.[40]||0)/100*dt);
}
function applySlow(target,percent,duration){
 const resist=target.enchanted>0?target.enchantReduction||0:0,scale=Math.max(0,1-percent*(1-resist)/100);
 if(scale<=0){target.frozen=Math.max(target.frozen||0,duration);return;}
 target.chillScale=target.chilled>0?Math.min(target.chillScale??1,scale):scale;
 target.chilled=Math.max(target.chilled||0,duration);
}
function applyHitEffects(attacker,target){
 if(target.hp<=0||target.protected>0)return;
 const ability=attacker.stats.abilities,defense=target.stats?.abilities||{},bonus=attacker.bonus||{},duration=3+(bonus[30]||0);
 if(ability.Poisonous&&!defense.PoisonImmunity&&!defense.Undead&&!defense.Mechanism){
  const active=target.poison>0;
  target.poison=3;target.poisonDamage=ability.Poisonous+(bonus[24]||0);target.poisonOwner=attacker.owner;
  // Repeated attacks refresh the existing effect; they do not add a free
  // poison pulse every time a squad/member hits.
  if(!active)target.poisonPulse=0;
 }
 const freeze=Math.max(ability.FreezeArrow||0,ability.FreezeBlast||0);
 if(freeze)applySlow(target,freeze,duration);
 if(attacker.type==='infantry'&&Math.random()<(bonus[33]||0)/100)applySlow(target,110,duration);
}
function stats(record,type,rank=1,bonus={}){
 const level=Math.max(0,Math.min(2,rank-1)),scale=record.cost>0?RANK_SCALE[type]:null,abil=abilities(record.abilities),hpBonus=bonus[type==='infantry'?16:type==='cavalry'?39:-1]||0;
 const damageBonus=['archers','siege'].includes(type)?bonus[13]||0:0;
 const members=record.unitsCount+(abil.Undead&&type==='infantry'?bonus[23]||0:0);
 // Snow infantry has a smaller native per-member HP pool than Green.
 // Apply a documented modest resilience adjustment, preserving spear/freeze
 // counters, squad sizes and native technology records rather than promising
 // that one snow squad wins every possible two-versus-one fight.
 const countryHP=record.faction==='TheCult'&&type==='infantry'?1.2:record.faction==='TheEmpire'&&type==='infantry'?1.1:1;
 const hpPerMember=record.hp*(1+hpBonus/100)*(scale?.hp[level]||1)*countryHP;
 const damageMin=record.damageMin*(1+damageBonus/100)*(scale?.damage[level]||1);
 const damageMax=record.damageMax*(1+damageBonus/100)*(scale?.damage[level]||1);
 return {...record,abilities:abil,members,hpPerMember,hp:hpPerMember*members,damageMin,damageMax,
 damage:(damageMin+damageMax)/2*members,attackInterval:record.attackSpeed/10,
 contactRange:Math.max(27,record.range),morale:Math.ceil(record.morale*(1+(bonus[15]||0)/100)),
 speed:record.speed*(1+(bonus[19]||0)/100)*(1+(type==='siege'?bonus[27]||0:0)/100)*(scale?.speed?.[level]||1)};
}
const api={abilities,veteran,stats,experience,rankForXP,formation,damageMultiplier,walkFrame,beginHorrificDash,horrificDashStep,onMoraleHit,tickMorale,memberCount,tickCombatPassives,applyHitEffects,applySlow};if(typeof module!=='undefined')module.exports=api;else root.UnitRules=api;
})(typeof window!=='undefined'?window:globalThis);
