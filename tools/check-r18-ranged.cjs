'use strict';
const assert=require('node:assert/strict'),{Battle}=require('../engine'),Orders=require('../order-runtime');
const data={nativePlayer:'Red',width:1100,height:300,roads:{points:[{x:5,y:105},{x:1095,y:105}],edges:[[0,1]]},nodes:[
 {x:100,y:105,locationNum:1,markerClass:'NodeCastleRedClass'},
 {x:900,y:105,locationNum:2,markerClass:'NodeCastleGreenClass'},
 {x:750,y:105,markerClass:'NodeChestClass'}]};
function pair(owner='Red'){
 const b=new Battle(data,{player:owner,difficulty:'normal'}),home=b.buildings.find(n=>n.owner===owner),other=b.buildings.find(n=>n.owner!==owner);
 const u=b.spawn(home,'archers'),v=b.spawn(other,'infantry');b.deploy(u);b.deploy(v);u.x=400;u.y=105;v.x=422;v.y=105;v.stance='hold';v.attackCd=99;
 b.issue(u,v,v.id);u.attackCd=1;return{b,u,v};
}
let failed=0;function check(name,fn){try{fn();console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.message);}}
check('Both countries bow squads step away from melee contact between shots',()=>{
 for(const owner of ['Red','Green']){const{b,u,v}=pair(owner),x=u.x,range=u.stats.contactRange,version=u.commandVersion||0;Orders.tick(b,u,.1);
  assert(u.x<x,'bow squad should move away instead of standing in melee');assert.equal(u.order.target,v.id);assert.equal(u.commandVersion||0,version);assert.equal(u.stats.contactRange,range);}
});
check('Bow squads already at a useful firing distance stand and shoot',()=>{
 const{b,u,v}=pair();v.x=u.x+u.stats.contactRange*.85;u.attackCd=0;const x=u.x;Orders.tick(b,u,.05);
 assert.equal(u.x,x);assert.equal(u.pendingAttack?.target,v.id);assert.equal(u.state,'attack');
});
check('Repositioning does not cancel a shot already in its windup',()=>{
 const{b,u,v}=pair();b.beginAttack(u,v,false);const attack=u.pendingAttack,x=u.x;Orders.tick(b,u,.01);
 assert.equal(u.pendingAttack,attack);assert.equal(u.x,x);assert.equal(u.order.target,v.id);
});
check('A manual move towards the enemy is blocked by contact rather than overridden by automatic spacing',()=>{
 const{b,u}=pair();b.command([u.id],{x:700,y:105});const x=u.x,version=u.commandVersion;Orders.tick(b,u,.05);
 assert.equal(u.x,x);assert.equal(u.order.x,700);assert.equal(u.commandVersion,version);assert.equal(u.rangedPosition,null);
});
check('A manual treasure destination remains authoritative while the bow counters contact',()=>{
 const{b,u}=pair(),chest=b.chests[0];b.command([u.id],chest,chest.id);const version=u.commandVersion,x=u.x;Orders.tick(b,u,.05);
 assert.equal(u.order.target,chest.id);assert.equal(u.commandVersion,version);assert.equal(u.x,x);
});
check('Automatic spacing ends without oscillating once the safe band is reached',()=>{
 const{b,u,v}=pair();Orders.tick(b,u,.05);assert(u.rangedPosition);v.x=u.x+u.stats.contactRange*.9;const x=u.x;Orders.tick(b,u,.05);
 assert.equal(u.x,x);assert.equal(u.rangedPosition,null);assert.equal(u.order.target,v.id);
});
check('New manual commands clear an old automatic spacing route',()=>{
 const{b,u}=pair();Orders.tick(b,u,.05);assert(u.rangedPosition);b.command([u.id],{x:200,y:105});
 assert.equal(u.rangedPosition,null);assert.equal(u.order.x,200);assert.equal(u.pathTarget,null);
});
check('A road endpoint does not make an archer teleport or freeze its counterattack',()=>{
 const{b,u,v}=pair();u.x=5;v.x=27;u.attackCd=0;Orders.tick(b,u,.05);
 assert.equal(u.x,5);assert.equal(u.pendingAttack?.target,v.id);assert(!u.rangedPosition);
});
check('Spacing cannot march through a second enemy blocking the retreat route',()=>{
 const{b,u,v}=pair(),blocker=b.spawn(b.buildings.find(n=>n.owner!==u.owner),'infantry');b.deploy(blocker);blocker.x=u.x-24;blocker.y=105;
 const x=u.x;Orders.tick(b,u,.05);assert.equal(u.x,x);assert.equal(u.order.target,v.id);
});
check('Two nearly equal threats do not restart all retreat paths every frame',()=>{
 const{b,u,v}=pair(),other=b.spawn(b.buildings.find(n=>n.owner!==u.owner),'infantry');b.deploy(other);v.x=453;other.x=454;other.y=105;
 const path=b.path.bind(b);let queries=0;b.path=(...args)=>{queries++;return path(...args);};
 for(let i=0;i<4;i++){v.x=453+i%2;other.x=454-i%2;b.time=i/30;Orders.tick(b,u,1/30);}
 assert(queries<=3,'a one-pixel nearest-enemy change must not trigger three new routes each frame');assert.equal(u.order.target,v.id);
});
check('Spacing during an assault is not overwritten by the retained castle destination on the next tick',()=>{
 const{b,u}=pair(),castle=b.buildings.find(n=>n.owner!==u.owner);b.issue(u,castle,castle.id);u.attackCd=1;
 Orders.tick(b,u,.05);const x=u.x;assert(u.rangedPosition);b.time=.05;Orders.tick(b,u,.05);
 assert(u.x<x,'the next tick must continue spacing, not march forward over the temporary retreat path');assert.equal(u.order.target,castle.id);
});
check('A bow repositioning on an assault does not count as an explicit disengagement',()=>{
 const{b,u,v}=pair(),castle=b.buildings.find(n=>n.owner!==u.owner);b.issue(u,castle,castle.id);u.attackCd=1;
 Orders.tick(b,u,.05);b.commandFor(v.owner,[v.id],{x:800,y:105});
 assert(Orders.withdrawing(b,v,u));assert(!Orders.withdrawing(b,u,v));assert(!Orders.mutualWithdrawal(b,u,v));assert.equal(u.order.target,castle.id);
});
process.exitCode=failed?1:0;
