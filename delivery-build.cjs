/* Rebuild delivery bundles from the existing source order; original files stay editable. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
function build(root=__dirname){const manifest=JSON.parse(fs.readFileSync(path.join(root,'delivery-manifest.json'),'utf8'));
 let html=fs.readFileSync(path.join(root,'index.html'),'utf8');const versions=[];
 for(const [kind,files]of Object.entries(manifest)){const output=files.map(file=>'/* '+file+' */\n'+fs.readFileSync(path.join(root,file),'utf8')).join(kind==='scripts'?'\n;\n':'\n'),name=kind==='scripts'?'game-shell.js':'game-shell.css',target=path.join(root,name),hash=crypto.createHash('sha256').update(output).digest('hex').slice(0,16);versions.push(hash);if(kind==='scripts')new vm.Script(output,{filename:name});if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==output)fs.writeFileSync(target,output);html=html.replace(new RegExp(name.replace('.','\\.')+'\\?v=[^"\\s]+','g'),name+'?v='+hash);}
 const cacheHash=crypto.createHash('sha256').update(versions.join(':')).digest('hex').slice(0,16);html=html.replace(/<meta name="game-build" content="[^"]+">/g,'').replace('</head>','<meta name="game-build" content="'+cacheHash+'"></head>');
 if(fs.readFileSync(path.join(root,'index.html'),'utf8')!==html)fs.writeFileSync(path.join(root,'index.html'),html);
 const workerFile=path.join(root,'delivery-worker.js'),worker=fs.readFileSync(workerFile,'utf8'),updated=worker.replace(/VERSION='[^']+'/,"VERSION='"+cacheHash+"'");if(worker!==updated)fs.writeFileSync(workerFile,updated);
}
if(require.main===module)build();module.exports={build};
