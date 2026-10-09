/* One small lossless atlas of existing native cursors, including their padding. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),pivots=JSON.parse(fs.readFileSync(path.join(root,'reference/native-cursors/cursor-registration.json'))),meta=JSON.parse(fs.readFileSync(path.join(root,'assets/takeover/animation/anim_manifest.json'))).sheets;
(async()=>{
 const entries={},tiles=[];
 for(const [n,key]of Object.keys(pivots).entries()){
  const index=n<18?n:n+1,m=meta.find(m=>m.key===key),x=index%4*180,y=Math.floor(index/4)*120;
  entries[key]={x,y,w:m.fw,h:m.fh,pivot:pivots[key]};
  tiles.push({input:fs.readFileSync(path.join(root,'assets/takeover/animation',m.sheet)),left:x,top:y});
 }
 const shared=await sharp(fs.readFileSync(path.join(root,'assets/takeover/ui/native-range.svg'))).png().toBuffer();
 entries.shared={x:360,y:480,w:154,h:84,pivot:[77,42]};tiles.push({input:shared,left:360,top:480});
 await sharp({create:{width:720,height:840,channels:4,background:'#0000'}}).composite(tiles).webp({lossless:true}).toFile(path.join(root,'assets/takeover/ui/atlases/native-feedback.webp'));
 const file='assets/takeover/ui/atlases/native-feedback.webp',hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').slice(0,16);
 fs.writeFileSync(path.join(root,'assets/takeover/ui/atlases/native-feedback.js'),'window.NativeFeedbackArt='+JSON.stringify(entries)+';\nwindow.NativeFeedbackDelivery='+JSON.stringify(file+'?v='+hash)+';\n');
 console.log('Packed 18 cursors, 6 projectiles and one shared original range ring.');
})().catch(e=>{console.error(e);process.exitCode=1;});
