/* Extract original unit registration matrices; no new art or game logic. */
'use strict';
const fs=require('fs'),path=require('path');
const folder=path.join(__dirname,'../reference/native-unit-animation-r19');
const animations=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/takeover/data/animations.json'))).animations;
const pivots={},rows=[];
for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
 if(!entry.isDirectory())continue;
 const key=entry.name.match(/^DefineSprite_\d+_(.+)_\1$/)?.[1];
 if(!key||!key.endsWith('SpecialA'))continue;
 const file=path.join(folder,entry.name,'1.svg'),svg=fs.readFileSync(file,'utf8');
 const matrix=svg.match(/<g transform="matrix\(([^)]+)\)"/)[1].split(',').map(Number);
 if(matrix.length!==6||!matrix.every(Number.isFinite))throw Error('Invalid original registration: '+key);
 pivots[key]=matrix.slice(4);
 rows.push({key,charId:animations[key].charId,frames:animations[key].frames,pivot:pivots[key],originalSvg:path.relative(folder,file).replaceAll('\\','/')});
}
const expected=Object.keys(animations).filter(k=>k.endsWith('SpecialA')).length;
if(Object.keys(pivots).length!==expected)throw Error('Missing original SpecialA registrations');
fs.writeFileSync(path.join(folder,'registration.json'),JSON.stringify({scope:'Original SWF unit registration matrices; no generated art or battle simulation',source:'takeover拆解/scratch/surgery/nohit.swf (existing extracted source)',pivots,animations:rows},null,2));
const helper=path.join(__dirname,'../native-unit-animation.js');
if(fs.existsSync(helper)){
 const source=fs.readFileSync(helper,'utf8');
 fs.writeFileSync(helper,source.replace(/\/\*NATIVE_SPECIALA_PIVOTS\*\/[\s\S]*?;\/\*END_NATIVE_SPECIALA_PIVOTS\*\//,'/*NATIVE_SPECIALA_PIVOTS*/'+JSON.stringify(pivots)+';/*END_NATIVE_SPECIALA_PIVOTS*/'));
}
console.log({originalSpecialARegistrations:Object.keys(pivots).length});
