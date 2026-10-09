/* Original unit display dispatch only. Combat timings and rules stay in Battle.
 * Source: §_-qG§/§_-xJ§.as 310–353 and UnitAnimNameModifier.as 8–18.
 * SpecialA pivots are read from the original exported SVG origin matrix.
 */
(function(root){'use strict';
const UnitArt=typeof module!=='undefined'?require('./unit-art.js'):root.UnitArt;
const UnitRules=typeof module!=='undefined'?require('./unit-rules.js'):root.UnitRules;
const pivots=/*NATIVE_SPECIALA_PIVOTS*/{"BlueMagic2RightSpecialA":[28.85,32.7],"PurpleArchersUpSpecialA":[15.55,18.8],"RedMagicLeftSpecialA":[14.45,20.8],"RedCavalryUpSpecialA":[26.05,42.1],"GreenMagicRightSpecialA":[31.45,42.8],"BlueMagic2LeftSpecialA":[20.4,29.05],"GreenInfantry3UpSpecialA":[20.55,24.45],"RedCavalry2UpSpecialA":[26.7,40.8],"BlueArchersDownSpecialA":[13.45,27.95],"RedArchers2UpSpecialA":[12.85,20.1],"PurpleMagic2LeftSpecialA":[15.05,22.6],"RedCavalryRightSpecialA":[23.55,42.1],"GreenMagic2LeftSpecialA":[40.35,48.15],"PurpleArchers2RightSpecialA":[8.8,17.9],"BlueArchers2RightSpecialA":[16.8,31.2],"GreenArchers2RightSpecialA":[10.2,26.15],"BlueMagicLeftSpecialA":[19.75,28.45],"RedArchers2RightSpecialA":[9,20.1],"PurpleMagicLeftSpecialA":[16.05,20.85],"RedArchers2DownSpecialA":[9.55,20.1],"PurpleMagic2DownSpecialA":[16,22.6],"RedArchersLeftSpecialA":[13.3,18.05],"GreenArchersDownSpecialA":[8.55,17.75],"GreenArchersRightSpecialA":[8.8,18.3],"GreenInfantry3RightSpecialA":[12.3,24.45],"PurpleArchers2LeftSpecialA":[13.05,17.75],"GreenMagic2UpSpecialA":[39.85,48.6],"BlueArchersLeftSpecialA":[16.95,28.35],"RedArchers2LeftSpecialA":[12.1,20.1],"RedCavalry2LeftSpecialA":[28,38.95],"BlueArchers3RightSpecialA":[20.35,48.4],"PurpleArchersRightSpecialA":[9.4,18.8],"GreenMagicLeftSpecialA":[27.55,44],"BlueArchers3LeftSpecialA":[27.7,35.45],"RedMagicUpSpecialA":[14.25,24.55],"PurpleArchersDownSpecialA":[8.8,18.2],"GreenInfantry3LeftSpecialA":[19.15,24.2],"BlueMagicRightSpecialA":[15.1,29.4],"GreenArchersLeftSpecialA":[12.1,18.4],"BlueArchersRightSpecialA":[14.1,26.65],"GreenArchersUpSpecialA":[12.4,18.5],"RedCavalryDownSpecialA":[26,38.95],"PurpleMagicUpSpecialA":[14.7,24.7],"GreenArchers2UpSpecialA":[13.5,26.15],"PurpleMagic2UpSpecialA":[15.05,30.35],"GreenMagic2DownSpecialA":[26.75,48.15],"BlueArchers2DownSpecialA":[11.75,25.5],"RedArchersDownSpecialA":[8.55,18.05],"RedCavalry2DownSpecialA":[28.2,38.95],"GreenMagicUpSpecialA":[23.25,42.8],"GreenMagicDownSpecialA":[13,44],"RedArchersRightSpecialA":[8.9,18.35],"PurpleArchersLeftSpecialA":[16.15,18.85],"GreenArchers2LeftSpecialA":[13.2,21.7],"RedArchersUpSpecialA":[12.75,18.35],"GreenMagic2RightSpecialA":[31.05,48.6],"GreenArchers2DownSpecialA":[10.65,21.7],"RedCavalryLeftSpecialA":[28,38.95],"PurpleMagicRightSpecialA":[11.9,24.7],"RedMagicDownSpecialA":[12.2,20.85],"GreenInfantry3DownSpecialA":[11,24.4],"BlueArchers2LeftSpecialA":[20.65,25.45],"BlueArchers2UpSpecialA":[20.75,31.2],"PurpleMagicDownSpecialA":[12.2,20.85],"BlueMagicDownSpecialA":[12.7,28.45],"BlueMagicUpSpecialA":[20.35,29.4],"BlueArchers3UpSpecialA":[38.1,48.4],"RedMagicRightSpecialA":[11.75,24.55],"BlueArchersUpSpecialA":[14.1,26.65],"BlueArchers3DownSpecialA":[30.25,35.45],"RedCavalry2RightSpecialA":[23.2,40.8],"PurpleArchers2UpSpecialA":[13.35,17.9],"PurpleMagic2RightSpecialA":[15.5,30.35],"BlueMagic2UpSpecialA":[9.85,32.95],"BlueMagic2DownSpecialA":[7.85,29.05],"PurpleArchers2DownSpecialA":[8.5,17.75]};/*END_NATIVE_SPECIALA_PIVOTS*/
const directions=['Down','Right','Left','Up'],battlePoses=new WeakMap();
const prefix=u=>UnitArt.prefix(u.record),facing=u=>directions.includes(u.facing)?u.facing:'Down';
function attackPhase(u,ranged){
 const direction=directions.includes(u.attackFacing)?u.attackFacing:facing(u);
 if(ranged||!pivots[prefix(u)+direction+'SpecialA'])return 2;
 if(u.stats?.range>0)return 3;
 // The original picks either melee motion with equal probability. A stable
 // per-shot parity supplies visual variation without touching combat RNG.
 let seed=0;for(const c of String(u.id))seed=(seed+c.charCodeAt(0))|0;
 return (seed+(u.attackVisualSerial||0))%2?3:2;
}
function keys(u,sprites){
 const out=[];for(const direction of directions)for(const suffix of ['_Go','_Attack','_Die','SpecialA']){
  const key=prefix(u)+direction+suffix;
  if(sprites[key]&&(suffix!=='SpecialA'||pivots[key]))out.push(key);
 }return out;
}
function pose(battle,u,time,sprites){
 let memory=battlePoses.get(battle);if(!memory){memory=new Map();battlePoses.set(battle,memory);}
 const before=memory.get(u.id);
 if(u.frozen>0&&before)return {...before};
 let action='Stand',direction=facing(u),frame=0,walking=false;
 if(!(u.frozen>0)&&u.state==='attack'){
  direction=directions.includes(u.attackFacing)?u.attackFacing:direction;
  const phase=u.attackVisualPhase===2||u.attackVisualPhase===3?u.attackVisualPhase:attackPhase(u,u.attackIsRanged??(u.stats?.range>0));
  const special=prefix(u)+direction+'SpecialA';
  action=phase===3&&pivots[special]&&sprites[special]?'SpecialA':'Attack';
  const key=prefix(u)+direction+(action==='SpecialA'?'SpecialA':'_Attack'),count=Math.max(1,sprites[key]?.frames||1);
  const duration=Math.max(1/30,u.attackDuration||u.stats?.attackInterval||1);
  frame=Math.min(count-1,Math.max(0,(time-(u.lastAttack??time))/duration*count));
 }else if(!(u.frozen>0)&&u.state==='move'){
  action='Go';walking=true;frame=UnitRules.walkFrame(u.walkDistance||0,u.record);
 }
 const next={action,facing:direction,frame,walking};
 memory.delete(u.id);memory.set(u.id,next);
 // The cache survives network unit-object replacement, but never grows with
 // every dead unit in a long match. Whole battles release through WeakMap.
 while(memory.size>1024)memory.delete(memory.keys().next().value);
 return {...next};
}
const api={attackPhase,keys,pose,pivots};
if(typeof module!=='undefined')module.exports=api;else root.NativeUnitAnimation=api;
})(typeof window!=='undefined'?window:globalThis);
