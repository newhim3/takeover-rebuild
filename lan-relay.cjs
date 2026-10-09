/* Same-origin room relay for a browser opened by the local launcher. */
'use strict';
const http=require('node:http'),{Transform}=require('node:stream');
const BASE='/api/lan/peer/',MAX_BODY=65536;
function localRequest(req){
 const address=String(req.socket.remoteAddress||'').replace(/^::ffff:/,'');if(address!=='::1'&&!/^127\./.test(address))return false;
 let host;try{host=new URL('http://'+req.headers.host);}catch{return false;}
 if(!['localhost','127.0.0.1','[::1]'].includes(host.hostname)||Number(host.port||80)!==req.socket.localPort)return false;
 if(req.headers['sec-fetch-site']==='cross-site')return false;
 if(req.headers.origin){try{const origin=new URL(req.headers.origin);if(origin.protocol!=='http:'||origin.host!==host.host)return false;}catch{return false;}}
 return true;
}
function json(res,status,error){if(res.headersSent){res.destroy();return;}res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify({error}));}
function route(url,method,upgrade=false){
 const match=url.pathname.match(/^\/api\/lan\/peer\/([a-f0-9]{16})(\/api\/rooms(?:\/([A-Z0-9]{6})\/(join|action|events|socket))?)$/);if(!match)return null;
 const leaf=match[4];if(upgrade?method!=='GET'||leaf!=='socket':leaf==='socket'||(leaf==='events'?method!=='GET':method!=='POST'))return null;
 if([...url.searchParams.keys()].some(k=>k!=='token')||url.search.length>256)return null;
 if(url.searchParams.has('token')&&!/^[a-f0-9]{48}$/.test(url.searchParams.get('token')))return null;
 if(url.search&&leaf!=='events'&&leaf!=='socket')return null;
 return {id:match[1],path:match[2]+url.search,stream:leaf==='events'};
}
function createRelay(discovery){
 const agent=new http.Agent({keepAlive:true,maxSockets:32,maxFreeSockets:8}),requests=new Set(),sockets=new Set();let closed=false;
 function track(request){requests.add(request);request.once('close',()=>requests.delete(request));return request;}
 function compatible(peer){const build=discovery.build;return !!build&&peer?.build===build;}
 function peerFor(req,url,upgrade){if(closed||!localRequest(req))return null;const target=route(url,req.method,upgrade);if(!target)return null;const peer=discovery.resolve(target.id);return peer&&compatible(peer)?{...target,...peer}:null;}
 function handle(req,res,url){
  if(!url.pathname.startsWith('/api/lan/'))return false;
  if(!localRequest(req)){json(res,403,'局域网发现仅供本机游戏访问');return true;}
  if(url.pathname==='/api/lan/peers'&&req.method==='GET'){discovery.refresh();res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(discovery.view()));return true;}
  const target=route(url,req.method,false),advertised=target&&discovery.resolve(target.id);if(advertised&&!compatible(advertised)){json(res,409,'房主与本机游戏版本不同，请更新为同一版本后加入');return true;}
  const peer=peerFor(req,url,false);if(!peer){json(res,404,'局域网主机未发现或连接已失效');return true;}
  const length=req.headers['content-length'];if(length&&(!/^\d+$/.test(length)||Number(length)>MAX_BODY)){json(res,413,'请求过大');return true;}
  const headers={host:`${peer.ip}:${peer.port}`,accept:peer.stream?'text/event-stream':'application/json'};if(req.method==='POST'){headers['content-type']='application/json';if(length)headers['content-length']=length;}
  let responseStarted=false,connectTimer,responseTimer,finished=false;
  const upstream=track(http.request({host:peer.ip,port:peer.port,path:peer.path,method:req.method,headers,agent},reply=>{
   responseStarted=true;clearTimeout(connectTimer);clearTimeout(responseTimer);
   res.writeHead(reply.statusCode,{'Content-Type':String(reply.headers['content-type']||'application/json; charset=utf-8'),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(peer.stream?{'X-Accel-Buffering':'no'}:{})});
   reply.on('error',()=>res.destroy());reply.on('end',()=>{finished=true;});reply.pipe(res);
  }));
  responseTimer=setTimeout(()=>upstream.destroy(Error('response timeout')),10000);responseTimer.unref();
  upstream.on('socket',socket=>{socket.setNoDelay(true);if(socket.connecting){connectTimer=setTimeout(()=>upstream.destroy(Error('connection timeout')),5000);connectTimer.unref();socket.once('connect',()=>clearTimeout(connectTimer));}});
  upstream.on('error',()=>{clearTimeout(connectTimer);clearTimeout(responseTimer);if(!responseStarted)json(res,504,'房主暂时无法连接，请检查同一网络和防火墙');else res.destroy();});
  req.on('aborted',()=>upstream.destroy());res.once('close',()=>{if(!finished)upstream.destroy();});
  if(req.method==='POST'){let bytes=0;const limit=new Transform({transform(part,encoding,callback){bytes+=part.length;if(bytes>MAX_BODY)callback(Error('request too large'));else callback(null,part);}});limit.on('error',()=>{upstream.destroy();json(res,413,'请求过大');});req.pipe(limit).pipe(upstream);}else upstream.end();
  return true;
 }
 function upgrade(req,socket,head){
  let url;try{url=new URL(req.url,'http://localhost');}catch{return false;}
  if(!url.pathname.startsWith(BASE))return false;
  const peer=peerFor(req,url,true);if(!peer||String(req.headers.upgrade).toLowerCase()!=='websocket'){socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return true;}
  const headers={host:`${peer.ip}:${peer.port}`,connection:'Upgrade',upgrade:'websocket'};for(const key of ['sec-websocket-key','sec-websocket-version','sec-websocket-protocol','sec-websocket-extensions'])if(req.headers[key])headers[key]=req.headers[key];
  const upstream=track(http.request({host:peer.ip,port:peer.port,path:peer.path,method:'GET',headers,agent:false}));
  let upgraded=false;const timeout=setTimeout(()=>upstream.destroy(Error('upgrade timeout')),8000);timeout.unref();
  upstream.on('upgrade',(reply,remote,initial)=>{
   clearTimeout(timeout);if(reply.statusCode!==101||socket.destroyed){remote.destroy();return;}upgraded=true;socket.setNoDelay(true);remote.setNoDelay(true);
   const fields=[];for(const key of ['upgrade','connection','sec-websocket-accept','sec-websocket-protocol','sec-websocket-extensions'])if(reply.headers[key])fields.push(key+': '+reply.headers[key]);socket.write('HTTP/1.1 101 Switching Protocols\r\n'+fields.join('\r\n')+'\r\n\r\n');
   sockets.add(socket);sockets.add(remote);const close=()=>{socket.destroy();remote.destroy();sockets.delete(socket);sockets.delete(remote);};socket.on('error',close);remote.on('error',close);socket.once('close',close);remote.once('close',close);
   if(initial.length)socket.write(initial);if(head.length)remote.write(head);remote.pipe(socket);socket.pipe(remote);
  });
  upstream.on('response',reply=>{reply.resume();clearTimeout(timeout);socket.end('HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\n\r\n');});
  upstream.on('error',()=>{clearTimeout(timeout);if(!upgraded&&!socket.destroyed)socket.end('HTTP/1.1 504 Gateway Timeout\r\nConnection: close\r\n\r\n');});socket.once('close',()=>{if(!upgraded)upstream.destroy();});upstream.end();return true;
 }
 return {handle,upgrade,close(){closed=true;for(const request of requests)request.destroy();requests.clear();for(const socket of sockets)socket.destroy();sockets.clear();agent.destroy();}};
}
module.exports={createRelay,localRequest,route};
