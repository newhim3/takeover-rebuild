exec(open('tools/extract_ui.py',encoding='utf-8-sig').read().split("for name,key in")[0])
for color,faction in [('Green','W'),('Red','K'),('Blue','B'),('Purple','E')]:
 for rank in [1,2,3]:
  key=f'IconT{rank}_{faction}_MagicClass';extract('unit-'+color+'-Magic'+('' if rank==1 else '-'+str(rank)),key if key in m else f'IconT1_{faction}_MagicClass')
