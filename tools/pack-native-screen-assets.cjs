/* Original static UI pixels, rasterized once instead of reparsing embedded SVGs. */
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const sharp=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.join(__dirname,'..'),base=path.join(root,'assets/takeover/ui'),out=path.join(base,'atlases/screens');fs.mkdirSync(out,{recursive:true});
const names=new Set(fs.readdirSync(base).filter(n=>/^(?:native-(?:title-background|profile-background|campaign-background|campaign-flag-(?:Red|Green|Blue|Purple)|world-(?:\d+|Purple)|edicts-(?:Red|Green|Blue|Purple)|level-info-(?:(?:Red|Green|Blue)-[1-4]|Purple-restored-[1-4])))\.svg$/.test(n)));
for(const css of ['original-ui.css','native-world.css','native-edicts.css','native-results.css','multiplayer.css','native-hud.css','recruitment.css']){
 const text=fs.readFileSync(path.join(root,css),'utf8');
 for(const m of text.matchAll(/assets\/takeover\/ui\/([^'"()]+\.svg)/g))if(fs.existsSync(path.join(base,m[1])))names.add(m[1]);
 // CSS already points to the cache after the first build. Recover the source
 // names so rebuilding an empty output directory still includes these assets.
 for(const m of text.matchAll(/assets\/takeover\/ui\/atlases\/screens\/([^'"()/?]+\.webp)/g)){
  const name=m[1].replace(/\.webp$/,'.svg').replaceAll('--','/');
  if(fs.existsSync(path.join(base,name)))names.add(name);
 }
}
for(const c of ['Green','Red','Blue','Purple'])for(const kind of ['emblem','chrome'])names.add('results/'+kind+'-'+c+'.svg');
for(const c of ['Green','Red','Blue','Purple']){
 names.add('native-hud-back-'+c+'.svg');
 for(const type of ['Castle','Town','Site'])for(const direction of ['left','right'])names.add('native-recruit-'+type+'-'+c+'-'+direction+'.svg');
}
for(const n of [1,2,3])names.add('results/crown-'+n+'.svg');
for(const kind of ['purchased','lost','magic','gold'])for(const n of [1,100])names.add('results/bar-'+kind+'-'+n+'.svg');
for(let n=1;n<=100;n++)names.add('results/xp-'+n+'.svg');
function normalize(text){const prefix=text.match(/<([\w]+):svg\b/);if(!prefix)return text;return text.replace(new RegExp('(<\\/?)'+prefix[1]+':','g'),'$1').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');}
(async()=>{const manifest={},audit=[];let done=0;
 for(const name of [...names].sort()){
  const original=fs.readFileSync(path.join(base,name)),svg=Buffer.from(normalize(original.toString('utf8'))),meta=await sharp(svg).metadata(),factor=Math.min(2,2600/meta.width,1800/meta.height),width=Math.max(1,Math.round(meta.width*factor)),height=Math.max(1,Math.round(meta.height*factor)),file=name.replace(/\.svg$/,'.webp').replaceAll('/','--');
  await sharp(svg).resize(width,height,{fit:'fill'}).webp({lossless:true,effort:4}).toFile(path.join(out,file));const size=fs.statSync(path.join(out,file)).size;
  manifest[name]={file,width,height};audit.push({name,sourceBytes:original.length,gzipSourceBytes:zlib.gzipSync(original).length,cacheBytes:size,width,height});
  if(++done%25===0)console.log('Cached '+done+' native static UI files');
 }
 fs.writeFileSync(path.join(out,'native-screen-assets.js'),'window.NativeUIScreenAssets='+JSON.stringify(manifest)+';\n');fs.writeFileSync(path.join(root,'reference/native-menu-cache-audit.json'),JSON.stringify(audit,null,2));
 for(const name of ['native-title-background.svg','native-profile-background.svg','native-campaign-flag-Blue.svg','native-world-1.svg']){const a=audit.find(a=>a.name===name);console.log(name+': SVG '+a.sourceBytes+' / gzip '+a.gzipSourceBytes+' -> lossless WebP '+a.cacheBytes+' bytes');}
 console.log('Done: '+audit.length+' static original UI caches.');
})().catch(e=>{console.error(e);process.exitCode=1;});
