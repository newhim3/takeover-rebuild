/* Portable local client/server package. Excludes personal logs, references and credentials. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'delivery-manifest.json'),'utf8'));
const files=new Set([...manifest.scripts,...manifest.styles,'index.html','delivery-manifest.json','delivery-build.cjs','delivery-worker.js','game-shell.js','game-shell.css','server.cjs','multiplayer-server.cjs','lan-discovery.cjs','lan-relay.cjs','websocket-stream.cjs','城邦征战.exe','局域网联机.exe','启动游戏.cmd','局域网联机.cmd','重启本地联机服务.cmd','启用局域网联机防火墙.cmd','移除局域网联机防火墙.cmd','tools/start-local-server.ps1','tools/configure-lan-firewall.ps1','.tools/native/node.exe','README.md','reference/同网联机使用与优化-r25-20261009.md','reference/单文件EXE使用说明-r26-20261009.md','reference/素材使用范围与单文件发布-r26-20261009.md']);
function walk(directory){for(const entry of fs.readdirSync(path.join(root,directory),{withFileTypes:true})){const relative=(directory+'/'+entry.name).replaceAll('\\','/');if(entry.isDirectory())walk(relative);else if(entry.isFile())files.add(relative);}}
let selection=null;
if(process.argv.includes('--runtime-only')){
 const config='config/runtime-assets.json',data=fs.readFileSync(path.join(root,config),'utf8').replace(/^\uFEFF/,''),audit=JSON.parse(data);
 if(audit.schemaVersion!==1)throw Error('Unsupported runtime asset config schema');
 if(!Array.isArray(audit.keep)||!audit.keep.length||new Set(audit.keep).size!==audit.keep.length)throw Error('Invalid audited asset list');
 if(audit.counts?.keepFiles!==audit.keep.length||!Number.isSafeInteger(audit.counts.excludedFiles)||audit.counts.excludedFiles<0)throw Error('Asset config counts do not match its keep list');
 for(const file of audit.keep){const absolute=path.resolve(root,file);if(!file.startsWith('assets/')||!absolute.startsWith(path.join(root,'assets')+path.sep)||!fs.statSync(absolute).isFile())throw Error('Invalid asset '+file);files.add(file);}
 selection={mode:'conservative-runtime',config,configHash:crypto.createHash('sha256').update(data).digest('hex'),keptAssets:audit.keep.length,excludedAssets:audit.counts.excludedFiles,counts:audit.counts};
}else walk('assets');
// Include relative CommonJS dependencies used by the authoritative server.
const queue=[...files].filter(file=>/\.(?:js|cjs)$/.test(file));
for(let i=0;i<queue.length;i++){
 const file=queue[i],source=fs.readFileSync(path.join(root,file),'utf8');
 for(const match of source.matchAll(/require\(\s*['"]((?:\.\/|\.\.\/)[^'"]+)['"]\s*\)/g)){
  const target=path.resolve(root,path.dirname(file),match[1]);if(!target.startsWith(root+path.sep))throw Error('Dependency leaves game directory');
  const absolute=[target,target+'.js',target+'.cjs',target+'.json'].find(candidate=>fs.existsSync(candidate)&&fs.statSync(candidate).isFile());if(!absolute)throw Error('Missing dependency '+match[1]);
  const relative=path.relative(root,absolute).replaceAll('\\','/');if(!files.has(relative)){files.add(relative);if(/\.(?:js|cjs)$/.test(relative))queue.push(relative);}
 }
}
const entries=[...files].sort().map(file=>{const absolute=path.join(root,file),stat=fs.statSync(absolute),data=fs.readFileSync(absolute);if(data.length<1024&&data.toString('utf8',0,128).startsWith('version https://git-lfs.github.com/spec/v1'))throw Error('Git LFS object not downloaded: '+file+'; run git lfs pull');return{file,bytes:stat.size,sha256:crypto.createHash('sha256').update(data).digest('hex')};});
const build=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/name="game-build" content="([^"]+)"/)[1];
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/lan-package-manifest.json'),JSON.stringify({build,selection,entries,totalBytes:entries.reduce((n,e)=>n+e.bytes,0)},null,2)+'\n');
console.log(JSON.stringify({build,files:entries.length,totalMB:Math.round(entries.reduce((n,e)=>n+e.bytes,0)/104857.6)/10,manifest:'dist/lan-package-manifest.json'}));
