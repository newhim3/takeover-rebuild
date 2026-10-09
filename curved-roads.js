/* Navigation for painted curved paths; macro junction graph stays small. */
(function(root){
'use strict';
const distance=(a,b)=>Math.hypot(a.x-b.x,(a.y-b.y)*2),geometries=new WeakMap(),tables=new WeakMap();
// Static road bounds are built once. Projection keeps the exact nearest segment.
function boundsTree(segments){
 if(!segments.length)return null;
 const box={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
 for(const s of segments){box.minX=Math.min(box.minX,s.minX);box.minY=Math.min(box.minY,s.minY);box.maxX=Math.max(box.maxX,s.maxX);box.maxY=Math.max(box.maxY,s.maxY);}
 if(segments.length<=8)return {...box,segments};
 const axis=box.maxX-box.minX>=box.maxY-box.minY?'X':'Y',sorted=segments.slice().sort((a,b)=>a['min'+axis]+a['max'+axis]-b['min'+axis]-b['max'+axis]),middle=sorted.length>>1;
 return {...box,left:boundsTree(sorted.slice(0,middle)),right:boundsTree(sorted.slice(middle))};
}
function geometry(roads){
 if(geometries.has(roads))return geometries.get(roads);
 const edges=roads.edges.map(([a,b])=>{const points=roads.paths[a+':'+b]||[roads.points[a],roads.points[b]],lengths=[0];for(let i=1;i<points.length;i++)lengths[i]=lengths[i-1]+distance(points[i-1],points[i]);return {a,b,points,lengths,length:lengths.at(-1)};});
 const segments=[];for(const edge of edges)for(let i=1;i<edge.points.length;i++){const first=edge.points[i-1],last=edge.points[i],dx=last.x-first.x,dy=(last.y-first.y)*2;segments.push({edge,section:i-1,ordinal:segments.length,first,dx,dy,lengthSquared:dx*dx+dy*dy,minX:Math.min(first.x,last.x),maxX:Math.max(first.x,last.x),minY:Math.min(first.y,last.y)*2,maxY:Math.max(first.y,last.y)*2});}
 const result={edges,tree:boundsTree(segments)};geometries.set(roads,result);return result;
}
function project(roads,p){
 const tree=geometry(roads).tree;if(!tree)return null;const py=p.y*2;
 const lower=node=>{const dx=Math.max(node.minX-p.x,0,p.x-node.maxX),dy=Math.max(node.minY-py,0,py-node.maxY);return dx*dx+dy*dy;};
 let best=null;const stack=[tree];
 while(stack.length){const node=stack.pop();if(best&&lower(node)>best.d*best.d*(1+1e-12))continue;
  if(node.segments){for(const s of node.segments){const t=s.lengthSquared?Math.max(0,Math.min(1,((p.x-s.first.x)*s.dx+(py-s.first.y*2)*s.dy)/s.lengthSquared)):0,x=s.first.x+s.dx*t,y=s.first.y+s.dy*t/2,d=distance(p,{x,y});if(!best||d<best.d||d===best.d&&s.ordinal<best.ordinal)best={x,y,a:s.edge.a,b:s.edge.b,edge:s.edge,section:s.section,k:(s.edge.lengths[s.section]+Math.sqrt(s.lengthSquared)*t)/Math.max(1,s.edge.length),d,ordinal:s.ordinal};}}
  else{const l=lower(node.left),r=lower(node.right);if(l<r){stack.push(node.right,node.left);}else stack.push(node.left,node.right);}
 }
 if(best)delete best.ordinal;return best;
}
function partial(p,end){return [{x:p.x,y:p.y},...(end===p.b?p.edge.points.slice(p.section+1):p.edge.points.slice(0,p.section+1).reverse())];}
function between(a,b){const forward=a.k<=b.k,points=a.edge.points.filter((_,i)=>{const k=a.edge.lengths[i]/a.edge.length;return k>Math.min(a.k,b.k)&&k<Math.max(a.k,b.k);});return [{x:a.x,y:a.y},...(forward?points:points.reverse()),{x:b.x,y:b.y}];}
function path(b,from,to){const roads=b.data.roads,start=project(roads,from),end=project(roads,to);if(!start||!end)return [];if(start.edge===end.edge)return between(start,end).filter((p,i)=>i||distance(from,p)>.01);
 const edges=geometry(roads).edges;let roadTables=tables.get(roads);if(!roadTables){roadTables=new Map();tables.set(roads,roadTables);}let best=null;
 for(const origin of [start.a,start.b]){let table=roadTables.get(origin);if(!table){const cost=roads.points.map(()=>Infinity),previous=roads.points.map(()=>null),open=new Set([origin]);cost[origin]=0;while(open.size){let node=-1;for(const id of open)if(node<0||cost[id]<cost[node])node=id;open.delete(node);for(const edge of edges){const next=edge.a===node?edge.b:edge.b===node?edge.a:null;if(next==null||cost[node]+edge.length>=cost[next])continue;cost[next]=cost[node]+edge.length;previous[next]={node,edge};open.add(next);}}table={cost,previous};roadTables.set(origin,table);}for(const destination of [end.a,end.b]){const cost=(origin===start.a?start.k:1-start.k)*start.edge.length+table.cost[destination]+(destination===end.a?end.k:1-end.k)*end.edge.length;if(!best||cost<best.cost)best={origin,destination,cost,table};}}
 if(!best||!Number.isFinite(best.cost))return [];const chain=[];for(let at=best.destination;at!==best.origin;){const prior=best.table.previous[at];if(!prior)return [];chain.unshift(prior.node===prior.edge.a?prior.edge.points:prior.edge.points.slice().reverse());at=prior.node;}
 const out=[...partial(start,best.origin),...chain.flat(),...partial(end,best.destination).reverse()];return out.filter((p,i)=>i?distance(out[i-1],p)>.01:distance(from,p)>.01);
}
const api={project,path,geometry};if(typeof module!=='undefined')module.exports=api;else root.CurvedRoads=api;
})(globalThis);
