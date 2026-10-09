/* Bounded planning estimates, not a second simulation or changes to combat rules. */
(function(root){
'use strict';
function forecast(allies,enemies){
 const number=value=>Number.isFinite(value)?Math.max(0,value):0;
 const copy=team=>(team||[]).filter(u=>number(u?.hp)>0).map(u=>({hp:number(u.hp),start:number(u.hp),dps:number(u.dps)}));
 const a=copy(allies),e=copy(enemies),hp=a.reduce((n,u)=>n+u.hp,0),enemyHp=e.reduce((n,u)=>n+u.hp,0);
 const remaining=team=>team.reduce((n,u)=>n+Math.max(0,u.hp),0);
 const loss=()=>hp?Math.max(0,Math.min(1,1-remaining(a)/hp)):0;
 const dps=team=>team.reduce((n,u)=>n+(u.hp>0?u.dps*u.hp/u.start:0),0);
 const victim=team=>team.filter(u=>u.hp>0).sort((u,v)=>u.hp/Math.max(.1,u.dps)-v.hp/Math.max(.1,v.dps))[0];
 let seconds=0;
 // Each event eliminates at least one squad. Large armies collapse into one
 // aggregate after the fixed event budget, retaining their HP and DPS.
 for(let step=0;step<32;step++){
  const ad=dps(a),ed=dps(e),at=victim(a),et=victim(e);if(!et)return {win:!!at,loss:loss(),seconds,enemyRemaining:0};
  if(!at)return {win:false,loss:loss(),seconds,enemyRemaining:remaining(e)/(enemyHp||1)};
  if(ad<=0)return {win:false,loss:ed>0?1:loss(),seconds:seconds+(ed>0?remaining(a)/ed:0),enemyRemaining:remaining(e)/(enemyHp||1)};
  const dt=Math.min(et.hp/ad,ed>0?at.hp/ed:Infinity);if(!Number.isFinite(dt))break;
  et.hp=Math.max(0,et.hp-ad*dt);if(ed>0)at.hp=Math.max(0,at.hp-ed*dt);seconds+=dt;
  if(et.hp<.0001)et.hp=0;if(at.hp<.0001)at.hp=0;
 }
 const ah=remaining(a),eh=remaining(e),ad=dps(a),ed=dps(e);
 if(!eh)return {win:ah>0,loss:loss(),seconds,enemyRemaining:0};
 if(!ah||ad<=0)return {win:false,loss:ah&&ed<=0?loss():hp?1:0,seconds:seconds+(ed>0?ah/ed:0),enemyRemaining:eh/(enemyHp||1)};
 if(ed<=0)return {win:true,loss:loss(),seconds:seconds+eh/ad,enemyRemaining:0};
 // Resolve the bounded tail with continuous aggregate attrition. Returning
 // the intermediate loss after event 32 made large matched armies appear
 // to win with survivors even when both sides would be eliminated.
 const ap=ah*ad,ep=eh*ed,win=ap>ep,ratio=Math.min(ap,ep)/Math.max(ap,ep);
 const survivor=Math.sqrt(Math.max(0,1-ratio)),rate=Math.sqrt((ad/ah)*(ed/eh));
 const tail=rate>0?Math.atanh(Math.min(1-1e-9,Math.sqrt(ratio)))/rate:0;
 return {win,loss:win?1-ah*survivor/(hp||1):hp?1:0,seconds:seconds+tail,enemyRemaining:win?0:eh*survivor/(enemyHp||1)};
}
function investment({time,opening,tier,gold,income,freeSupply,cheapest,available,minimum,ourPower,needed,goal,underPressure,armyFirst}){
 const nonnegative=value=>Number.isFinite(value)?Math.max(0,value):0;
 time=nonnegative(time);opening=nonnegative(opening);tier=nonnegative(tier);gold=nonnegative(gold);income=nonnegative(income);
 freeSupply=Math.floor(nonnegative(freeSupply));available=Math.floor(nonnegative(available));minimum=Math.floor(nonnegative(minimum));ourPower=nonnegative(ourPower);needed=nonnegative(needed);
 const canRecruit=Number.isFinite(cheapest)&&cheapest>0;
 const gap=Math.max(0,needed-ourPower),missing=Math.max(0,minimum-available),useful=!!goal&&!goal.heldForRepair;
 const preparing=useful&&(gap>ourPower*.08||missing>0),timely=useful&&(goal.empty||goal.distance<360||goal.kind==='chest');
 const commit=time>=opening&&freeSupply>0&&canRecruit&&(underPressure||preparing||armyFirst||tier>=2&&timely);
 const desired=Math.max(missing,gap>0?Math.ceil(gap/Math.max(1,ourPower/Math.max(1,available))):0);
 const burst=commit?Math.min(tier>=3?6:tier>=2?3:1,Math.max(1,desired)):1;
 // Short affordable economic plans can continue; castle upgrades never lock
 // the entire purse while the current assault is short of paid units.
 const reserveCeiling=commit?Math.max(0,gold-cheapest*Math.max(1,Math.min(freeSupply,burst))):Infinity;
 return {commit,preparing,burst,reserveCeiling,delayUpgrade:commit&&(preparing||underPressure),affordable:canRecruit?Math.floor(gold/cheapest):0,income};
}
const api={forecast,investment};if(typeof module!=='undefined')module.exports=api;else root.AiCombatPlanner=api;
})(typeof window!=='undefined'?window:globalThis);
