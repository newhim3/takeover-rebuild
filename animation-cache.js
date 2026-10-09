/* Prepare actual battle actions asynchronously, retaining active sprites. */
(function(root){'use strict';
class AnimationCache{
 constructor(createImage,metadata,{budget=96*1024*1024,concurrency=4}={}){Object.assign(this,{createImage,metadata,budget,concurrency});this.images=new Map();this.entries=new Map();this.queue=[];this.pins=new Set();this.bytes=0;this.loading=0;this.serial=0;}
 get(key,priority=0){let entry=this.entries.get(key);if(entry){entry.used=++this.serial;if(entry.queued)entry.priority=Math.min(entry.priority,priority);return entry.image;}
  const m=this.metadata[key],image=this.createImage(),bytes=m?m.fw*m.cols*m.fh*Math.ceil(m.frames/m.cols)*4:0;
  entry={key,image,bytes,priority,queued:true,used:++this.serial,ready:false};image.decoding='async';this.images.set(key,image);this.entries.set(key,entry);this.bytes+=bytes;this.queue.push(entry);this.pump();return image;
 }
 warm(keys){for(const key of keys)if(this.metadata[key])this.get(key,1);}
 pin(keys){this.pins=new Set(keys);this.trim();}
 pump(){while(this.loading<this.concurrency&&this.queue.length){this.queue.sort((a,b)=>a.priority-b.priority||a.used-b.used);const entry=this.queue.shift();if(this.entries.get(entry.key)!==entry)continue;entry.queued=false;this.loading++;let done=false;
   const finish=()=>{if(done)return;done=true;entry.ready=!!entry.image.naturalWidth;entry.finished=true;this.loading--;this.trim();this.pump();};
   entry.image.onload=()=>{if(entry.image.decode)entry.image.decode().catch(()=>{}).then(finish);else finish();};entry.image.onerror=finish;const source='assets/takeover/animation/anim/'+entry.key+'.png';if(root.NativeAssetPacks)root.NativeAssetPacks.assign(entry.image,source);else entry.image.src=source;
  }
 }
 trim(){if(this.bytes<=this.budget)return;const candidates=[...this.entries.values()].filter(e=>e.finished&&!this.pins.has(e.key)).sort((a,b)=>a.used-b.used);for(const e of candidates){if(this.bytes<=this.budget)break;this.entries.delete(e.key);this.images.delete(e.key);this.bytes-=e.bytes;}}
 stats(){return{images:this.images.size,estimatedDecodedMiB:Math.round(this.bytes/1048576*10)/10,loading:this.loading,queued:this.queue.length};}
}
if(typeof module!=='undefined')module.exports=AnimationCache;else root.AnimationCache=AnimationCache;
})(typeof window!=='undefined'?window:globalThis);
