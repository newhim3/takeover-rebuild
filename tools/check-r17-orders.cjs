'use strict';
const assert=require('node:assert/strict'),{Battle}=require('../engine'),Orders=require('../order-runtime');
const data={nativePlayer:'Red',width:1100,height:300,grid:Array(30).fill('1'.repeat(110)),nodes:[
 {x:100,y:105,locationNum:1,markerClass:'NodeCastleRedClass'},
 {x:700,y:105,locationNum:2,markerClass:'NodeCastleGreenClass'}]};
function battle(){return new Battle(data,{player:'Red',difficulty:'normal',mission:0});}
let failed=0;function check(name,fn){try{fn();console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.message);}}
check('Group ground order preserves the clicked destination for every squad',()=>{
 const b=battle(),home=b.buildings[0],troops=Array.from({length:5},()=>b.spawn(home,'infantry')),p={x:950,y:105};
 b.command(troops.map(u=>u.id),p);for(const u of troops)assert.deepEqual({x:u.order.x,y:u.order.y},p);
});
check('An empty route away from the destination retains the latest manual order',()=>{
 const b=battle(),u=b.spawn(b.buildings[0],'infantry');b.command([u.id],{x:450,y:105});
 const version=u.commandVersion;b.path=()=>[];u.path=[];Orders.tick(b,u,.05);
 assert(u.order,'route temporarily unavailable must not delete the order');assert.equal(u.commandVersion,version);
});
check('A retained order resumes when a previously empty route becomes available',()=>{
 const b=battle(),u=b.spawn(b.buildings[0],'infantry');b.command([u.id],{x:450,y:105});const path=b.path.bind(b);b.path=()=>[];u.path=[];
 Orders.tick(b,u,.05);const before=u.x;b.path=path;b.time=.5;Orders.tick(b,u,.05);assert(u.x>before);assert.equal(u.order.x,450);
});
check('A later manual command replaces the old destination after a pause interval',()=>{
 const b=battle(),u=b.spawn(b.buildings[0],'infantry'),{FixedClock}=require('../simulation-clock'),clock=new FixedClock();
 b.command([u.id],{x:950,y:105});const first=u.commandVersion,x=u.x;
 clock.advance(2,0,dt=>Orders.tick(b,u,dt));assert.equal(u.x,x);assert.equal(u.commandVersion,first);
 b.command([u.id],{x:450,y:105});clock.advance(.1,1,dt=>{b.time+=dt;Orders.tick(b,u,dt);});
 assert.equal(u.commandVersion,first+1);assert.equal(u.order.x,450);assert(u.x>x);
});
check('A passing enemy outside the gate does not trigger an exit/reentry cycle',()=>{
 const b=battle(),home=b.buildings[1],guard=b.spawn(home,'infantry'),passer=b.spawn(b.buildings[0],'infantry');
 b.deploy(passer);passer.x=home.x+145;passer.y=home.y;b.command([passer.id],{x:1000,y:105});
 assert.equal(b.defendingThreat(home),null);Orders.tick(b,guard,.05);assert.equal(guard.garrisonId,home.id);
 b.time=9;b.factions.Green.gold=0;require('../enemy-ai').plan(b,'Green');assert.equal(guard.garrisonId,home.id);
});
check('Siege orders within weapon range still trigger immediate castle defense',()=>{
 const b=battle(),home=b.buildings[1],guard=b.spawn(home,'infantry'),siege=b.spawn(b.buildings[0],'siege');
 b.deploy(siege);siege.x=home.x+siege.stats.contactRange+25; siege.y=home.y;b.issue(siege,home,home.id);
 assert.equal(b.defendingThreat(home)?.id,siege.id);Orders.tick(b,guard,.05);assert.equal(guard.garrisonId,null);assert.equal(guard.defendHome,home.id);
});
check('Mutual withdrawal near a castle does not call out more defenders through stale contact',()=>{
 const b=battle(),home=b.buildings[1],defender=b.spawn(home,'infantry'),enemy=b.spawn(b.buildings[0],'infantry');
 b.deploy(defender);defender.x=720;defender.y=105;b.issue(defender,home,home.id,{forceMove:true});defender.defendHome=home.id;
 b.deploy(enemy);enemy.x=760;enemy.y=105;b.command([enemy.id],{x:1000,y:105});enemy.combatTarget=defender.id;
 assert(Orders.mutualWithdrawal(b,enemy,defender));assert.equal(b.defendingThreat(home),null);
});
process.exitCode=failed?1:0;
