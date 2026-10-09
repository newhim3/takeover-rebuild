/* Original localized declaration timeline, cached as lossless cropped frames.
 * Decode a small page window; keep compressed pages for later casts. */
(function(root){
'use strict';
const base='assets/takeover/ui/ultimate/atlases/',metadata=root.NativeDeclarationAtlas||{},banks=new Map();
function meta(key){return metadata[key]||null;}
function bank(key){if(!banks.has(key))banks.set(key,{downloads:new Map(),pages:new Map(),last:null,warming:null});return banks.get(key);}
function download(key,index){const b=bank(key);if(!b.downloads.has(index))b.downloads.set(index,fetch(base+meta(key).pages[index]+'?v='+(meta(key).hashes?.[index]||'20261006-r5'),{priority:'low'}).then(r=>{if(!r.ok)throw Error('原版宣告图集未能加载');return r.blob();}).catch(error=>{b.downloads.delete(index);throw error;}));return b.downloads.get(index);}
function page(key,index){const b=bank(key);if(!b.pages.has(index)){const entry={image:null,ready:false};b.pages.set(index,entry);entry.promise=download(key,index).then(blob=>new Promise((resolve,reject)=>{const image=new Image(),url=URL.createObjectURL(blob);image.decoding='async';image.onload=()=>{entry.image=image;entry.ready=true;URL.revokeObjectURL(url);resolve(image);};image.onerror=()=>{URL.revokeObjectURL(url);reject(Error('原版宣告图集无法解码'));};image.src=url;})).catch(error=>{entry.error=error;return null;});}return b.pages.get(index);}
function preload(keys=Object.keys(metadata)){if(typeof keys==='string')keys=[keys];return Promise.all(keys.filter(meta).map(key=>page(key,0).promise));}
function prepare(key){if(!meta(key))return Promise.resolve();const b=bank(key);if(!b.warming)b.warming=(async()=>{for(let n=0;n<meta(key).pages.length;n+=2)await Promise.all([n,n+1].filter(i=>i<meta(key).pages.length).map(i=>download(key,i)));})().catch(error=>{b.warming=null;console.warn(error);});return b.warming;}
function draw(ctx,key,seconds,x=0,y=0){
 const m=meta(key);if(!m)return false;const b=bank(key),n=Math.max(0,Math.min(m.frames-1,Math.floor(seconds*m.fps))),cell=m.cells[n],keep=new Set([0]);
 if(n<(b.frameNumber??-1))b.last=null;b.frameNumber=n;
 for(let i=n;i<=Math.min(m.frames-1,n+12);i++){const c=m.cells[i];if(c){keep.add(c.page);page(key,c.page);}}
 if(!cell)return true;let image=page(key,cell.page),selected=cell;
 if(!image.ready){const last=b.last;if(!last)return false;image=last.image;selected=last.cell;}else b.last={cell,image};
 if(b.last)keep.add(b.last.cell.page);
 for(const [index,entry]of b.pages)if(entry.ready&&!keep.has(index))b.pages.delete(index);
 if(!image.image)return false;ctx.drawImage(image.image,selected.x,selected.y,selected.w,selected.h,x+selected.ox,y+selected.oy,selected.w,selected.h);return true;
}
const api={meta,metadata,preload,prepare,draw};if(typeof module!=='undefined')module.exports=api;else root.DeclarationArt=api;
})(typeof window!=='undefined'?window:globalThis);
