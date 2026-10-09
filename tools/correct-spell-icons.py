exec(open('tools/extract_ui.py',encoding='utf-8-sig').read().split("for name,key in")[0])
for color,start in [('Green',0),('Red',4),('Blue',8)]:
 for i,key in enumerate(['fire','heal','summon','ultimate']):extract('spell-'+color+'-'+key,'SpellIconSetClass',start+i)
# GamePanel selects spell.id + 1; exported sheets use zero-based frames.
# The base SWF strip only has twelve frames. Purple is restored from the newer video.
(out/'spell-icons-provenance.json').write_text(__import__('json').dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
