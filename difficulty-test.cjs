const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),{Battle}=require('./engine');
const context={window:{}};vm.runInNewContext(fs.readFileSync('game-data.js','utf8'),context);const data=context.window.GAME_DATA;
for(const player of ['Green','Red','Blue','Purple']){
 const times={};
 for(const difficulty of ['easy','normal','hard']){
  const b=new Battle(data.levels.find(l=>l.level===data.campaigns[player][0]),{player,difficulty});let recruited=null,deployed=null;
  for(let t=0;t<18;t+=.05){b.update(.05);const enemy=b.units.filter(u=>u.owner!==player);if(enemy.length&&recruited===null)recruited=b.time;if(enemy.some(u=>!u.garrisonId&&u.order)&&deployed===null)deployed=b.time;for(const owner of Object.keys(b.factions)){assert(b.factions[owner].gold>=0);assert(b.pop(owner)<=b.cap(owner));}}
  assert(recruited!==null&&deployed!==null,`${player} ${difficulty} must recruit and attack`);times[difficulty]={recruited,deployed};
 }
 assert(times.hard.recruited<times.normal.recruited&&times.normal.recruited<times.easy.recruited);
 assert(times.hard.deployed<times.normal.deployed&&times.normal.deployed<times.easy.deployed);
}
console.log('PASS: three difficulty modes change enemy planning pace, all factions pay gold and respect supply caps');
