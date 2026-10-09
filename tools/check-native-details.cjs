'use strict';
const fs=require('fs'),assert=require('assert/strict'),vm=require('vm'),F=require('../native-feedback.js'),{Battle}=require('../engine.js');
const original=JSON.parse(fs.readFileSync('reference/native-status-r15/registration.json'));
const rize=JSON.parse(fs.readFileSync('reference/native-building-rize/registration.json'));original[rize.key]=rize;
for(const [key,pivot]of Object.entries(F.pivots))assert.deepEqual(pivot,original[key].pivot,key);
const soldier={hp:100,stats:{range:0}};
for(const [data,expected]of [[{state:'move'},'moving'],[{state:'attack'},'melee'],[{state:'attack',stats:{range:100}},'ranged'],[{garrisonId:1,state:'garrison'},'defending'],[{garrisonId:1,state:'repair'},'repairing'],[{garrisonId:1,state:'capture'},'repairing'],[{state:'idle'},null],[{state:'attack',frozen:1},null]])assert.equal(F.action({...soldier,...data}),expected);
assert.equal(F.actionFrame('ranged',1,27),26);assert.equal(F.actionFrame('ranged',2.5,27),3);
assert.deepEqual(F.arrowPoint({x:0,y:0,tx:100,ty:0},.5),{x:50,y:-40});
assert.deepEqual(F.arrowPoint({x:0,y:0,tx:100,ty:0,projectileKey:'CatapultMissileClass'},.5),{x:50,y:-40});
for(const projectileKey of ['BulletClass','GunbotBulletClass','GiantbotBulletClass','ZealotBulletClass','AcolytesBulletClass'])assert.deepEqual(F.arrowPoint({x:0,y:0,tx:100,ty:20,projectileKey},.5),{x:50,y:10},projectileKey+' uses the original straight trajectory');
const lines=[],ctx={beginPath(){},moveTo(x,y){lines.push([x,y]);},lineTo(x,y){lines.push([x,y]);},stroke(){}};F.drawArrow(ctx,{x:100,y:0,tx:0,ty:0,max:.28},.5);assert(lines[3][0]<lines[2][0],'A leftward arrow must point along its trajectory');assert.equal(ctx.lineWidth,1);assert.equal(ctx.strokeStyle,'rgba(0,0,0,0.690196)');
const data={grid:Array(60).fill('1'.repeat(80)),roads:{points:[{x:100,y:300},{x:700,y:300}],edges:[[0,1]]},nodes:[{markerClass:'NodeCastleGreenClass',x:100,y:300,locationNum:0},{markerClass:'NodeCastleRedClass',x:700,y:300,locationNum:1}]};
const b=new Battle(data),a=b.spawn(b.buildings[0],'siege'),v=b.spawn(b.buildings[1],'infantry');b.deploy(a);b.deploy(v);Object.assign(a,{x:300,y:300});Object.assign(v,{x:320,y:300});b.beginAttack(a,v,false);a.pendingAttack.left=0;b.finishAttack(a,.01);const blast=b.effects.find(e=>e.fx==='ExplosionClass'),crater=b.effects.find(e=>e.fx==='CraterFromExplosionClass');assert(blast.fullFrames&&blast.max===18/30&&blast.t===.88);assert(crater.static&&crater.ground&&crater.max===7);
const server=require('../multiplayer-server.cjs');try{const packet=server.snapshot({battle:b,players:[]},true);assert.equal(packet.units.find(u=>u.id===a.id).attackFacing,'Right');}finally{server.close();}
const scope={window:{}};vm.runInNewContext(fs.readFileSync('game-data.js','utf8'),scope);for(const key of [...Object.values(F.actions).map(a=>a.key),'ExplosionClass','CraterFromExplosionClass'])assert(scope.window.GAME_DATA.sprites[key]);
console.log('Native action dispatch/origins, arrow direction/curve, 18-frame siege blast, seven-second ground crater and attack-facing transport: passed.');
