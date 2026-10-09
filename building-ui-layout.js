/* Shared native artwork anchors for rendering, garrison badges and clicks. */
(function(root){'use strict';
function label(b,pivots,sprites){const type=b.visualType||b.type,key=type+(b.owner==='Gray'?'Purple':b.owner)+(b.ruined?(type==='MageTower'?'Razed':'Raze'):'')+'Class',pivot=pivots[key],meta=sprites[key],animated=key.replace('Class','AnimClass'),height=Math.max(pivot?.[1]??meta?.fh??80,sprites[animated]?pivots[animated]?.[1]||0:0);return {x:b.x,y:Math.max(18,b.y-height-18),width:154,height:36};}
function contains(p,q){return Math.abs(p.x-q.x)<=p.width/2&&Math.abs(p.y-q.y)<=p.height/2;}
const api={label,contains};if(typeof module!=='undefined')module.exports=api;else root.BuildingUILayout=api;
})(typeof window!=='undefined'?window:globalThis);
