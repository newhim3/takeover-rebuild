'use strict';
const http=require('node:http'),net=require('node:net'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {accept}=require('../websocket-stream.cjs');
(async()=>{
 const server=http.createServer((req,res)=>res.end('ok')),sockets=new Set();
 let client,stream,closeCount=0,deadline,finAt;
 server.on('connection',socket=>{sockets.add(socket);socket.once('close',()=>sockets.delete(socket));});
 const streamClosed=new Promise(resolve=>server.on('upgrade',(req,socket,head)=>{
  stream=accept(req,socket,head);stream.on('close',()=>{closeCount++;resolve();});
 }));
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  client=net.createConnection({host:'127.0.0.1',port:server.address().port,allowHalfOpen:true});
  await new Promise((resolve,reject)=>{client.once('connect',resolve);client.once('error',reject);});
  const upgraded=new Promise((resolve,reject)=>{let response='';client.on('data',part=>{response+=part.toString();if(response.includes('\r\n\r\n')){if(!response.startsWith('HTTP/1.1 101 '))reject(Error('Upgrade failed'));else resolve();}});});
  client.write('GET /socket HTTP/1.1\r\nHost: 127.0.0.1\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: AAAAAAAAAAAAAAAAAAAAAA==\r\n\r\n');
  await upgraded;finAt=performance.now();client.end();
  await Promise.race([streamClosed,new Promise((_,reject)=>{deadline=setTimeout(()=>reject(Error('FIN left upgraded socket open')),1000);})]);
  assert.equal(stream.destroyed,true);assert.equal(closeCount,1);
  await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  assert.equal(sockets.size,0);
  const result={version:'r25',checkedAt:new Date().toISOString(),passed:true,closeCount,finToCloseMs:Math.round((performance.now()-finAt)*1000)/1000,check:'Real raw TCP WebSocket upgrade, client FIN, one close event and HTTP server.close completion.'};
  fs.writeFileSync(path.join(__dirname,'../.tools/r25-websocket-close-check.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
 }finally{clearTimeout(deadline);client?.destroy();for(const socket of sockets)socket.destroy();if(server.listening)server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
