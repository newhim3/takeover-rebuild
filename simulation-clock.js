/* Shared fixed simulation time; display interpolation never changes combat. */
(function(root){'use strict';
class FixedClock{
 constructor(step=.05,maxElapsed=.25){this.step=step;this.maxElapsed=maxElapsed;this.reset();}
 reset(){this.accumulator=0;}
 advance(elapsed,speed,update){if(speed<=0){this.reset();return 0;}this.accumulator+=Math.max(0,Math.min(this.maxElapsed,elapsed))*speed;let count=0;while(this.accumulator+1e-9>=this.step&&count<16){update(this.step);this.accumulator-=this.step;count++;}if(this.accumulator<0)this.accumulator=0;return count;}
 get alpha(){return Math.min(1,this.accumulator/this.step);}
}
class LocalMotion{
 constructor(){this.previous=new Map();}
 beforeStep(battle){this.previous=new Map(battle.units.map(u=>[u.id,{x:u.x,y:u.y,walkDistance:u.walkDistance||0,visualHeading:u.visualHeading??u.heading??Math.PI/2,owner:u.owner,garrisonId:u.garrisonId,commandVersion:u.commandVersion||0}]));}
 project(units,alpha){return units.map(u=>{const old=this.previous.get(u.id);if(!old||u.garrisonId||old.garrisonId||u.owner!==old.owner||(u.commandVersion||0)!==old.commandVersion||Math.hypot(u.x-old.x,(u.y-old.y)*2)>100)return u;const turn=Math.atan2(Math.sin((u.visualHeading??old.visualHeading)-old.visualHeading),Math.cos((u.visualHeading??old.visualHeading)-old.visualHeading));return{...u,x:old.x+(u.x-old.x)*alpha,y:old.y+(u.y-old.y)*alpha,walkDistance:old.walkDistance+((u.walkDistance||0)-old.walkDistance)*alpha,visualHeading:old.visualHeading+turn*alpha};});}
}
const api={FixedClock,LocalMotion};if(typeof module!=='undefined')module.exports=api;else root.SimulationClock=api;
})(typeof window!=='undefined'?window:globalThis);
