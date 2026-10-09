/* Spell behavior recovered from level/Level.as; shared by every faction. */
(function(root){
'use strict';
const P=typeof module!=='undefined'?require('./progression.js'):root.Progression;
const R=typeof module!=='undefined'?require('./unit-rules.js'):root.UnitRules;
const Timing=typeof module!=='undefined'?require('./animation-timing.js'):root.AnimationTiming;
const distance=(a,b)=>Math.hypot(a.x-b.x,(a.y-b.y)*2);
const living=u=>!u.stats.abilities.Undead&&!u.stats.abilities.Mechanism;
const members=u=>Math.max(0,Math.ceil(u.stats.members*u.hp/u.maxHp));
function summon(b,owner,p,type,record){
 const u=b.spawn({owner,x:p.x,y:p.y-45,level:1},type);u.garrisonId=null;
 if(record){u.record=record;u.tech=record.techLevel;u.unitName=record.name;u.stats=R.stats(record,type,1,b.bonusFor(owner));u.hp=u.maxHp=u.stats.hp;}
 return u;
}
function cast(b,type,p,owner=b.player){
 const f=b.factions[owner],spec=b.spellSpec(type,owner),bonus=b.bonusFor(owner);
 if(b.result||!f||!spec)return '法术不可用';if(spec.locked)return '请先在条令中解锁此魔法';
 if(type==='ultimate')return ultimate(b,p,owner);
 if(b.cooldowns(owner)[type]>0)return '法术冷却中';if(f.mana<spec.cost)return '魔力不足';
 if(!p||p.x<0||p.x>b.width||p.y<0||p.y>b.height)return '请在战场内施法';
 const row=spec.row;if([5,13].includes(row.id)&&b.pop(owner)>=b.cap(owner))return '补给上限不足';
 f.mana-=spec.cost;
 // Native ordinary magic is limited by mana, without an invented timed CD.
 const duration=row.time*(row.type===1?1+(bonus[6]||0)/100:1)+(row.id===4?bonus[21]||0:0);
 const cycle=(Timing.StoneWormsEffectClass-2)/30;
 b.magicEffect(row.id===8?'IceBlastEffectClass':spec.fx,p,duration||undefined,{owner,ground:[1,2,6,10,14].includes(row.id),loop:row.type===1||row.id===4,fps:30});
 if(row.type===1||row.id===4){b.zones??=[];b.zones.push({x:p.x,y:p.y,owner,row,left:duration,pulse:row.id===4?cycle:0,cycle:row.id===4?cycle:.5});}
 const banner={1:'BannerHealClass',2:'BannerHeroismClass',6:'BannerBloodlustClass',10:'BannerLiberationClass',14:'BannerDesecrationClass'}[row.id];if(banner)b.magicEffect(banner,p,duration,{owner,loop:true});
 if(row.id===12){b.magicEffect('TerrorFlyingBatEffectClass',p,undefined,{owner});b.magicEffect('TerrorSplashEffectClass',p,undefined,{owner,ground:true});}
 if(row.id===8){b.magicImpacts??=[];b.magicImpacts.push({x:p.x,y:p.y,owner,row,left:(Timing.IceBlastEffectClass-2)/30,bonus});}
 for(const u of b.units){if(u.hp<=0||u.garrisonId||distance(u,p)>row.radius)continue;const ally=u.owner===owner;
  if(row.id===0&&!ally){let damage=0;for(let i=0;i<members(u);i++)damage+=Math.ceil((row.power/2+Math.random()*(row.power*(1+(bonus[10]||0)/100)-row.power/2))*u.stats.hpPerMember/100);u.hp-=damage*(1-(u.stats.abilities.ShieldWall||0)/100);u.lastDamageOwner=owner;}
  if(row.id===9&&ally){u.enchanted=row.time;u.enchantReduction=row.power/100;}
  if(row.id===12&&!ally&&!u.protected&&living(u)){if(bonus[43]&&Math.random()<bonus[43]/100){convert(b,u,owner);}else if(u.heroic>0){u.heroic=0;u.moraleMode='normal';u.moraleValue=51;}else if(!(u.weakened>0)&&!u.stats.abilities.Discipline){u.weakened=10;u.moraleMode='fear';}}
 }
 if(row.id===5)summon(b,owner,p,'infantry',P.unit('Red','Infantry',2));
 if(row.id===13){const tier=bonus[49]||0,type=tier===2?(Math.random()<.5?'infantry':'magic'):tier===1?'infantry':Math.random()<.5?'archers':'infantry';summon(b,owner,p,type,P.unit('Purple',{archers:'Archers',infantry:'Infantry',magic:'Magic'}[type],tier?2:1));}
 b.emit(spec.name);return null;
}
function convert(b,u,owner){const pos={x:u.x,y:u.y};if(u.garrisonId){b.deploy(u);pos.x=u.x;pos.y=u.y;}u.hp=0;u.noBounty=true;summon(b,owner,pos,u.type);b.magicEffect('TerrorSpellEffectClass',pos,undefined,{owner});}
function ultimate(b,p,owner,declared=false){
 if(!declared){const status=b.spellState('ultimate',owner);if(status.requiresTower)return '占领并修复魔法塔后开始蓄能';if(!status.ready)return '大招正在蓄能';
  if(owner===b.player)b.ultimateCharge=0;else b.factions[owner].ultimateCharge=0;
  const fx='UltimateMessage'+({Green:1,Red:2,Purple:3,Blue:4}[owner])+'Class',duration=Timing[fx]/30;
  b.magicEffect(fx,{x:0,y:0},duration,{owner,type:'declaration'});b.ultimatePending??=[];b.ultimatePending.push({owner,p,left:duration});return null;
 }
 const spec=b.spellSpec('ultimate',owner),enemies=b.units.filter(u=>u.owner!==owner&&!u.neutral&&u.hp>0),bonus=b.bonusFor(owner);
 if(owner==='Green'){
  const homes=b.owned(owner),home=homes.sort((a,c)=>enemies.reduce((sum,u)=>sum+1/Math.max(1,distance(u,c)),0)-enemies.reduce((sum,u)=>sum+1/Math.max(1,distance(u,a)),0))[0];if(!home)return null;
  const pos=b.nearest({x:home.x,y:home.y+45});
  const u=summon(b,owner,pos,'magic',P.UNITS.find(r=>r.name==='Avatar'));u.avatar=true;
  b.magicEffect('SignOfAdventEffectClass',u,undefined,{owner});
 }
 if(owner==='Red'){
  b.meteors??=[];
  for(let i=0;i<30;i++)for(let k=0;k<3;k++){
   const pos=b.nearest({x:Math.random()*b.width,y:Math.random()*b.height}),delay=i*.2+k*.05;
   b.magicEffect('FireballEffectClass',pos,undefined,{owner,delay});b.meteors.push({owner,x:pos.x,y:pos.y,left:delay+(Timing.FireballEffectClass-2)/30});
  }
 }
 if(owner==='Blue'){
  let kill=true;for(const u of enemies){let killed=0;const count=members(u);for(let i=0;i<count;i++){if(kill){killed++;const f=b.factions[owner];if(Math.random()>.5)f.mana=Math.min(500,f.mana+spec.row.power);else f.gold+=spec.row.power;}kill=!kill;}u.hp=Math.max(0,u.hp-killed*u.stats.hpPerMember);b.magicEffect('GrandTransformationEffectClass',u,undefined,{owner});}
 }
 if(owner==='Purple'){
  // Player balance override: half the eligible field squads, rounded down.
  const choices=enemies.filter(u=>!u.garrisonId&&!u.stats.abilities.Mechanism),count=Math.floor(choices.length/2);for(let i=0;i<count;i++){
   const u=choices.splice(Math.floor(Math.random()*choices.length),1)[0];convert(b,u,owner);
  }
 }
 b.emit(spec.name+'已释放');return null;
}
function tick(b,dt){
 for(const declaration of b.ultimatePending||[]){declaration.left-=dt;if(declaration.left<=0)ultimate(b,declaration.p,declaration.owner,true);}b.ultimatePending=(b.ultimatePending||[]).filter(d=>d.left>0);
 for(const impact of b.magicImpacts||[]){impact.left-=dt;if(impact.left>0)continue;for(const u of b.units)if(u.hp>0&&!u.garrisonId&&u.owner!==impact.owner&&!u.protected&&distance(u,impact)<=impact.row.radius)R.applySlow(u,110,impact.row.time+(impact.bonus[30]||0));b.magicEffect('IceBlastExplosionClass',impact,undefined,{owner:impact.owner});}b.magicImpacts=(b.magicImpacts||[]).filter(m=>m.left>0);
 for(const z of b.zones||[]){const step=Math.min(dt,z.left);if(z.row.id===4){
   z.pulse-=step;while(z.pulse<=0&&z.left>0){z.pulse+=z.cycle;const damage=Math.ceil(z.row.power/2+Math.random()*z.row.power/2);
    for(const u of b.units)if(u.hp>0&&!u.garrisonId&&u.owner!==z.owner&&distance(u,z)<=z.row.radius){u.hp-=damage*members(u);u.lastDamageOwner=z.owner;b.knockBack(u,z);}
    for(const n of b.buildings)if(n.owner!==z.owner&&(!n.ruined||n.captureOwner)&&distance(n,z)**2-50**2<=z.row.radius**2){n.hp-=Math.round(n.maxHp*damage/100);if(n.hp<=0)b.destroy(n);}
    b.magicEffect('StonewormsExplosionEffect',z,undefined,{owner:z.owner});
   }
  }else {z.pulse-=step;let heals=0;while(z.pulse<=0){heals++;z.pulse+=.5;}for(const u of b.units){if(u.hp<=0||u.garrisonId||distance(u,z)>z.row.radius)continue;
   if(u.owner!==z.owner){if(z.row.id===14&&b.bonusFor(z.owner)[45]){u.hp-=z.row.power*heals;u.lastDamageOwner=z.owner;}continue;}
   if([1,14].includes(z.row.id)&&!u.stats.abilities.Mechanism)u.hp=Math.min(u.maxHp,u.hp+z.row.power*heals);
   if(z.row.id===2&&living(u)&&!(u.heroic>0)){u.heroic=10;u.weakened=0;u.moraleMode='heroic';}if(z.row.id===6)u.bloodlust=.55;
   if(z.row.id===10){u.protected=.5;u.frozen=u.poison=u.weakened=u.chilled=0;}
  }}z.left-=dt;
 }b.zones=(b.zones||[]).filter(z=>z.left>0);
 for(const m of b.meteors||[]){m.left-=dt;if(m.left>0)continue;const damage=Math.ceil(4+Math.random()*4);
  for(const u of b.units)if(u.hp>0&&!u.garrisonId&&distance(u,m)<=150){u.hp-=damage*members(u);u.lastDamageOwner=m.owner;}
  for(const n of b.buildings)if((!n.ruined||n.captureOwner)&&distance(n,m)**2-50**2<=150**2){n.hp-=Math.round(n.maxHp*(n.owner===m.owner?Math.floor(damage/2):damage)/100);if(n.hp<=0)b.destroy(n);}
  b.magicEffect('FireBallExplosionClass',m,undefined,{owner:m.owner});b.magicEffect('CraterFromExplosionClass',m,7,{ground:true,static:true,owner:m.owner});
 }b.meteors=(b.meteors||[]).filter(m=>m.left>0);
}
const api={cast,ultimate,tick};if(typeof module!=='undefined')module.exports=api;else root.SpellRuntime=api;
})(typeof window!=='undefined'?window:globalThis);

