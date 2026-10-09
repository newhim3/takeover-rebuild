/* Local-subnet advertisements. No room tokens or arbitrary target URLs enter this directory. */
'use strict';
const dgram=require('node:dgram'),os=require('node:os'),net=require('node:net'),crypto=require('node:crypto');
const UDP_PORT=44987,GROUP='239.255.43.87',PROTOCOL='takeover-lan-v1',TTL=12000;
const validBuild=value=>typeof value==='string'&&/^[a-f0-9]{16}$/.test(value)?value:null;
function ipNumber(address){if(net.isIP(address)!==4)return null;return address.split('.').reduce((n,x)=>(n*256+Number(x))>>>0,0);}
function ipString(number){return [24,16,8,0].map(shift=>(number>>>shift)&255).join('.');}
function interfaces(){return Object.values(os.networkInterfaces()).flatMap(entries=>(entries||[]).filter(a=>(a.family==='IPv4'||a.family===4)&&!a.internal&&ipNumber(a.netmask)!==null));}
function onSubnet(address,adapters=interfaces()){
 const ip=ipNumber(address);if(ip===null)return false;if((ip>>>24)===127)return true;
 return adapters.some(a=>{const own=ipNumber(a.address),mask=ipNumber(a.netmask);if(mask===null||mask===0)return false;const network=(own&mask)>>>0,broadcast=(network|(~mask))>>>0;return ((ip&mask)>>>0)===network&&ip!==network&&ip!==broadcast;});
}
function publicRooms(rooms){return (Array.isArray(rooms)?rooms:[]).slice(0,32).filter(r=>r&&/^[A-Z0-9]{6}$/.test(r.code)).map(r=>({code:r.code,hostName:String(r.hostName||'房主').replace(/[\u0000-\u001f]/g,'').slice(0,16),phase:['lobby','battle','error'].includes(r.phase)?r.phase:'battle',players:Math.min(4,Math.max(0,Number(r.players)||0)),maxPlayers:4,canJoin:r.phase==='lobby'&&r.canJoin===true&&Number(r.players)<4,map:r.map==='highlands'?'highlands':'small'}));}
function createDiscovery({rooms=()=>[],name=process.env.LAN_NAME||os.hostname(),build=null,interval=3000}={}){
 const id=crypto.randomBytes(8).toString('hex'),label=String(name).replace(/[\u0000-\u001f]/g,'').slice(0,40),buildId=validBuild(build),peers=new Map(),replyAt=new Map();
 let socket=null,timer=null,httpPort=0,closed=false,enabled=false,degraded=false,error=null,lastQueryAt=0;
 const roomList=()=>{try{return publicRooms(rooms());}catch{return [];}};
 function advert(kind='announce'){return Buffer.from(JSON.stringify({protocol:PROTOCOL,kind,id,name:label,build:buildId,port:httpPort,rooms:roomList()}));}
 function send(buffer,port,address){if(!enabled||!socket)return;socket.send(buffer,port,address,()=>{});}
 function prune(){const now=Date.now(),adapters=interfaces();for(const [key,p] of peers)if(now-p.seen>TTL||!onSubnet(p.ip,adapters))peers.delete(key);for(const [key,time] of replyAt)if(now-time>TTL)replyAt.delete(key);return adapters;}
 function announce(){if(!enabled)return;prune();const buffer=advert('query'),targets=new Set(['255.255.255.255',GROUP]);for(const a of interfaces()){const mask=ipNumber(a.netmask);targets.add(ipString(((ipNumber(a.address)&mask)|(~mask))>>>0));}for(const target of targets)send(buffer,UDP_PORT,target);}
 function receive(buffer,remote){
  if(buffer.length>16384||!onSubnet(remote.address))return;
  let packet;try{packet=JSON.parse(buffer.toString());}catch{return;}
  if(!packet||packet.protocol!==PROTOCOL||!['query','announce'].includes(packet.kind)||!/^[a-f0-9]{16}$/.test(packet.id)||packet.id===id||!Number.isInteger(packet.port)||packet.port<1||packet.port>65535)return;
  // The source IP comes from the datagram, never a claimed payload address.
  prune();if(peers.has(packet.id)||peers.size<64)peers.set(packet.id,{id:packet.id,name:String(packet.name||'局域网主机').replace(/[\u0000-\u001f]/g,'').slice(0,40),build:validBuild(packet.build),ip:remote.address,port:packet.port,rooms:publicRooms(packet.rooms),seen:Date.now()});
  const replyKey=remote.address+':'+remote.port;if(packet.kind==='query'&&Date.now()-(replyAt.get(replyKey)||0)>750&&replyAt.size<128){replyAt.set(replyKey,Date.now());send(advert(),remote.port,remote.address);}
 }
 function bind(port,fallback=false){
  if(closed)return;const candidate=dgram.createSocket({type:'udp4',reuseAddr:true});socket=candidate;
  candidate.on('message',receive);candidate.on('error',e=>{
   if(socket!==candidate)return;enabled=false;error=e.code||'UDP_ERROR';
   try{candidate.close();}catch{}
   if(!fallback&&['EADDRINUSE','EACCES'].includes(e.code)){degraded=true;bind(0,true);}
  });
  candidate.on('listening',()=>{
   if(closed){candidate.close();return;}enabled=true;error=null;candidate.unref();
   try{candidate.setBroadcast(true);candidate.setMulticastTTL(1);candidate.setMulticastLoopback(true);}catch{}
   if(!fallback)for(const a of interfaces())try{candidate.addMembership(GROUP,a.address);}catch{}
   if(timer)clearInterval(timer);timer=setInterval(announce,Math.max(1000,interval));timer.unref();announce();
  });candidate.bind(port,'0.0.0.0');
 }
 return {
  build:buildId,
  start(port){if(closed||socket||!Number.isInteger(port)||port<1||port>65535)return;httpPort=port;bind(UDP_PORT);},
  refresh(){if(Date.now()-lastQueryAt<750)return;lastQueryAt=Date.now();announce();},
  resolve(peerId){const adapters=prune(),peer=peers.get(peerId);return peer&&onSubnet(peer.ip,adapters)?{...peer}:null;},
  view(){prune();return {lanProtocol:1,enabled,degraded,error,self:{id,name:label,build:buildId,port:httpPort,rooms:roomList()},peers:[...peers.values()].map(({seen,ip,...peer})=>({...peer,address:`http://${ip}:${peer.port}`})).sort((a,b)=>a.name.localeCompare(b.name))};},
  close(){closed=true;enabled=false;if(timer)clearInterval(timer);timer=null;if(socket){try{socket.close();}catch{}socket=null;}peers.clear();replyAt.clear();}
 };
}
module.exports={createDiscovery,onSubnet,publicRooms,validBuild,UDP_PORT,GROUP};
