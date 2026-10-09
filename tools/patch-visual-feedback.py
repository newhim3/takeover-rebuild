from pathlib import Path
def load(p):return Path(p).read_text(encoding='utf-8-sig')
def save(p,s):Path(p).write_text(s,encoding='utf-8')
def r(s,a,b):
    if a not in s:raise RuntimeError(a[:90])
    return s.replace(a,b)
s=load('game.js')
s=r(s,"terrainKey='';\nconst inWorldOrders", "terrainKey='',localPausedCommands=[];\nconst inWorldOrders")
s=r(s,"function active(){return started&&!paused&&!battle.result", "function active(){return started&&!battle.result")
s=r(s,"function reset(){battle=new Battle", "function queueLocalActions(){localPausedCommands=[];for(const method of ['recruit','build','upgrade','demolish','command','cast']){const execute=battle[method].bind(battle);battle[method]=(...args)=>{if(!paused)return execute(...args);if(localPausedCommands.length>=256)return '暂停指令已满';const copied=structuredClone(args);localPausedCommands.push(()=>execute(...copied));return null;};}}\nfunction flushLocalActions(){const commands=localPausedCommands;localPausedCommands=[];for(const execute of commands){const error=execute();if(error)battle.emit('暂存指令未执行：'+error);}}\nfunction reset(){battle=new Battle")
s=r(s,'unitIds.clear();selected={type:', 'queueLocalActions();unitIds.clear();selected={type:')
s=r(s,"if(active()){let remaining=", "if(active()&&!paused){let remaining=")
s=r(s,"paused=!paused;$('pause').textContent=paused?'继续':'暂停';$('pauseBadge').classList.toggle('hidden',!paused);", "paused=!paused;$('pause').textContent=paused?'继续':'暂停';$('pauseBadge').classList.add('hidden');if(!paused)flushLocalActions();")
s=r(s,"for(const id of unitIds){const u=battle.unit(id);if(u){u.order=null;u.path=[];u.pathTarget=null;u.combatTarget=null;u.pendingAttack=null;u.attackTarget=null;u.defendHome=null;u.stance='hold';}}", "const ids=[...unitIds],execute=()=>{for(const id of ids){const u=battle.unit(id);if(u){u.order=null;u.path=[];u.pathTarget=null;u.combatTarget=null;u.pendingAttack=null;u.attackTarget=null;u.defendHome=null;u.stance='hold';}}};if(paused)localPausedCommands.push(execute);else execute();")
s=r(s,"if(e.code==='Space'){e.preventDefault();togglePause();return;}", "if(e.code==='Space'){e.preventDefault();if(!e.repeat)togglePause();return;}")
s=r(s,"farm:'人口上限 +2 支部队'", "farm:'人口上限 +1 支部队'")
s=r(s,"farm:'人口 +2 队'", "farm:'人口 +1 队'")
s=r(s,"actionButton('',BUILD[s.type].name,benefit,disabled,()=>{});$('actions').lastElementChild.querySelector('small').textContent=benefit;", "")
s=r(s,"actionButton('','返回城堡','招募或升级',disabled,()=>setSelection('building',s.parent));$('actions').lastElementChild.querySelector('small').textContent='招募 / 升级';", "")
s=r(s,"sprite(ctx,buildingArt(b),b.x,b.y);", "const art=buildingArt(b),animated=art.replace('Class','AnimClass'),key=GAME_DATA.sprites[animated]?animated:art;sprite(ctx,key,b.x,b.y,1,battle.time*30);")
s=r(s,"sprite(ctx,key,s.x,s.y);return;", "const animated=key.replace('Class','AnimClass');sprite(ctx,GAME_DATA.sprites[animated]?animated:key,s.x,s.y,1,battle.time*30);return;")
s=r(s,"const scale=Math.min(960/880,600/620);return{scale,x:500-400*scale,y:20+20*scale};", "const scale=Math.min(950/battle.width,560/battle.height);return{scale,x:500-battle.width/2*scale,y:300-battle.height/2*scale};")
s=r(s,"img(buildingArt(b));", "{const key=buildingArt(b);img(key);if(GAME_DATA.sprites[key.replace('Class','AnimClass')])img(key.replace('Class','AnimClass'));}for(let n=1;n<=100;n++){uiBitmap('badge-health-'+n+'.svg');}for(const owner of Object.keys(battle.factions)){if(owner==='Gray')continue;for(let n=1;n<=100;n++)uiBitmap('building-health-'+owner+'-'+n+'.svg');}")
s=r(s,"if(window.DeclarationArt)", "if(battle.data.nativeLevel==='highlands')HighlandsTerrain.load();if(window.DeclarationArt)")
s=r(s,"const native=window.NativeMaps[terrainLevel];if(!native)", "const native=window.NativeMaps[terrainLevel];if(!native)")
s=r(s,"script.src='assets/takeover/maps/level-'+terrainLevel+'.js';", "script.src=terrainLevel==='highlands'?'highlands-terrain.js':'assets/takeover/maps/level-'+terrainLevel+'.js';")
s=r(s,"if(!image.src.endsWith(path))image.src=path;", "if(image.dataset.spellPath!==path){image.dataset.spellPath=path;image.src=path;}")
s=r(s,'金币基础收入每秒 1，成功修复占领的城堡每秒再加 2，小镇或魔法塔加 1。','每座开局城堡提供每秒 1 金，后来占领的城堡另加 1，小镇或魔法塔占领后加 1。')
save('game.js',s)
s=load('multiplayer-client.js')
s=r(s,"const now=performance.now();syncSpan=", "const now=performance.now();syncSpan=")
s=r(s,"Object.assign(remote,state);for(const [owner,values]", "Object.assign(remote,state);remote.units=state.units.map(u=>({...u,order:u.order&&{...u.order},path:(u.path||[]).map(p=>({...p}))}));for(const [owner,values]")
s=r(s,"if((state.acknowledged?.[player]||0)>=pending.commandId){pendingOrders.delete(id);continue;}", "if((state.acknowledged?.[player]||0)>=pending.commandId)continue;")
s=r(s," if(battle.result&&!handledResult)finish();", "")
save('multiplayer-client.js',s)
# Native SVG bounds, not a CSS trim: rating art extends below the old -9 y bound.
import xml.etree.ElementTree as E
E.register_namespace('','http://www.w3.org/2000/svg');E.register_namespace('xlink','http://www.w3.org/1999/xlink')
for p in Path('assets/takeover/ui').glob('native-world-rating-*.svg'):
    root=E.parse(p).getroot();root.set('viewBox','-42 -48 84 70');E.ElementTree(root).write(p,encoding='utf-8',xml_declaration=True)
