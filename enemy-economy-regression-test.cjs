const assert=require('node:assert/strict'),{Battle,BUILD}=require('./engine'),AI=require('./enemy-ai'),P=require('./progression');
const map={nativePlayer:'Green',grid:Array(60).fill('1'.repeat(80)),roads:{points:[{x:100,y:300},{x:650,y:300}],edges:[[0,1]]},nodes:[
 {markerClass:'NodeCastleGreenClass',x:100,y:300,locationNum:0},{markerClass:'NodeCastlePurpleClass',x:650,y:300,locationNum:1},
 ...[620,680,710].map(x=>({markerClass:'NodeBuildHereClass',x,y:330,locationNum:1}))
]};
function fresh(){const b=new Battle(structuredClone(map));b.factionBonuses.Purple=P.bonuses('Purple',P.initial('Purple'));return b;}
const tests={
 affordable_reinforcements(){const b=fresh(),home=b.owned('Purple')[0];b.slots=[];b.spawn(home,'infantry');b.factions.Purple.gold=b.recruitCost('infantry','Purple');b.time=10;AI.run(b);assert.equal(b.pop('Purple'),2,'AI must recruit affordable infantry while the preferred archer is too expensive');assert.equal(b.factions.Purple.gold,0,'Replacement spends the same price as player recruitment');},
 paid_economy_and_replacement(){
  const b=fresh(),owner='Purple',f=b.factions[owner],actions=[];let earned=0,spent=0;
  assert.equal(typeof b.buildFor,'function','Enemy construction must share the player action');
  const build=b.buildFor.bind(b),queue=b.queue.bind(b),cast=b.cast.bind(b);
  b.buildFor=(o,id,t)=>{const before=f.gold,result=build(o,id,t);if(o===owner&&result===null){spent+=before-f.gold;actions.push({kind:t,time:b.time});assert.equal(before-f.gold,BUILD[t].cost);}return result;};
  b.queue=(base,t)=>{const before=f.gold,result=queue(base,t);if(base.owner===owner&&result===null){spent+=before-f.gold;actions.push({kind:'recruit',time:b.time});}return result;};
  b.cast=(t,p,o)=>{const before=f.mana,result=cast(t,p,o);if(o===owner&&result===null){assert(f.mana<=before);actions.push({kind:'spell',time:b.time});}return result;};
  // Isolate the economy from conquest: income uses real buildings and actions,
  // field losses periodically free supply without granting any resources.
  b.issue=()=>{};
  for(let second=0;second<600;second++){
   const rates=b.rates(owner);earned+=rates.gold;
   if(second&&second%80===0)b.units=b.units.filter(u=>u.owner!==owner);
   b.update(1);
  }
  for(const kind of ['mine','farm','obelisk'])assert(actions.some(a=>a.kind===kind),'CPU must invest in '+kind+' instead of spending every site on farms');
  const recruits=actions.filter(a=>a.kind==='recruit');assert(recruits.length>=10,'Income must sustain repeated recruitment');
  for(let second=80;second<600;second+=80)assert(recruits.some(a=>a.time>=second&&a.time<second+60),'CPU must replenish the losses at '+second+' seconds');
  assert(Math.abs(f.gold-(300+earned-spent))<1e-7,'AI has no bonus gold or free buildings');
 },
 chest_and_ogre_orders(){const b=fresh(),home=b.owned('Purple')[0];b.slots=[];b.factions.Purple.gold=0;const troops=[b.spawn(home,'infantry'),b.spawn(home,'infantry')];b.chests=[{id:b.nextId++,x:575,y:300,collected:false}];b.time=10;AI.run(b);assert.equal(troops.filter(u=>u.order?.target===b.chests[0].id).length,1,'One scout collects an unguarded chest');
  const fight=fresh(),fort=fight.owned('Purple')[0];fight.slots=[];fight.factions.Purple.gold=0;const squad=[fight.spawn(fort,'infantry'),fight.spawn(fort,'infantry')],ogre=fight.spawnOgre({x:550,y:300});ogre.hp=250;fight.time=10;AI.run(fight);assert(squad.every(u=>u.order?.target===ogre.id),'A sufficient pair attacks the nearby ogre together');assert.equal(fight.factions.Purple.gold,0,'Planning an ogre attack does not mint its reward');},
 enemy_spell(){const b=fresh(),home=b.owned('Purple')[0],enemy=b.spawn(b.owned('Green')[0],'infantry');b.factionBonuses.Purple[46]=1;b.slots=[];b.factions.Purple.gold=0;b.factions.Purple.mana=500;enemy.x=500;enemy.y=300;enemy.garrisonId=null;const casts=[],original=b.cast.bind(b);b.cast=(type,p,owner)=>{const result=original(type,p,owner);if(result===null)casts.push({type,owner});return result;};b.time=10;AI.run(b);assert(casts.some(c=>c.owner==='Purple'),'Enemy must cast available paid spells on hostile squads');assert(b.factions.Purple.mana<500);assert.equal(b.factions.Green.mana,70,'Enemy casting cannot spend player mana');},
 liberation_at_full_health(){const data=structuredClone(map);data.nodes[1].markerClass='NodeCastleBlueClass';const b=new Battle(data),ally=b.spawn(b.owned('Blue')[0],'infantry'),casts=[];b.slots=[];b.factions.Blue.gold=0;ally.garrisonId=null;ally.poison=5;b.spellState=(t)=>({ready:t==='summon',locked:false,affordable:true});b.spellSpec=()=>({mode:'heal',row:{id:10,radius:75}});b.cast=(t,p,o)=>{casts.push({t,p,o});return null;};b.time=10;AI.run(b);assert(casts.some(c=>c.t==='summon'&&c.o==='Blue'),'Liberation cleanses negative effects even at full HP');},
 stoneworms_against_castle(){const data=structuredClone(map);data.nodes[1].markerClass='NodeCastleRedClass';const b=new Battle(data),enemy=b.owned('Green')[0],casts=[];b.slots=[];b.factions.Red.gold=0;b.spawn(b.owned('Red')[0],'infantry');b.spellState=t=>({ready:t==='fire',locked:false,affordable:true});b.spellSpec=()=>({mode:'damage',row:{id:4,radius:75}});b.cast=(t,p,o)=>{casts.push({t,p,o});return null;};b.time=10;AI.run(b);assert(casts.some(c=>c.t==='fire'&&c.o==='Red'&&c.p.id===enemy.id),'Stoneworms can target an enemy castle without a field squad');}
};
const selected=process.argv[2];for(const [name,test] of Object.entries(tests))if(!selected||selected===name){test();console.log('PASS:',name);}
