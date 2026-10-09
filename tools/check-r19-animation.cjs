/* Small original-display dispatch fixtures; no Battle/AI simulation. */
'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const A=require('../native-unit-animation.js'),P=require('../progression.js');
const sprites=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/takeover/animation/anim_manifest.json'))).sheets.map(s=>[s.key,s]));
const original=JSON.parse(fs.readFileSync(path.join(__dirname,'../reference/native-unit-animation-r19/registration.json')));
const U=require('../unit-art.js'),oldPivots=require('../unit-pivots.js');
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS '+name);};
const unit=(color,type,tech=1)=>({id:'u1',record:P.unit(color,type,tech),facing:'Down',stats:{range:['Archers','Magic','Siege'].includes(type)?110:0,attackInterval:1},state:'idle',walkDistance:12});
check('all 76 SpecialA registrations come from original SVG matrices',()=>{
 assert.equal(Object.keys(A.pivots).length,76);assert.deepEqual(A.pivots,original.pivots);
 for(const row of original.animations){assert(sprites[row.key]);assert.deepEqual(A.pivots[row.key],row.pivot);assert.equal(sprites[row.key].frames,row.frames);}
});
check('native idle is this faction and direction Die frame zero',()=>{
 for(const color of ['Green','Red','Blue','Purple'])for(const direction of ['Down','Right','Left','Up']){
  const u=unit(color,'Infantry');u.facing=direction;const p=A.pose({},u,10,sprites);
  assert.equal(p.action,'Stand');assert.equal(p.facing,direction);assert.equal(p.frame,0);assert.equal(p.walking,false);
  assert(oldPivots[U.prefix(u.record)+direction+'_Die']);
 }
});
check('distance attacks always use Attack, even if SpecialA exists',()=>{
 for(const color of ['Green','Red','Blue','Purple'])for(const tech of [1,2]){
  const u=unit(color,'Archers',tech);assert.equal(A.attackPhase(u,true),2);
  Object.assign(u,{state:'attack',attackIsRanged:true,lastAttack:0,attackDuration:1});assert.equal(A.pose({},u,.3,sprites).action,'Attack');
 }
});
check('ranged units use only their confirmed SpecialA in melee',()=>{
 for(const [color,type,tech] of [['Blue','Archers',2],['Purple','Magic',1],['Red','Archers',1],['Green','Archers',2]]){
  const u=unit(color,type,tech);assert.equal(A.attackPhase(u,false),3);
  Object.assign(u,{state:'attack',attackIsRanged:false,attackVisualPhase:3,lastAttack:0,attackDuration:1});const p=A.pose({},u,.3,sprites);
  assert.equal(p.action,'SpecialA');assert(A.pivots[U.prefix(u.record)+p.facing+'SpecialA']);
 }
});
check('double melee motion is stable for a shot and varies between shots',()=>{
 const u=unit('Green','Infantry',3);const seq=[];
 for(let n=1;n<=4;n++){u.attackVisualSerial=n;const first=A.attackPhase(u,false);for(let i=0;i<20;i++)assert.equal(A.attackPhase(u,false),first);seq.push(first);}
 assert.deepEqual(new Set(seq),new Set([2,3]));assert.equal(A.attackPhase(unit('Green','Infantry',1),false),2);
});
check('display actions consume no combat random draws',()=>{
 const prior=Math.random;Math.random=()=>{throw Error('Display touched combat RNG');};
 try{const u=unit('Green','Infantry',3);u.state='attack';u.attackIsRanged=false;A.attackPhase(u,false);A.pose({},u,.1,sprites);A.keys(u,sprites);}finally{Math.random=prior;}
});
check('attack frame uses existing duration and does not mutate units',()=>{
 const u=unit('Blue','Archers',2);Object.assign(u,{state:'attack',attackFacing:'Left',attackVisualPhase:3,attackIsRanged:false,lastAttack:2,attackDuration:.75});
 const before=JSON.stringify(u),p=A.pose({},u,2.375,sprites);assert.equal(p.action,'SpecialA');assert.equal(p.frame,15);assert.equal(p.facing,'Left');assert.equal(JSON.stringify(u),before);
 assert.equal(A.pose({},u,100,sprites).frame,29);
});
check('walking is distance based and idle has no member walking offset',()=>{
 const u=unit('Purple','Infantry');u.state='move';const p=A.pose({},u,1,sprites);assert.equal(p.action,'Go');assert(p.walking);assert(p.frame>0);
 u.state='idle';const idle=A.pose({},u,2,sprites);assert.equal(idle.action,'Stand');assert(!idle.walking);assert.equal(idle.frame,0);
});
check('freeze holds displayed pose across network object replacement',()=>{
 const battle={},u=unit('Blue','Archers',2);Object.assign(u,{state:'attack',attackFacing:'Right',attackIsRanged:false,attackVisualPhase:3,lastAttack:0,attackDuration:1});
 const before=A.pose(battle,u,.25,sprites),snapshot={...u,state:'idle',facing:'Up',frozen:3};assert.deepEqual(A.pose(battle,snapshot,1,sprites),before);
 snapshot.frozen=0;assert.equal(A.pose(battle,snapshot,1,sprites).action,'Stand');
});
check('same unit id in a new battle cannot retain an old frozen pose',()=>{
 const u=unit('Red','Archers');u.state='move';A.pose({},u,1,sprites);u.frozen=2;const p=A.pose({},u,1,sprites);assert.equal(p.action,'Stand');assert.equal(p.frame,0);
});
check('per-record warm list never blindly loads SpecialB or other factions',()=>{
 const u=unit('Blue','Archers',2),keys=A.keys(u,sprites);assert.equal(keys.length,16);assert(keys.every(k=>k.startsWith('BlueArchers2')));assert(!keys.some(k=>/Special[B-E]/.test(k)));
 assert.equal(A.keys(unit('Green','Infantry'),sprites).length,12);
});
check('missing second attack metadata safely falls back to Attack',()=>{
 const u=unit('Purple','Magic');Object.assign(u,{state:'attack',attackVisualPhase:3,attackIsRanged:false,lastAttack:0});const m={...sprites};delete m.PurpleMagicDownSpecialA;assert.equal(A.pose({},u,.1,m).action,'Attack');
});
new vm.Script(fs.readFileSync(path.join(__dirname,'../native-unit-animation.js'),'utf8'));
console.log({checks,scope:'Original art metadata and isolated display dispatch; no battle or browser gameplay'});
if(process.argv.includes('--contact-sheet'))(async()=>{
 const C=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
 const font='C:/Windows/Fonts/msyh.ttc';if(fs.existsSync(font))C.GlobalFonts.registerFromPath(font,'AuditChinese');
 const canvas=C.createCanvas(1080,850),ctx=canvas.getContext('2d'),images=new Map();ctx.fillStyle='#3e443d';ctx.fillRect(0,0,1080,850);ctx.fillStyle='#fff';ctx.font='16px AuditChinese';ctx.fillText('原素材离线取帧：原注册点、待命首帧与第二近身攻击；不是生成图或实玩截图',20,28);
 async function draw(key,x,y,frame){const m=sprites[key],p=A.pivots[key]||oldPivots[key];assert(p,key);if(!images.has(key))images.set(key,await C.loadImage(path.join(__dirname,'../assets/takeover/animation',m.sheet)));const image=images.get(key);ctx.drawImage(image,frame%m.cols*m.fw,Math.floor(frame/m.cols)*m.fh,m.fw,m.fh,x-p[0]*2,y-p[1]*2,m.fw*2,m.fh*2);}
 for(const [i,color]of ['Green','Red','Blue','Purple'].entries()){const x=90+i*270,y=130;await draw(color+'InfantryDown_Die',x,y,0);ctx.fillText(color+' 待命：Die 帧 0',x-66,160);}
 const rows=[['BlueArchers2Down_Attack','BlueArchers2DownSpecialA'],['GreenInfantry3Down_Attack','GreenInfantry3DownSpecialA'],['RedCavalryDown_Attack','RedCavalryDownSpecialA'],['PurpleMagicDown_Attack','PurpleMagicDownSpecialA']];
 for(const [row,keys]of rows.entries()){const y=285+row*175;for(const [column,key]of keys.entries()){const m=sprites[key];ctx.fillText(key+' · '+m.frames+' 原帧',column*530+20,y-76);for(let i=0;i<4;i++){const frame=Math.floor(i*(m.frames-1)/3),x=column*530+75+i*125;await draw(key,x,y,frame);ctx.fillText('帧 '+frame,x-22,y+34);}}}
 fs.writeFileSync(path.join(__dirname,'../reference/native-unit-animation-r19/native-poses.png'),canvas.toBuffer('image/png'));console.log({offlineContactSheet:'reference/native-unit-animation-r19/native-poses.png'});
})().catch(e=>{console.error(e);process.exitCode=1;});
