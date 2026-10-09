/* Wall-clock snapshot buffer: smooth positions without simulating combat. */
(function(root){
'use strict';
const angle=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
class SnapshotMotion{
 constructor(){this.reset();}
 reset(){this.frames=[];this.offset=null;this.jitter=0;this.delay=120;this.interval=100;this.roundTrip=null;this.cursor=-Infinity;}
 setRoundTrip(ms){if(!Number.isFinite(ms)||ms<0||ms>30000)return;this.roundTrip=ms;this.updateDelay();}
 updateDelay(){const lowLatency=this.roundTrip!=null&&this.roundTrip<=80;this.delay=Math.max(lowLatency?50:110,Math.min(300,this.interval*(lowLatency?1.05:1.2)+this.jitter*1.5));}
 push(state,now){const stamp=state.sentAt||now,last=this.frames.at(-1);if(last&&((state.sequence!=null&&state.sequence<=last.sequence)||stamp<last.stamp))return false;const offset=now-stamp;this.offset=this.offset==null?offset:Math.min(this.offset+1,offset);if(last){const jitter=Math.abs((now-last.arrival)-(stamp-last.stamp));this.jitter=this.jitter*.85+jitter*.15;const interval=stamp-last.stamp;if(interval>=30)this.interval=this.interval*.85+Math.min(250,interval)*.15;this.updateDelay();}this.frames.push({stamp,arrival:now,time:state.time,sequence:state.sequence,state,units:new Map(state.units.map(u=>[u.id,{...u,walkDistance:u.walkDistance||0,visualHeading:u.visualHeading??u.heading??Math.PI/2}]))});if(this.frames.length>16)this.frames.shift();return true;}
 sample(now){if(!this.frames.length)return null;const end=this.frames.at(-1),requested=now-this.offset-this.delay;this.cursor=Math.max(this.cursor,Math.min(requested,end.stamp+(end.state.speed===0?0:80)));if(end.state.speed===0)this.cursor=end.stamp;let left=this.frames[0],right=left;for(const frame of this.frames){if(frame.stamp<=this.cursor)left=frame;else{right=frame;break;}right=left;}const span=right.stamp-left.stamp,t=span>0?Math.max(0,Math.min(1,(this.cursor-left.stamp)/span)):1,units=new Map();
 // HP, membership, attacks, ownership and effects come from ONE discrete
 // frame. Only positions interpolate: never blend damage with future health.
 for(const [id,a]of left.units){const b=right.units.get(id);if(left===end&&this.cursor>end.stamp&&a.state==='move'&&!a.garrisonId&&end.state.speed!==0){const prior=this.frames.at(-2),old=prior?.units.get(id),span=prior?end.stamp-prior.stamp:0;
  if(old&&span>0&&old.state==='move'&&old.owner===a.owner&&!old.garrisonId&&old.commandVersion===a.commandVersion){
   // A newly issued command or a road turn invalidates the prior velocity.
   // AI paths are intentionally omitted from packets; their order endpoint
   // provides a conservative direction check without simulating that order.
   const next=a.path?.[0]||a.order,vx=a.x-old.x,vy=(a.y-old.y)*2;
   if(Number.isFinite(next?.x)&&Number.isFinite(next?.y)&&(next.x-a.x)*vx+(next.y-a.y)*2*vy>0){
    const dt=Math.min(80,this.cursor-end.stamp)/span,dx=vx*dt,dy=vy*dt/2,step=Math.hypot(dx,dy*2),limit=Math.hypot(next.x-a.x,(next.y-a.y)*2),k=step>0?Math.min(1,limit/step):0;
    units.set(id,{...a,x:a.x+dx*k,y:a.y+dy*k,walkDistance:a.walkDistance+step*k});continue;
   }
  }
 }if(!b||a.owner!==b.owner||a.garrisonId!==b.garrisonId||Math.hypot(b.x-a.x,(b.y-a.y)*2)>100){units.set(id,{...a});continue;}units.set(id,{...a,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,walkDistance:a.walkDistance+(b.walkDistance-a.walkDistance)*t,visualHeading:angle(a.visualHeading,b.visualHeading,t)});}return {time:left.time+(right.time-left.time)*t,state:left.state,elapsed:Math.max(0,(this.cursor-left.stamp)/1000),units};}
}
if(typeof module!=='undefined')module.exports=SnapshotMotion;else root.SnapshotMotion=SnapshotMotion;
})(typeof window!=='undefined'?window:globalThis);
