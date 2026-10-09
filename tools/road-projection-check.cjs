'use strict';
const assert=require('node:assert'),Roads=require('../curved-roads');
const points=[],edges=[],paths={};
for(let y=0;y<12;y++)for(let x=0;x<12;x++)points.push({x:x*90,y:y*45});
for(let y=0;y<12;y++)for(let x=0;x<12;x++){const a=y*12+x;for(const b of [x<11?a+1:null,y<11?a+12:null])if(b!=null){edges.push([a,b]);paths[a+':'+b]=[points[a],{x:(points[a].x+points[b].x)/2+4,y:(points[a].y+points[b].y)/2+3},points[b]];}}
const roads={points,edges,paths},geometry=Roads.geometry(roads);
function brute(p){let best=null;for(const edge of geometry.edges)for(let i=1;i<edge.points.length;i++){const a=edge.points[i-1],b=edge.points[i],dx=b.x-a.x,dy=(b.y-a.y)*2,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*2*dy)/l)):0,x=a.x+t*dx,y=a.y+t*dy/2,d=Math.hypot(x-p.x,(y-p.y)*2);if(!best||d<best.d)best={x,y,d,a:edge.a,b:edge.b};}return best;}
for(let n=0;n<35;n++){const p={x:(n*173%1300)-100,y:(n*97%700)-80},a=brute(p),b=Roads.project(roads,p);assert(Math.hypot(a.x-b.x,a.y-b.y)<1e-8);assert.equal(b.a,a.a);assert.equal(b.b,a.b);}
const hypot=Math.hypot;let calls=0;Math.hypot=(...args)=>{calls++;return hypot(...args);};try{Roads.project(roads,{x:405,y:204});}finally{Math.hypot=hypot;}
assert(calls<edges.length/4,'a nearby projection must not calculate distance for every road segment: '+calls+' calls');
console.log('Exact nearest-road results match the previous scan; distance calls: '+calls+' versus '+edges.length*2+' segments.');
