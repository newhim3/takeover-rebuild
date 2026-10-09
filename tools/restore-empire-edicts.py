from pathlib import Path
import json
p=Path('progression.js');s=p.read_text(encoding='utf-8-sig')
a=s.index('// Independent Empire tree') if '// Independent Empire tree' in s else s.index('function tree(');z=s.index('function initial(',a)
def row(i,v,h,**kw): return dict(id=i,value=v,hint=h,**kw)
def node(n,title,gate,*rows): return dict(n=n,title=title,name=title,gate=gate,source='4国混战 video 00:00–00:05',levels=[dict(r,lvl=i) for i,r in enumerate(rows)])
D=[node(29,'冥主渴望',0,row(44,1,'掌握亵渎之旗'),row(6,25,'旗帜持续时间 +25%'),row(45,1,'腐蚀旗帜范围内的敌军')),
node(28,'冥权觉醒',0,row(0,0,'掌握基础亡灵兵种'),row(41,20,'击杀敌军小队获得 20 金币'),row(41,40,'击杀敌军小队获得 40 金币')),
node(31,'暗影号令',4,row(46,1,'掌握亡灵审判'),row(43,10,'10% 几率直接转化敌方单位'),row(43,20,'20% 几率直接转化敌方单位')),
node(30,'死亡馈赠',4,row(0,1,'步兵进阶为僵尸战士'),row(42,10,'击杀敌军小队获得 10 法力'),row(42,20,'击杀敌军小队获得 20 法力')),
node(33,'死影法则',7,row(4,1,'不死刺客进阶为阴魂'),row(12,-7,'终极技能冷却 -7%'),row(12,-15,'终极技能冷却 -15%')),
node(32,'亡械典籍',7,row(2,1,'射手及攻城机械进阶',upgrades={'3':1}),row(13,7,'弓箭 / 攻城武器伤害 +7%'),row(13,15,'弓箭 / 攻城武器伤害 +15%')),
node(35,'亡者集结',11,row(48,1,'掌握亡灵召唤'),row(49,1,'召唤强化的亡灵战士'),row(49,2,'概率召唤精兵和魔法士')),
node(34,'暗影试炼',11,row(1,1,'骑兵进阶为黑暗骑士'),row(47,15,'攻击附带恐惧效果 +15%'),row(7,50,'骑兵冲锋伤害 +50%')),
node(36,'帝国之怒',15,row(50,3,'终极法术最多转化 3 支敌军'),row(51,8,'所有亡灵单位伤害 +8%'),row(28,-8,'所有亡灵单位军费 -8%'))]
s=s[:a]+'// Independent Empire tree transcribed from the supplied update video, not the Khaganate tree.\nconst EMPIRE_EDICTS='+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\nfunction tree(color){if(color===\'Purple\')return EMPIRE_EDICTS;const start={Green:0,Red:9,Blue:18}[color];return EDICTS.slice(start,start+9);}\nfunction migrate(color,levels){if(color!==\'Purple\'||!Object.keys(levels||{}).some(n=>Number(n)>=10&&Number(n)<=18))return {...levels};const out={},mapping={10:29,11:28,12:31,13:33,14:30,15:32,16:35,17:32,18:34};for(const [n,v] of Object.entries(levels||{})){const key=mapping[n]||n;out[key]=Math.max(out[key]||0,Math.max(0,Math.min(3,v)));}return out;}\n'+s[z:]
s=s.replace("function bonuses(color,levels){const b={};", "function bonuses(color,levels){levels=migrate(color,levels);const b={};")
s=s.replace('else b[row.id]=row.value;', 'else b[row.id]=row.value;for(const [type,value] of Object.entries(row.upgrades||{}))b[type]=Math.max(b[type]||0,value);') if 'Object.entries(row.upgrades||{})' not in s else s
s=s.replace('const api={EDICTS,UNITS,FACTIONS,tree,initial,bonuses,unit}', 'const api={EDICTS,EMPIRE_EDICTS,UNITS,FACTIONS,tree,initial,migrate,bonuses,unit}')
p.write_text(s,encoding='utf8')
p=Path('flow.js');s=p.read_text(encoding='utf-8-sig');s=s.replace('c.edicts??=Progression.initial(player);','c.edicts??=Progression.initial(player);if(player===\'Purple\'){c.edicts=Progression.migrate(player,c.edicts);}') if "c.edicts=Progression.migrate" not in s else s
s=s.replace("--world-art:url('${UI_BASE}native-world-${frame}.svg')", "--world-art:url('${UI_BASE}${player==='Purple'?'native-world-Purple':'native-world-'+frame}.svg')")
s=s.replace('<h1>${COLOR_NAMES[player]}</h1><div class="world-nodes">','<h1>${COLOR_NAMES[player]}</h1>${player===\'Purple\'?`<img class="empire-world-crest" src="${UI_BASE}empire-crest.svg" alt="里瓦迪斯帝国">`:""}<div class="world-nodes">')
p.write_text(s,encoding='utf8')
p=Path('edicts-ui.js');s=p.read_text(encoding='utf-8-sig');s=s.replace('const v=row.value,labels=', 'if(row.hint&&player===\'Purple\')return row.hint;const v=row.value,labels=') if "if(row.hint&&player==='Purple')" not in s else s
s=s.replace("e.levels.map(r=>UnitArt.transition(player,r))", "e.levels.flatMap(r=>[r,...Object.entries(r.upgrades||{}).map(([id,value])=>({id:Number(id),value}))]).map(r=>UnitArt.transition(player,r))")
s=s.replace('native-edicts" style=', 'native-edicts" data-country="${player}" style=')
s=s.replace('<h1>王国条令</h1>', '<h1>${player===\'Purple\'?\'帝国条令\':\'王国条令\'}</h1>')
p.write_text(s,encoding='utf8')
