exec(open('tools/extract_ui.py',encoding='utf-8-sig').read().split("for name,key in")[0])
for color,frameBase in [('Green',0),('Red',4),('Blue',8),('Purple',12)]:
 if color!='Purple':
  for i,key in enumerate(['fire','heal','summon']):extract('spell-'+color+'-'+key,'SpellIconSetClass',frameBase+i)
 for rank in [2,3]:
  for typ in ['Infantry','Archers','Cavalry','Siege']:
   faction={'Green':'W','Red':'K','Blue':'B','Purple':'E'}[color];key='IconT'+str(rank)+'_'+faction+'_'+typ+'Class';fallback='IconT1_'+faction+'_'+typ+'Class';extract('unit-'+color+'-'+typ+'-'+str(rank),key if key in m else fallback)
