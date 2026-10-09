/* A resolved hit only: no AI turns or campaign simulation. */
'use strict';
const assert=require('assert/strict'),{Battle}=require('../engine.js'),P=require('../progression.js'),R=require('../unit-rules.js');
function unit(id,owner,x){const record=P.unit(owner,'Infantry',1),stats=R.stats(record,'infantry');return{id,owner,record,stats,type:'infantry',bonus:{},hp:stats.hp,maxHp:stats.hp,x,y:0,commandVersion:0,moraleValue:500,moraleBase:500,moraleMode:'normal'};}
function hit({miss=false,building=false}={}){const a=unit(1,'Green',0),v=unit(2,'Red',miss?1000:10),b=Object.create(Battle.prototype);Object.assign(b,{time:0,units:building?[a]:[a,v],buildings:building?[{...v,type:'Castle',queue:[]}]:[],effects:[]});b.defend=()=>{};a.pendingAttack={target:2,isBuilding:building,left:0,commandVersion:0};b.finishAttack(a,.01);return{a,v,b};}
assert.equal(hit().a.moraleValue,550,'A successful squad attack must recover the missing native +50 morale event');
assert.equal(hit({miss:true}).a.moraleValue,500,'An invalid delayed hit must not farm morale');
assert.equal(hit({building:true}).a.moraleValue,500,'Castle damage does not emit the native member attack event');
const M=require('../morale-runtime.js'),fs=require('fs'),vm=require('vm');
for(const [value,status]of [[0,'low'],[349,'low'],[350,'normal'],[650,'normal'],[651,'high'],[1000,'high']])assert.equal(M.status({...unit(3,'Green',0),moraleValue:value}),status);
const hero={...unit(3,'Green',0),moraleValue:990};assert.equal(M.onAttack(hero),10);R.tickMorale(hero,0);assert.equal(M.status(hero),'heroic');assert.equal(hero.heroic,10);
const fearful={...unit(4,'Green',0),moraleValue:0,order:{x:20,y:30}};R.tickMorale(fearful,0);assert.equal(M.status(fearful),'fear');assert.equal(fearful.weakened,10);assert.deepEqual(fearful.order,{x:20,y:30},'Fear must not rewrite a command');
fearful.weakened=0;R.tickMorale(fearful,0);assert.equal(fearful.moraleValue,200);hero.heroic=0;R.tickMorale(hero,0);assert.equal(hero.moraleValue,800);
for(const kind of ['Undead','Mechanism']){const u={...unit(3,'Green',0),stats:{abilities:{[kind]:true}}};assert.equal(M.onAttack(u),0);assert.equal(u.moraleValue,500);assert.equal(M.status(u),'immune');}
const disciplined={...unit(5,'Green',0),moraleValue:0,stats:{abilities:{Discipline:true}}};R.tickMorale(disciplined,0);assert.equal(disciplined.weakened,undefined);assert.equal(M.status(disciplined),'low');
for(const mode of ['high','low','heroic','fear']){assert.equal(M.frame(mode,0,20),0);assert.equal(M.frame(mode,.3,20),9);}
const scope={window:{}};vm.runInNewContext(fs.readFileSync('game-data.js','utf8'),scope);const battle=new Battle(scope.window.GAME_DATA.levels.find(l=>l.level===7),{player:'Green',humanOwners:['Green','Red','Blue','Purple']});
const u=battle.spawn(battle.owned('Green')[0],'infantry');Object.assign(u,{moraleValue:75,moraleBase:500,moraleMode:'fear',heroic:0,weakened:9.5,protected:0});
const server=require('../multiplayer-server.cjs');try{const packet=server.snapshot({battle,players:[]},true),got=packet.units.find(v=>v.id===u.id);for(const field of ['moraleValue','moraleBase','moraleMode','heroic','weakened','protected'])assert.equal(got[field],u[field],'Server drops '+field);}finally{server.close();}
for(const key of M.keys)assert(scope.window.GAME_DATA.sprites[key]);
assert.deepEqual(M.pivots,JSON.parse(fs.readFileSync('reference/native-morale/registration.json')));
console.log('Resolved attacks, original thresholds/timers/immunity, unchanged orders, native pivots and server morale fields: passed.');
