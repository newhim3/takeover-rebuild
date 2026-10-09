/* Original xJ ColorTransform: poison G+150, freeze B+150; poison wins.
 * Only requested member frames are processed once, in bounded idle jobs.
 */
(function(root){'use strict';
function mode(u){return u.poison>0?'poison':u.frozen>0||u.chilled>0?'frozen':null;}
function addChannels(data,tone){const channel=tone==='poison'?1:2;for(let p=0;p<data.length;p+=4)if(data[p+3])data[p+channel]=Math.min(255,data[p+channel]+150);}
function describe(u){const labels=[];if(u.poison>0)labels.push('中毒');if(u.frozen>0)labels.push('冻结');else if(u.chilled>0)labels.push('减速');if(u.enchanted>0)labels.push('附魔');if(u.bloodlust>0)labels.push('嗜血');if(u.protected>0)labels.push('保护');return labels.join('、');}
class FrameCache{
 constructor(createCanvas,metadata,{budget=8*1024*1024,maxPending=128,batch=12,budgetMs=2,schedule=fn=>setTimeout(fn,0),now=()=>performance.now()}={}){Object.assign(this,{createCanvas,metadata,budget,maxPending,batch,budgetMs,schedule,now});this.entries=new Map();this.queue=[];this.bytes=0;this.serial=0;this.jobs=0;this.scheduled=false;}
 get(key,frame,image,tone){const m=this.metadata[key];if(!m||!tone)return null;frame=Math.max(0,Math.floor(frame))%m.frames;const token=key+':'+tone+':'+frame;let e=this.entries.get(token);if(e){e.used=++this.serial;return e.canvas||null;}e={token,key,frame,image,tone,used:++this.serial};this.entries.set(token,e);this.queue.push(e);if(this.queue.length>this.maxPending){this.queue.sort((a,b)=>a.used-b.used);const old=this.queue.shift();this.entries.delete(old.token);}this.pump();return null;}
 pump(){if(this.scheduled||!this.queue.length)return;this.scheduled=true;this.schedule(()=>{this.scheduled=false;this.flush();this.pump();});}
 flush(){const began=this.now();let count=0;this.queue.sort((a,b)=>a.used-b.used);while(this.queue.length&&count<this.batch&&(count===0||this.now()-began<this.budgetMs)){const e=this.queue.pop();if(this.entries.get(e.token)!==e)continue;count++;const m=this.metadata[e.key],canvas=this.createCanvas();canvas.width=m.fw;canvas.height=m.fh;try{const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(e.image,e.frame%m.cols*m.fw,Math.floor(e.frame/m.cols)*m.fh,m.fw,m.fh,0,0,m.fw,m.fh);const pixels=c.getImageData(0,0,m.fw,m.fh);addChannels(pixels.data,e.tone);c.putImageData(pixels,0,0);e.canvas=canvas;e.image=null;e.bytes=m.fw*m.fh*4;this.bytes+=e.bytes;this.jobs++;}catch{canvas.width=canvas.height=0;e.image=null;e.failed=true;}this.trim();}}
 trim(){if(this.bytes<=this.budget)return;const old=[...this.entries.values()].filter(e=>e.canvas).sort((a,b)=>a.used-b.used);for(const e of old){if(this.bytes<=this.budget)break;this.entries.delete(e.token);this.bytes-=e.bytes;e.canvas.width=e.canvas.height=0;}}
 stats(){return{frames:[...this.entries.values()].filter(e=>e.canvas).length,queued:this.queue.length,processedFrames:this.jobs,estimatedMiB:Math.round(this.bytes/1048576*100)/100};}
}
const api={mode,addChannels,describe,FrameCache};if(typeof module!=='undefined')module.exports=api;else root.NativeStatusArt=api;
})(typeof window!=='undefined'?window:globalThis);
