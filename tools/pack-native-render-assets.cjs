/* Raster caches of original artwork. No new UI shapes or colour filters. */
'use strict';
const fs=require('fs'),path=require('path');
const sharp=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir=path.join(__dirname,'../assets/takeover/ui'),out=path.join(dir,'atlases');fs.mkdirSync(out,{recursive:true});
async function atlas(prefix,count,w,h){const tiles=[];for(let n=0;n<count;n++){const input=await sharp(fs.readFileSync(path.join(dir,prefix+'-'+(n+1)+'.svg'))).resize(w,h).png().toBuffer();tiles.push({input,left:n%10*w,top:Math.floor(n/10)*h});}await sharp({create:{width:w*10,height:h*Math.ceil(count/10),channels:4,background:'#0000'}}).composite(tiles).webp({lossless:true}).toFile(path.join(out,prefix+'.webp'));}
(async()=>{
 await atlas('badge-health',100,40,40);
 for(const c of ['Red','Green','Blue','Purple'])await atlas('building-health-'+c,100,120,30);
 await atlas('native-world-swords',60,120,150);
 for(const c of ['Green','Red','Blue','Purple'])await sharp(fs.readFileSync(path.join(dir,'native-world-controls-'+c+'.svg'))).resize(1600,1200).webp({lossless:true}).toFile(path.join(out,'native-world-controls-'+c+'.webp'));
 const names=[...['Green','Red','Blue','Purple','Gray'].map(c=>'badge-color-'+c+'.svg'),...[1,2,3].map(n=>'badge-rank-'+n+'.svg'),...['Green','Red','Blue','Purple'].flatMap(c=>['repair','shield'].map(t=>'building-status-'+c+'-'+t+'.svg')),...[1,2,3].map(n=>'building-rank-'+n+'.svg'),'move.png','attack.png','enter.png','star-gold.png','star-silver.png'];
 const tiles=[],entries={};for(const [n,name]of names.entries()){const building=name.startsWith('building'),w=building?120:56,h=building?30:56,key=name.endsWith('.svg')?name:name.slice(0,-4),x=n%10*120,y=Math.floor(n/10)*60;const input=await sharp(fs.readFileSync(path.join(dir,name))).resize(w,h,{fit:'fill'}).png().toBuffer();tiles.push({input,left:x,top:y});entries[key]={x,y,w,h};}
 await sharp({create:{width:1200,height:Math.ceil(names.length/10)*60,channels:4,background:'#0000'}}).composite(tiles).webp({lossless:true}).toFile(path.join(out,'native-render-ui.webp'));
 fs.writeFileSync(path.join(out,'native-render-ui.js'),'window.NativeRenderUI='+JSON.stringify(entries)+';\n');
 for(const c of ['Green','Red','Blue','Purple']){const f=path.join(dir,'native-world-node-'+c+(['Green','Red'].includes(c)?'-ready':'')+'.svg');let svg=fs.readFileSync(f,'utf8');if(svg.includes('<ns0:svg'))svg=svg.replace('<ns0:svg','<svg xmlns="http://www.w3.org/2000/svg"').replace('</ns0:svg>','</svg>');await sharp(Buffer.from(svg)).resize(240,300).webp({lossless:true}).toFile(path.join(out,'native-world-node-'+c+'.webp'));}
 console.log('Packed original health frames, static HUD art, 60 sword frames, four native footers and national castle nodes.');
})().catch(e=>{console.error(e);process.exitCode=1;});
