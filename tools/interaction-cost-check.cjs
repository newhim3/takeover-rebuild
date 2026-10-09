'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),source=fs.readFileSync(__dirname+'/../game.js','utf8');
let labels=0,paths=0,now=0;
const buildings=[{id:1,x:150,y:250},{id:2,x:500,y:300}],units=Array.from({length:36},(_,i)=>({id:i+1,garrisonId:i<18?1:2,x:0,y:0}));
const scope={Map,Math,performance:{now:()=>now},BuildingUILayout:{label(b){labels++;return{y:b.y-100};}},BuildingPivots:{},GAME_DATA:{sprites:{}},battle:{time:1,units,buildings,path(){paths++;return[{x:300,y:300}];}},drag:{},dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),from:{id:1,x:150,y:250},target:{x:300,y:300}};
vm.createContext(scope);vm.runInContext('let badgeLayoutCache=null;'+source.slice(source.indexOf('function badgePoint('),source.indexOf('\nfunction drawBadgeSelection('))+source.slice(source.indexOf('function dragRoute('),source.indexOf('\nfunction drawOrders(')),scope);
for(const u of units){scope.u=u;const p=vm.runInContext('badgePoint(u)',scope),index=(u.id-1)%18,b=buildings[u.garrisonId-1];assert.equal(p.x,b.x+(index%5-2)*38);assert.equal(p.y,b.y-100-36-Math.floor(index/5)*40);}assert.equal(labels,2,'one placement per castle, not a whole garrison scan per soldier');
for(let n=0;n<20;n++){now=n*16;vm.runInContext('dragRoute(from,target,null)',scope);}assert(paths<=3,'a stationary route preview must not run pathfinding every frame');scope.target={x:500,y:300};now+=60;vm.runInContext('dragRoute(from,target,null)',scope);assert(paths>=2);
console.log('36 garrison badge positions use two layout calculations; a stationary drag preview reuses its route.');
