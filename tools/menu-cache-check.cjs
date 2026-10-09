'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const sharp=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.join(__dirname,'..'),base=path.join(root,'assets/takeover/ui'),context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(base,'atlases/screens/native-screen-assets.js'),'utf8'),context);
let loads=0,decodes=0;context.Map=Map;context.Image=class{constructor(){this.complete=true;this.naturalWidth=800;}set src(v){loads++;this.onload();}decode(){decodes++;return Promise.resolve();}};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'ui.js'),'utf8'),context);
(async()=>{
 const first=vm.runInContext('nativeUIAsset("native-title-background.svg")',context),second=vm.runInContext('nativeUIAsset("native-title-background.svg")',context);assert.equal(first,second);assert.equal(loads,1);assert.equal(decodes,1,'returning to an already loaded scene must reuse its existing image');assert(fs.readFileSync(path.join(root,'original-ui.css'),'utf8').includes(first));
 const manifest=context.window.NativeUIScreenAssets;for(const [name,a]of Object.entries(manifest)){assert(fs.existsSync(path.join(base,'atlases/screens',a.file)));context.name=name;vm.runInContext('nativeUIAsset(name)',context);}assert(context.window.NativeMenuCache.stats().estimatedDecodedMiB<=64.1,'retained menus must remain bounded');
 for(const name of ['native-title-background.svg','native-world-1.svg','results/row-Blue.svg']){
  const a=manifest[name];let text=fs.readFileSync(path.join(base,name),'utf8'),prefix=text.match(/<([\w]+):svg\b/);if(prefix)text=text.replace(new RegExp('(<\\/?)'+prefix[1]+':','g'),'$1').replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
  const expected=await sharp(Buffer.from(text)).resize(a.width,a.height,{fit:'fill'}).ensureAlpha().raw().toBuffer(),actual=await sharp(path.join(base,'atlases/screens',a.file)).ensureAlpha().raw().toBuffer();assert.equal(expected.length,actual.length);
  for(let i=0;i<actual.length;i+=4){assert.equal(actual[i+3],expected[i+3]);if(expected[i+3])for(let k=0;k<3;k++)assert.equal(actual[i+k],expected[i+k],'original visible pixels must remain unchanged');}
 }
 console.log('Repeated menu access reuses one load/decode; retained image budget <= 64 MiB; all cache files exist; title/world/result-row visible pixels match original rasterization.');
})().catch(e=>{console.error(e);process.exitCode=1;});
