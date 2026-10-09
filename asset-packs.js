/* Lossless original files in a single request; no atlas resizing or artwork changes. */
(function(root){'use strict';
class AssetPacks{
 constructor(){this.packs=new Map();this.staticImages=new Map();this.bytes=0;this.budget=32*1024*1024;}
 image(name){let image=this.staticImages.get(name);if(!image){image=new Image();image.decoding='async';this.staticImages.set(name,image);}return image;}
 load(url){const existing=this.packs.get(url);if(existing){this.packs.delete(url);this.packs.set(url,existing);return existing.promise;}
  const entry={bytes:0};entry.promise=fetch(url).then(response=>{if(!response.ok)throw Error('Asset pack unavailable');return response.arrayBuffer();}).then(buffer=>{
   const bytes=new Uint8Array(buffer),view=new DataView(buffer);if(bytes.length<8||String.fromCharCode(...bytes.slice(0,4))!=='TKP1')throw Error('Invalid asset pack');const size=view.getUint32(4,true);if(size>bytes.length-8)throw Error('Invalid asset table');const table=JSON.parse(new TextDecoder().decode(bytes.subarray(8,8+size))),files=new Map(),start=8+size;
   for(const [name,item]of Object.entries(table)){if(!Number.isSafeInteger(item.offset)||!Number.isSafeInteger(item.length)||item.offset<0||item.length<0||start+item.offset+item.length>bytes.length)throw Error('Invalid asset range');files.set(name,{bytes:bytes.subarray(start+item.offset,start+item.offset+item.length),mime:item.mime});}
   entry.bytes=buffer.byteLength;this.bytes+=entry.bytes;this.trim();return files;
  }).catch(error=>{if(this.packs.get(url)===entry)this.packs.delete(url);throw error;});this.packs.set(url,entry);return entry.promise;
 }
 assign(image,name,url=root.NativeAssetPackIndex?.[name]){if(image.__nativePackSource===name)return;image.__nativePackSource=name;if(!url){image.src=name;return;}
  this.load(url).then(files=>{const file=files.get(name);if(!file)throw Error('Asset is absent from pack');const blob=URL.createObjectURL(new Blob([file.bytes],{type:file.mime})),release=()=>URL.revokeObjectURL(blob);image.addEventListener('load',release,{once:true});image.addEventListener('error',()=>{release();image.src=name;},{once:true});image.src=blob;}).catch(()=>{image.src=name;});
 }
 trim(){for(const [url,entry]of this.packs){if(this.bytes<=this.budget)break;if(entry.bytes){this.packs.delete(url);this.bytes-=entry.bytes;}}}
}
if(typeof module!=='undefined')module.exports=AssetPacks;else root.NativeAssetPacks=new AssetPacks();
})(typeof window!=='undefined'?window:globalThis);
