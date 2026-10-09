from pathlib import Path
for name in ['progression.js','tools/restore-empire-edicts.py','reference/dark-art/edicts-video-audit.md']:
 p=Path(name);s=p.read_text(encoding='utf-8-sig');s=s.replace('攻击时士气提高 +15%','攻击附带恐惧效果 +15%').replace('攻击士气 +15%','攻击附带恐惧效果 +15%').replace('可召唤强化战士及亡灵法师','概率召唤精兵和魔法士');p.write_text(s,encoding='utf8')
p=Path('tools/restore-empire-edicts.py');s=p.read_text(encoding='utf-8-sig');s=s.replace("s=s.replace('else b[row.id]=row.value;', 'else b[row.id]=row.value;for(const [type,value] of Object.entries(row.upgrades||{}))b[type]=Math.max(b[type]||0,value);')", "s=s.replace('else b[row.id]=row.value;', 'else b[row.id]=row.value;for(const [type,value] of Object.entries(row.upgrades||{}))b[type]=Math.max(b[type]||0,value);') if 'Object.entries(row.upgrades||{})' not in s else s")
p.write_text(s,encoding='utf8')
