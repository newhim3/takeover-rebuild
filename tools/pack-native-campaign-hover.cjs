/* Encode retained original campaign _over frames as native browser WebP animation. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const sharp=require(process.env.TAKEOVER_SHARP||'C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),reference=path.join(root,'reference/native-campaign-hover-r19'),out=path.join(root,'assets/takeover/ui');
const width=450,height=735,count=10,delay=Array.from({length:count},(_,i)=>Math.floor((i+1)*1000/30)-Math.floor(i*1000/30));
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
function alphaBounds(data){let left=width,top=height,right=-1,bottom=-1,edgePixels=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++){const a=data[(y*width+x)*4+3];if(!a)continue;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);if(!x||!y||x===width-1||y===height-1)edgePixels++;}return{left,top,right,bottom,edgePixels};}
(async()=>{
 const audit={width,height,frames:count,fps:30,delayMs:delay,loop:0,countries:{}};const preview=[],registry={};
 for(const [column,country] of ['Green','Blue','Red'].entries()){
  const current=path.join(out,'atlases/screens/native-campaign-flag-'+country+'.webp');
  preview.push({input:await sharp(current).resize(300,490).png().toBuffer(),left:column*300,top:0});
  const frames=[],bounds=[],hashes=[];
  for(let frame=1;frame<=count;frame++){
   const svg=fs.readFileSync(path.join(reference,'normalized-svg',country,frame+'.svg'));
   const {data,info}=await sharp(svg).resize(width,height,{fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   if(info.width!==width||info.height!==height||info.channels!==4)throw new Error(country+' frame dimensions differ');
   const bound=alphaBounds(data);if(bound.right<0)throw new Error(country+' frame '+frame+' is empty');
   // Blue's original lower tip occupies seven antialiased pixels on the last
   // row. Touching that row is valid; check a larger original-coordinate ring
   // to prove that no cloth, portrait, crest or source shadow is cut away.
   const expanded=svg.toString('utf8').replace('viewBox="-150 -245 300 490"','viewBox="-170 -265 340 530"').replace('width="450"','width="510"').replace('height="735"','height="795"');
   const ring=await sharp(Buffer.from(expanded)).ensureAlpha().raw().toBuffer();let outsidePixels=0;
   for(let y=0;y<795;y++)for(let x=0;x<510;x++)if((x<30||x>=480||y<30||y>=765)&&ring[(y*510+x)*4+3])outsidePixels++;
   if(outsidePixels)throw new Error(country+' frame '+frame+' loses source artwork outside the registration viewport');
   bound.outsidePixels=outsidePixels;
   frames.push(data);bounds.push(bound);hashes.push(hash(data));
   if([1,5,10].includes(frame)){const png=await sharp(data,{raw:{width,height,channels:4}}).resize(300,490).png().toBuffer();preview.push({input:png,left:column*300,top:([1,5,10].indexOf(frame)+1)*490});}
  }
  if(new Set(hashes).size<2)throw new Error(country+' hover export has no animated changes');
  const file='native-campaign-hover-'+country+'.webp',target=path.join(out,file),pixels=Buffer.concat(frames);
  await sharp(pixels,{raw:{width,height:height*count,channels:4,pageHeight:height}}).webp({lossless:true,effort:6,loop:0,delay}).toFile(target);
  const metadata=await sharp(target,{animated:true}).metadata();
  if(metadata.pages!==count||metadata.pageHeight!==height||metadata.width!==width)throw new Error(country+' WebP lost frame dimensions');
  const decoded=await sharp(target,{animated:true}).ensureAlpha().raw().toBuffer();
  for(let frame=0;frame<count;frame++){const actual=decoded.subarray(frame*width*height*4,(frame+1)*width*height*4);for(let p=0;p<actual.length;p+=4){if(actual[p+3]!==frames[frame][p+3]||actual[p+3]&&(!actual.subarray(p,p+3).equals(frames[frame].subarray(p,p+3))))throw new Error(country+' WebP changed visible source pixels');}}
  audit.countries[country]={file,bytes:fs.statSync(target).size,sha256:hash(fs.readFileSync(target)),frameHashes:hashes,uniqueFrames:new Set(hashes).size,bounds,metadata:{pages:metadata.pages,pageHeight:metadata.pageHeight,loop:metadata.loop,delay:metadata.delay},losslessVisiblePixels:'passed'};
  registry[country]={file,hash:audit.countries[country].sha256.slice(0,16),width,height,frames:count};
  console.log(country+': '+count+' original frames, '+fs.statSync(target).size+' bytes; alpha edges and lossless pixels verified');
 }
 await sharp({create:{width:900,height:1960,channels:4,background:'#202020'}}).composite(preview).png().toFile(path.join(reference,'normal-over-1-5-10.png'));
 const sourcePath=path.join(reference,'source.json'),source=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
 source.delaysMs=delay;source.loop=0;
 for(const country of Object.keys(registry))Object.assign(source.countries[country],registry[country],{bytes:audit.countries[country].bytes,sha256:audit.countries[country].sha256,delaysMs:delay,loop:0});
 fs.writeFileSync(sourcePath,JSON.stringify(source,null,2)+'\n');
 fs.writeFileSync(path.join(out,'native-campaign-hover-assets.js'),'/* Original campaign _over frames; generated by tools/pack-native-campaign-hover.cjs. */\nwindow.NativeCampaignHoverAssets='+JSON.stringify(registry)+';\n');
 fs.writeFileSync(path.join(reference,'audit.json'),JSON.stringify(audit,null,2)+'\n');
})().catch(error=>{console.error(error);process.exitCode=1;});
