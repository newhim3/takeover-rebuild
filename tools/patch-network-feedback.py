from pathlib import Path
def load(p):return Path(p).read_text(encoding='utf-8-sig')
def save(p,s):Path(p).write_text(s,encoding='utf-8')
def replace(s,a,b):
    if a not in s:raise RuntimeError(a[:100])
    return s.replace(a,b)
s=load('multiplayer-server.cjs')
s=replace(s,"difficulty:r.difficulty,speed:","difficulty:r.difficulty,includeAI:r.includeAI!==false,map:r.map||'small',speed:")
s=replace(s,"ai:Arena.countries.filter(c=>!r.players.some(p=>p.country===c))","ai:r.includeAI===false?[]:Arena.countries.filter(c=>!r.players.some(p=>p.country===c))")
s=replace(s,'return {sentAt:Date.now(),','return {sequence:r.sequence=(r.sequence||0)+1,sentAt:Date.now(),')
s=replace(s,"winner:b.winner||null,result:b.result","winner:b.winner||null,eliminated:b.eliminated||[],endReason:b.endReason||null,result:b.result")
s=replace(s,"events:b.events,","events:b.events.slice(0,8),")
a=s.index('function send(');z=s.index('function emitRoom',a)
s=s[:a]+'''function send(r,event,payload){const line=`event: ${event}\\ndata: ${JSON.stringify(payload)}\\n\\n`;for(const stream of r.streams){if(stream.destroyed)continue;if(event==='state'&&stream.writableLength>32768){stream.latestState=line;continue;}if(event==='state')stream.latestState=null;stream.write(line);}}
function acceptCommand(r,p,input){if(!Number.isSafeInteger(input.commandId)||input.commandId<=0)fail('指令编号无效');if(input.commandId<=(p.lastCommand||0))return {ok:true,duplicate:true,commandId:input.commandId};const now=Date.now();if(now-(p.rateAt||0)>1000){p.rateAt=now;p.rateCount=0;}if(++p.rateCount>80)fail('操作过于频繁');if(r.speed===0&&r.battle&&!r.battle.result){r.deferred??=[];if(r.deferred.length>=256)fail('暂停指令已满，请恢复对局');r.deferred.push({playerId:p.id,command:input.command,commandId:input.commandId});}else command(r,p,input.command);p.lastCommand=input.commandId;return {ok:true,queued:r.speed===0,commandId:input.commandId};}
function roomSpeed(r,p,value){if(p.id!==r.host)fail('只有房主能调整时间流速');if(!r.battle||![0,1,2,3].includes(value))fail('时间流速无效');r.speed=value;if(value>0){const queued=r.deferred||[];r.deferred=[];for(const item of queued){const member=r.players.find(q=>q.id===item.playerId);if(!member)continue;try{command(r,member,item.command);}catch(e){for(const stream of r.streams)if(stream.playerId===member.id)stream.write(`event: commandRejected\\ndata: ${JSON.stringify({commandId:item.commandId,error:e.message})}\\n\\n`);}}}emitRoom(r);send(r,'state',snapshot(r));}
''' +s[z:]
s=replace(s,"r.streams.add(stream);stream.playerId=p.id;","r.streams.add(stream);stream.playerId=p.id;stream.on('drain',()=>{if(stream.latestState&&!stream.destroyed){const latest=stream.latestState;stream.latestState=null;stream.write(latest);}});stream.on('message',message=>{if(message?.event!=='command')return;try{r.last=Date.now();const ack=acceptCommand(r,p,message.data);stream.send?.({event:'commandAck',data:ack});}catch(error){stream.send?.({event:'commandRejected',data:{commandId:message.data?.commandId,error:error.message}});}});")
s=replace(s,"difficulty:'normal',host:p.id","difficulty:'normal',includeAI:false,map:'small',host:p.id")
a=s.index(" if(a==='command')");z=s.index(" if(a==='leave')",a)
s=s[:a]+" if(a==='command'){json(res,200,acceptCommand(r,p,input));return true;}\n if(a==='speed'){roomSpeed(r,p,input.speed);json(res,200,{ok:true,room:view(r)});return true;}\n"+s[z:]
s=replace(s,'r.difficulty=input.difficulty;r.limit=input.limit;','r.difficulty=input.difficulty;r.limit=input.limit;if(input.includeAI!==undefined){if(typeof input.includeAI!==\'boolean\')fail(\'AI 设置无效\');r.includeAI=input.includeAI;}if(input.map!==undefined){if(![\'small\',\'highlands\'].includes(input.map))fail(\'地图无效\');r.map=input.map;}')
s=replace(s,'Arena.create(data,r.players)','Arena.create(data,r.players,{includeAI:r.includeAI!==false,map:r.map})')
s=replace(s,"r.phase='battle';send(r,'start'","r.battle.matchHumanOwners=r.players.map(p=>p.country);r.phase='battle';send(r,'start'")
s=replace(s,"send(r,'state',snapshot(r,tick%20===0));","if(tick%2===0||r.battle.result)send(r,'state',snapshot(r,tick%20===0));")
save('multiplayer-server.cjs',s)
s=load('multiplayer-client.js')
s=replace(s,'commandQueue=Promise.resolve();','commandQueue=Promise.resolve(),socketGeneration=0,latestSequence=-1,wirePending=new Map();')
s=replace(s,"$('pauseBadge').classList.toggle('hidden',!!speed);if(!speed)$('pauseBadge').innerHTML='对局暂停 <small>由房主恢复</small>';","$('pauseBadge').classList.add('hidden');")
s=replace(s,'2–4 位玩家，空缺国家由 AI 控制。','2–4 位玩家，可选择纯玩家对战或加入其他 AI 国家。')
s=replace(s,"stream?.close();\n const handlers=", "stream?.close();const generation=++socketGeneration;\n const handlers=")
s=replace(s,'fault(v){status(v.error);}',"commandAck(v){wirePending.delete(v.commandId);},commandRejected(v){wirePending.delete(v.commandId);for(const [id,pending] of pendingOrders)if(pending.commandId===v.commandId)pendingOrders.delete(id);status(v.error);},fault(v){status(v.error);}")
s=replace(s,"stream={close(){closed=true;clearTimeout(retry);socket?.close();}};","stream={send(data){if(socket?.readyState!==WebSocket.OPEN)return false;socket.send(JSON.stringify(data));return true;},close(){closed=true;clearTimeout(retry);socket?.close();}};")
s=replace(s,"socket.onopen=()=>{attempt=0;status('');};socket.onmessage=e=>{try{","socket.onopen=()=>{attempt=0;status('');for(const [id,value] of wirePending)stream.send({event:'command',data:{commandId:id,command:value}});};socket.onmessage=e=>{if(closed||generation!==socketGeneration)return;try{")
s=replace(s,"<label>AI 难度<select", "<label>其他国家<select id=\"lobbyAI\" ${host?'':'disabled'}><option value=\"off\" ${room.includeAI===false?'selected':''}>纯玩家对战</option><option value=\"on\" ${room.includeAI!==false?'selected':''}>加入 AI 国家</option></select></label><label>地图<select id=\"lobbyMap\" ${host?'':'disabled'}><option value=\"small\" ${room.map!=='highlands'?'selected':''}>原版中央村庄</option><option value=\"highlands\" ${room.map==='highlands'?'selected':''}>B 中央高地 · 大地图</option></select></label><label>AI 难度<select")
s=replace(s,"'AI · '+Difficulty.get(room.difficulty).label","room.includeAI===false?'空缺 · 不参战':'AI · '+Difficulty.get(room.difficulty).label")
s=replace(s,'其他国家由 AI 接手。','空缺国家是否参战由房主设置。')
s=replace(s,"limit:Number($('edictLimit').value)","limit:Number($('edictLimit').value),includeAI:$('lobbyAI').value==='on',map:$('lobbyMap').value")
s=replace(s,'if(!world||!mine())return;player=mine().country;',"if(!world||!mine())return;if(!first&&state.sequence!=null&&state.sequence<=latestSequence)return;latestSequence=state.sequence??latestSequence;player=mine().country;")
s=replace(s,'motion.reset();definitions.clear();pendingOrders.clear();','motion.reset();definitions.clear();pendingOrders.clear();wirePending.clear();')
s=replace(s,"remote.result=state.winner?(state.winner===player?'victory':'defeat'):null;","remote.result=state.result==='finished'?(state.winner===player?'victory':'defeat'):null;")
a=s.index('function render()');z=s.index('function setSpeed',a)
s=s[:a]+'''function render(){if(!api.active||!remote)return;const now=performance.now(),sample=motion.sample(now);if(!sample)return;
 const state=sample.state;Object.assign(remote,state);remote.units=[...sample.units.values()].map(u=>({...u,order:u.order&&{...u.order},path:(u.path||[]).map(p=>({...p}))}));remote.player=player;remote.data=world;remote.bonuses=Progression.bonuses(player,remote.factionEdicts[player]);remote.spellCd=player===serverPlayer?state.spellCd:state.factions[player].spellCd||{};remote.ultimateCharge=player===serverPlayer?state.ultimateCharge:state.factions[player].ultimateCharge||0;remote.ultimateDuration=120*(1+(remote.bonuses[12]||0)/100);remote.time=sample.time;remote.result=state.result==='finished'?(state.winner===player?'victory':'defeat'):null;
 for(const u of remote.units){const pending=pendingOrders.get(u.id);if(pending&&(state.acknowledged?.[player]||0)>=pending.commandId){pendingOrders.delete(u.id);continue;}if(pending){u.order=pending.order;u.path=pending.path.map(p=>({...p}));}if(pending&&now-pending.at<250&&speed>0){const dt=Math.max(0,Math.min(.04,(now-(pending.renderAt||pending.at))/1000))*speed;pending.renderAt=now;const visual=pending.visual;let budget=u.stats.speed*.88*dt;while(budget>0&&visual.path.length){const p=visual.path[0],d=Math.hypot(p.x-visual.x,(p.y-visual.y)*2);if(d<.01){visual.path.shift();continue;}const step=Math.min(budget,d);visual.x+=(p.x-visual.x)/d*step;visual.y+=(p.y-visual.y)/d*step;visual.walkDistance+=step;budget-=step;if(step>=d)visual.path.shift();}u.x=visual.x;u.y=visual.y;u.walkDistance=visual.walkDistance;u.visualHeading=visual.visualHeading;if(visual.path.length)u.state='move';}u.anim=(u.anim||0)+sample.elapsed*(speed||0);}
 remote.effects=(state.effects||[]).map(e=>({...e,renderTime:sample.elapsed*(speed||0)}));battle=remote;if(remote.result&&!handledResult)finish();}
''' +s[z:]
s=replace(s,"commandQueue=commandQueue.catch(()=>{}).then(()=>request('/api/rooms/'+code+'/action',{token:auth,action:'command',command:value,commandId:id})).catch(e=>{", "wirePending.set(id,value);if(stream?.send({event:'command',data:{command:value,commandId:id}}))return null;commandQueue=commandQueue.catch(()=>{}).then(()=>request('/api/rooms/'+code+'/action',{token:auth,action:'command',command:value,commandId:id})).then(()=>wirePending.delete(id)).catch(e=>{wirePending.delete(id);")
s=replace(s,'room=null;secret=null;','room=null;secret=null;latestSequence=-1;wirePending.clear();')
s=replace(s,"'胜者：'+COLOR_NAMES[battle.winner]","battle.winner?'胜者：'+COLOR_NAMES[battle.winner]:battle.endReason==='humans-eliminated'?'全部玩家已被淘汰，对局结束':'本局结束'")
save('multiplayer-client.js',s)
