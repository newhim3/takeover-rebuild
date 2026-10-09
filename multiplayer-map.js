/* One original landscape; territory frames use the campaign renderer. */
(function(root){
'use strict';
const countries=['Green','Red','Blue','Purple'];
function create(data,players=[],options={}){
 if(options.map==='highlands')return highlands(players,options);
 const source=data.levels.find(l=>l.level===7),layout=[...players.map(p=>p.country),...countries.filter(c=>!players.some(p=>p.country===c))];
 const nodes=source.nodes.map(n=>({...n}));
 const homes=nodes.filter(n=>/Node(Castle|MageTower)/.test(n.markerClass));
 const closest=(x,y)=>homes.slice().sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
 const positions=[[183,159],[677,359],[79,405],[638,158]],assigned=new Set();
 positions.forEach(([x,y],i)=>{const n=closest(x,y);n.markerClass='NodeCastle'+layout[i]+'Class';assigned.add(n);});
 for(const n of nodes){if(assigned.has(n))continue;if(n.markerClass.includes('NodeTown'))n.markerClass='NodeTown'+layout[3]+'Class';else if(n.markerClass.includes('NodeMageTower'))n.markerClass='NodeMageTower'+layout[2]+'Class';}
 if(options.includeAI===false)for(const n of nodes)n.markerClass=n.markerClass.replace(/(Green|Red|Blue|Purple)Class$/,c=>players.some(p=>c===p.country+'Class')?c:'GrayClass');
 return {...source,level:'four-kingdoms',nativeLevel:7,width:800,height:600,skirmish:true,nodes,source:'Original level 7, unchanged terrain and roads; optional AI home assignments'};
}
function highlands(players,options){
 // B's actual painted road junctions, in its 1448 x 1086 reference space.
 const points=[[110,117],[214,221],[187,172],[329,146],[673,125],[690,329],[370,263],[417,360],[507,409],[180,466],[135,598],[252,556],[368,566],[590,500],[626,441],[743,473],[750,550],[893,478],[1001,421],[1132,368],[1232,227],[1267,111],[1383,160],[929,198],[838,128],[755,733],[898,695],[988,762],[1205,807],[1303,902],[1374,855],[474,731],[187,758],[151,881],[572,853],[586,699],[661,937],[904,890]];
 const edges=[[0,2],[2,1],[2,3],[3,4],[4,5],[1,6],[6,7],[7,8],[8,13],[13,14],[14,5],[6,4],[9,10],[9,11],[11,12],[12,8],[12,13],[13,15],[15,16],[15,17],[17,18],[18,19],[19,20],[20,23],[23,24],[24,4],[24,21],[21,22],[22,19],[10,32],[32,33],[32,31],[31,35],[35,25],[25,26],[26,28],[28,19],[28,29],[29,30],[30,27],[27,26],[31,34],[34,36],[36,37],[37,27],[16,25],[17,26],[33,34]];
 const nodes=[],layout=['Purple','Blue','Green','Red'];
 const starts=[[1,0],[22,1],[33,2],[29,3]],sites=[[7,'Town'],[9,'MageTower'],[12,'Castle'],[16,'Town'],[19,'MageTower'],[20,'Castle'],[28,'Town'],[27,'Castle'],[32,'MageTower'],[35,'Town']];
 let location=0;function add(index,type,owner){const [x,y]=points[index],loc=location++;nodes.push({markerClass:'Node'+type+owner+'Class',x,y,locationNum:loc});for(let i=0;i<(type==='Castle'?3:type==='Town'?2:1);i++)nodes.push({markerClass:'NodeBuildHereClass',x:x+[-34,34,0][i],y:y+[24,24,42][i],locationNum:loc});}
 for(const [index,c]of starts){const country=layout[c],active=options.includeAI!==false||players.some(p=>p.country===country);add(index,'Castle',active?country:'Gray');}
 for(const [index,type]of sites)add(index,type,'Gray');
 for(const index of [3,14,23,34]){const [x,y]=points[index];nodes.push({markerClass:'NodeChestClass',x,y,locationNum:-1},{markerClass:'NodeDefenderOgreClass',x,y,locationNum:-1});}
 const curves=typeof module!=='undefined'?require('./assets/takeover/maps/highlands-roads.js'):root.HighlandsRoads;
 return {level:'highlands',nativeLevel:'highlands',width:1448,height:1086,skirmish:true,nodes,roads:{points:points.map(([x,y])=>({x,y})),edges,paths:curves?.paths},source:'Selected generated B candidate; road graph and original animated entities',terrainRegions:points.map(([x,y],id)=>({x,y,id}))};
}
const api={create,countries};if(typeof module!=='undefined')module.exports=api;else root.MultiplayerMap=api;
})(globalThis);

