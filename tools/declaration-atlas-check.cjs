'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const sharp=require('C:/Users/文韬武略/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.join(__dirname,'..'),base=path.join(root,'assets/takeover/ui/ultimate/atlases'),context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(base,'native-declarations.js'),'utf8'),context);
(async()=>{
 for(const [key,m]of Object.entries(context.window.NativeDeclarationAtlas)){
  assert.equal(m.cells.length,m.frames);for(const c of m.cells)if(c){assert(fs.existsSync(path.join(base,m.pages[c.page])));assert(c.ox>=0&&c.oy>=0&&c.ox+c.w<=800&&c.oy+c.h<=600);}
  const c=m.cells[24],source=await sharp(path.join(root,'reference/native-declaration-'+key+'-check.png')).ensureAlpha().raw().toBuffer(),tile=await sharp(path.join(base,m.pages[c.page])).extract({left:c.x,top:c.y,width:c.w,height:c.h}).ensureAlpha().raw().toBuffer();
  for(let y=0;y<c.h;y++)for(let x=0;x<c.w;x++){const a=((c.oy+y)*800+c.ox+x)*4,b=(y*c.w+x)*4;assert.equal(tile[b+3],source[a+3]);if(source[a+3])for(let k=0;k<3;k++)assert.equal(tile[b+k],source[a+k],'lossless original frame pixels');}
 }
 const requests=[],browser={window:{NativeDeclarationAtlas:context.window.NativeDeclarationAtlas},Map,Set,Math,Object,Promise,console,URL:{createObjectURL(){return'blob:fixture';},revokeObjectURL(){}},Image:class{set src(v){queueMicrotask(()=>this.onload());}},fetch(src){requests.push(src);return Promise.resolve({ok:true,blob:()=>Promise.resolve({})});}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'declaration-art.js'),'utf8'),browser);await browser.window.DeclarationArt.preload();assert.equal(requests.length,4,'entry must fetch one page per nation, not 189 SVGs and 77 bitmaps');
 console.log('Four native declaration sample frames retain exact visible RGBA pixels; battle entry requests only four first pages.');
})().catch(e=>{console.error(e);process.exitCode=1;});
