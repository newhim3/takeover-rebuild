/* Estimates use public buildings, unit appearances and upgrades, never an opponent's purse. */
(function(root){
'use strict';
const costs={mine:90,farm:70,obelisk:100};
function createLedger(){return {time:null,units:new Map(),sites:new Map(),buildings:new Map(),countries:new Map()};}
function country(ledger,owner){let c=ledger.countries.get(owner);if(!c){c={incomeGold:0,incomeMana:0,earned:0,spentMin:0,spentMax:0,changes:0,units:0,replacementGold:0};ledger.countries.set(owner,c);}return c;}
function spend(ledger,owner,cost,certain=true){if(!owner||owner==='Gray'||!Number.isFinite(cost)||cost<=0)return;const c=country(ledger,owner);c.spentMin+=certain?cost*.6:0;c.spentMax+=cost*1.35;c.changes++;}
function observe(ledger,view){
 if(!Number.isFinite(view.time)||view.time<0||ledger.time!==null&&view.time<ledger.time)return ledger;
 // Time is authoritative simulation time: paused observations accrue no
 // income, and a repeated older snapshot must not rewind the income cursor.
 const time=view.time,dt=ledger.time===null?0:time-ledger.time,initial=ledger.time===null;
 for(const c of ledger.countries.values())c.earned+=c.incomeGold*dt;
 const homes=new Map();
 for(const n of view.buildings||[]){
  // Explicit public-field projection; queues, bonuses, paidCost and wallets are excluded.
  const seen={id:n.id,owner:n.owner||'Gray',level:Number.isFinite(n.level)&&n.level>=1?Math.floor(n.level):1,type:n.type,conquered:!!n.conquered,active:!n.ruined,secured:!n.ruined||n.captureOwner===n.owner};
  homes.set(n.id,seen);const old=ledger.buildings.get(n.id);
  if(!initial&&old&&old.owner===seen.owner&&seen.level>old.level)for(let level=old.level;level<seen.level;level++)spend(ledger,seen.owner,150*level);
  ledger.buildings.set(n.id,seen);
 }
 for(const s of view.slots||[]){
  const seen={id:s.id,parent:s.parent,type:s.type,owner:homes.get(s.parent)?.owner},old=ledger.sites.get(s.id);
  // Captured, already-built sites change owner without being purchased again.
  if(!initial&&seen.type&&(!old?.type||old.type!==seen.type)&&(!old||old.owner===seen.owner))spend(ledger,seen.owner,costs[seen.type]||0);
  ledger.sites.set(s.id,seen);
 }
 for(const c of ledger.countries.values()){c.incomeGold=0;c.incomeMana=0;c.units=0;c.replacementGold=0;}
 for(const n of homes.values())if(n.owner!=='Gray'&&n.active){const c=country(ledger,n.owner);c.incomeGold+=(n.type==='Castle'?1:0)+(n.conquered?1:0);c.incomeMana+=.65;}
 for(const s of view.slots||[]){const n=homes.get(s.parent);if(!n?.secured||n.owner==='Gray')continue;const c=country(ledger,n.owner);c.incomeGold+=s.type==='mine'?1.8:0;c.incomeMana+=s.type==='obelisk'?.9:0;}
 for(const u of view.units||[]){
  if(!(u.hp>0)||u.neutral||!u.owner||u.owner==='Gray')continue;const publicCost=u.avatar?0:u.record?.cost??u.stats?.cost??0,cost=Number.isFinite(publicCost)?Math.max(0,publicCost):0,old=ledger.units.get(u.id);
  if(!initial&&!old)spend(ledger,u.owner,cost,!!u.garrisonId&&homes.get(u.garrisonId)?.owner===u.owner);
  // A surviving ID changing allegiance is a conversion, not a purchase.
  ledger.units.set(u.id,{owner:u.owner,cost});const c=country(ledger,u.owner);c.units++;c.replacementGold+=cost;
 }
 // Keep tombstones to prevent a late/repeated appearance from being charged twice.
 for(const c of ledger.countries.values())if(c.units||c.incomeMana)c.incomeGold=Math.max(1,c.incomeGold);
 ledger.time=time;return ledger;
}
function estimate(ledger,owner){
 const c=ledger.countries.get(owner);if(!c)return {incomeGold:0,incomeMana:0,walletMin:0,walletMax:450,confidence:0,replacementGold:0};
 // Starting resources, discounts, loot, demolition refunds and summons are uncertain.
 const walletMin=Math.max(0,c.earned-c.spentMax),walletMax=Math.max(walletMin,450+c.earned-c.spentMin);
 return {...c,walletMin,walletMax,confidence:Math.min(.75,c.changes*.06)};
}
function resourceValue(ledger,target,seconds=30){
 if(!target||!target.owner||target.owner==='Gray')return 0;
 const active=!target.ruined,secured=active||target.captureOwner===target.owner;
 if(!secured)return 0;
 seconds=Number.isFinite(seconds)?Math.max(0,seconds):30;
 let gold=active?((target.type==='Castle'?1:0)+(target.conquered?1:0)):0,mana=active?.65:0,supply=active?(target.type==='Castle'?2:1):0;
 for(const s of ledger.sites.values())if(s.parent===target.id&&s.owner===target.owner){gold+=s.type==='mine'?1.8:0;mana+=s.type==='obelisk'?.9:0;supply+=s.type==='farm'?1:0;}
 return gold*seconds+mana*seconds*.35+supply*12;
}
const api={createLedger,observe,estimate,resourceValue};if(typeof module!=='undefined')module.exports=api;else root.AiEconomyIntel=api;
})(typeof window!=='undefined'?window:globalThis);