for country in ['Red','Green']:
    p=Path('assets/takeover/ui/native-world-node-'+country+'.svg');root=E.parse(p).getroot()
    for n in root:
        if n.tag.endswith('use'):n.attrib.pop('filter',None)
    E.ElementTree(root).write(p,encoding='utf-8',xml_declaration=True)
s=load('native-world.css')+'''
/* Native crown viewBox includes its lower tips. Position its full footprint. */
body .native-world[data-country] .world-nodes button .level-completed-marker{top:-4%!important;width:68%!important;height:48%!important;overflow:visible!important}
body .native-world[data-country=Purple] .world-nodes button .level-completed-marker{top:-10%!important}
body .native-world[data-country] .world-rank{left:55.6%;top:87.5%;width:7.8%;height:8.3%;display:flex;align-items:center;justify-content:center;line-height:1;font-size:3.8cqw}
body .native-world[data-country] .world-rank small{position:absolute;left:0;right:0;top:100%;font-size:1cqw}
'''
save('native-world.css',s)
s=load('index.html').replace('20261006-r1','20261006-r2').replace('snapshot-motion.js?v=20261006"','snapshot-motion.js?v=20261006-r2"')
s=s.replace('<script src="game.js','<script src="highlands-terrain.js?v=20261006-r2"></script><script src="game.js')
save('index.html',s)
