/* Static game delivery and authoritative room transport. */
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),network=require('./multiplayer-server.cjs');
const {createDiscovery}=require('./lan-discovery.cjs'),{createRelay}=require('./lan-relay.cjs');
const root=__dirname,types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.json':'application/json','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'},compressed=new Map();
function createServer(){require('./delivery-build.cjs').build();const build=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/<meta name="game-build" content="([a-f0-9]{16})">/)?.[1]||null,connections=new Set(),discovery=createDiscovery({build,rooms:()=>network.lanRooms?.()||[]}),relay=createRelay(discovery),server=http.createServer(async(req,res)=>{
 let url;try{url=new URL(req.url,'http://localhost');url.pathname=decodeURIComponent(url.pathname);}catch{res.writeHead(400).end();return;}
 if(relay.handle(req,res,url))return;
 if(await network.handle(req,res,url))return;
 const parts=url.pathname.split('/').filter(Boolean),publicPath=url.pathname==='/'||parts[0]==='assets'||parts.length===1&&(parts[0]==='index.html'||/\.(js|css)$/.test(parts[0])&&!parts[0].includes('check'));
 if(!publicPath){res.writeHead(404).end();return;}
 const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname)),ext=path.extname(file);
 if(!file.startsWith(root+path.sep)||parts.some(part=>part.startsWith('.'))||!['.html','.css','.js','.svg','.png','.jpg','.jpeg','.webp','.json','.mp3','.ogg','.wav','.ico','.woff','.woff2','.ttf','.pack'].includes(ext)){res.writeHead(403).end();return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
 try{const stat=await fs.promises.stat(file);if(!stat.isFile()){res.writeHead(404).end();return;}const etag='"'+stat.size+'-'+stat.mtimeMs+'"',versioned=/^[a-f0-9]{16}$/.test(url.searchParams.get('v')||''),cacheControl=versioned?'public, max-age=31536000, immutable':parts[0]==='assets'?'public, max-age=3600':'no-cache',headers={'Content-Type':types[ext]||'application/octet-stream','Cache-Control':cacheControl,'ETag':etag,'Vary':'Accept-Encoding','X-Content-Type-Options':'nosniff'};if(req.headers['if-none-match']===etag){res.writeHead(304,headers).end();return;}
 let data;if(/\b(?:gzip)\b/.test(req.headers['accept-encoding']||'')&&['.html','.js','.css','.svg','.json'].includes(ext)&&stat.size>1024){let entry=compressed.get(file);if(!entry||entry.etag!==etag){const raw=await fs.promises.readFile(file);const gzip=await new Promise((resolve,reject)=>zlib.gzip(raw,(error,result)=>error?reject(error):resolve(result)));entry={etag,data:gzip};if(compressed.size>=64)compressed.delete(compressed.keys().next().value);compressed.set(file,entry);}data=entry.data;headers['Content-Encoding']='gzip';}else data=await fs.promises.readFile(file);
 headers['Content-Length']=data.length;res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:data);
 }catch{if(!res.headersSent)res.writeHead(404).end('Not found');}
 });server.lanDiscovery=discovery;server.on('connection',socket=>{connections.add(socket);socket.once('close',()=>connections.delete(socket));});server.on('listening',()=>{const address=server.address();if(address&&typeof address==='object')discovery.start(address.port);});server.on('upgrade',(req,socket,head)=>{if(!relay.upgrade(req,socket,head))network.upgrade(req,socket,head);});
 // Stop streams before HTTP close waits on their long-lived connections.
 const originalClose=server.close;server.close=function(callback){relay.close();discovery.close();const result=originalClose.call(this,callback);for(const socket of connections)socket.destroy();return result;};server.on('close',()=>{relay.close();discovery.close();});return server;}
if(require.main===module)createServer().listen(Number(process.env.PORT)||4387,'0.0.0.0',()=>console.log('Game ready: http://127.0.0.1:4387/ — LAN / WebSocket rooms enabled'));
module.exports={createServer,network};
