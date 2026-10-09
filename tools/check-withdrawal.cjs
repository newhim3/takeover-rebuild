/* Short resolved-order fixtures, with no strategic AI turns. */
'use strict';
const assert=require('assert/strict'),{Battle}=require('../engine.js'),Orders=require('../order-runtime.js');
const data={grid:Array(60).fill('1'.repeat(80)),roads:{points:[{x:100,y:300},{x:700,y:300}],edges:[[0,1]]},nodes:[{markerClass:'NodeCastleGreenClass',x:100,y:300,locationNum:0},{markerClass:'NodeCastleRedClass',x:700,y:300,locationNum:1}]};
function pair(){const b=new Battle(data),a=b.spawn(b.buildings[0],'infantry'),v=b.spawn(b.buildings[1],'infantry');b.deploy(a);b.deploy(v);Object.assign(a,{x:300,y:300,moveVelocity:50});Object.assign(v,{x:320,y:300,moveVelocity:50});return{b,a,v};}
function manual(b,u,x){b.commandFor(u.owner,[u.id],{x,y:300});}
{
 const {b,a,v}=pair();manual(b,a,100);manual(b,v,700);const goals=[a.order.x,v.order.x];Orders.tick(b,a,.05);Orders.tick(b,v,.05);
 assert(!a.pendingAttack&&!v.pendingAttack,'Both withdrawing squads must stop fighting instead of restarting counterattacks');assert(a.x<300&&v.x>320);assert.deepEqual([a.order.x,v.order.x],goals);
}
{
 const {b,a,v}=pair();manual(b,a,100);b.issue(v,a,a.id);Orders.tick(b,a,.05);Orders.tick(b,v,.05);
 assert(a.x<300&&a.pendingAttack,'One withdrawing squad must move away while counterattacking an opponent who wants to fight');assert(v.pendingAttack);assert.equal(a.order.x,100);assert.equal(a.attackFacing,'Right');assert.equal(a.facing,'Left','Walking and attack poses must retain distinct facing during withdrawal');
}
{
 const {b,a,v}=pair();b.issue(a,b.buildings[0],b.buildings[0].id,{forceMove:true,avoidCombat:true});b.issue(v,a,a.id);Orders.tick(b,a,.05);
 assert(a.x<300&&a.pendingAttack,'An AI recovery order must use the same fighting withdrawal as a player order');assert.equal(a.order.target,b.buildings[0].id);
}
{
 const {b,a,v}=pair();manual(b,a,100);manual(b,v,700);a.pendingAttack={target:v.id,isBuilding:false,left:0,commandVersion:a.commandVersion};const hp=v.hp;Orders.tick(b,a,.05);
 assert.equal(v.hp,hp,'The old delayed attack must be cancelled before it hits a mutually withdrawing opponent');assert.equal(a.pendingAttack,null);
}
{
 const {b,a,v}=pair();manual(b,a,600);b.issue(v,a,a.id);Orders.tick(b,a,.05);assert.equal(a.x,300,'A forward order cannot pass through an enemy');assert(a.pendingAttack);
}
{
 const {b,a,v}=pair();b.buildings[0].x=700;b.issue(a,b.buildings[0],b.buildings[0].id,{forceMove:true,avoidCombat:true});b.issue(v,a,a.id);Orders.tick(b,a,.05);assert.equal(a.x,300,'A real recovery route cannot bypass an opponent blocking the road');assert(a.pendingAttack);
}
{
 const {b,a,v}=pair();manual(b,a,100);manual(b,v,700);const third=b.spawn(b.buildings[1],'infantry');b.deploy(third);Object.assign(third,{x:315,y:295});b.issue(third,a,a.id);Orders.tick(b,a,.05);assert.equal(a.pendingAttack?.target,third.id,'Mutual withdrawal must not ignore a third attacker');assert.equal(a.order.x,100);
}
{
 const {b,a,v}=pair();manual(b,a,100);manual(b,v,700);Object.assign(a,{combatTarget:v.id,attackTarget:v.id,pursuit:{x:300,y:300}});Orders.tick(b,a,.05);assert.equal(a.combatTarget,null);assert.equal(a.attackTarget,null);assert.equal(a.pursuit,null);assert.equal(a.order.x,100);
}
{
 const {b,a,v}=pair();manual(b,a,100);v.x=332;a.stats={...a.stats,abilities:{...a.stats.abilities,HorrificDash:true}};b.issue(v,a,a.id);Orders.tick(b,a,.05);assert(!a.horrificDashUntil,'An engagement dash cannot become a backwards withdrawal speed boost');assert(a.pendingAttack);
}
console.log('Mutual withdrawal, one-sided fighting retreat, AI recovery, delayed-hit cancellation and frontal contact: passed.');
