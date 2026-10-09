/* Read-only command descriptions. Never deploy, pathfind or advance a unit. */
(function(root){'use strict';
function describe(battle,owner,command){
 if(command?.type==='stop')return{type:'stop',order:null};
 if(command?.type!=='move'||!command.point||!Number.isFinite(command.point.x)||!Number.isFinite(command.point.y))return null;
 const p=command.point;if(p.x<0||p.y<0||p.x>battle.width||p.y>battle.height)return null;
 const target=battle.unit(command.target)||battle.building(command.target)||battle.chest(command.target),building=!!target&&'queue' in target,enter=building&&battle.canEnter(target,owner);
 return{type:'move',order:{x:p.x,y:p.y,target:target&&(target.owner!==owner||building)?target.id:null,enter:!!enter,collect:!!target&&'collected' in target,capture:!!target?.ruined}};
}
const api={describe};if(typeof module!=='undefined')module.exports=api;else root.PausedOrderFeedback=api;
})(typeof window!=='undefined'?window:globalThis);
