"""Restore mission-over assets; keep faction/rating timelines independent."""
import copy,re,xml.etree.ElementTree as E
from pathlib import Path
S='{http://www.w3.org/2000/svg}';X='{http://www.w3.org/1999/xlink}href';F='{https://www.free-decompiler.com/flash}'
E.register_namespace('',S[1:-1]);E.register_namespace('xlink',X[1:-5])
base=Path('reference/native-results');out=Path('assets/takeover/ui/results');out.mkdir(exist_ok=True)
def read(cid,frame=1):return E.parse(next(base.glob(f'DefineSprite_{cid}_*'),base/f'DefineSprite_{cid}')/f'{frame}.svg').getroot()
def uses(r):return [e for e in r[0] if e.tag==S+'use']
def save(name,root,selections,view,strip_text=True):
 root=copy.deepcopy(root)
 for p in root.iter():
  for e in list(p):
   plain=re.sub(r'^(?:(?:Green|Red|Blue|Purple)_)+','',e.get('id',''))
   text_ref=re.match(r'^#(?:(?:Green|Red|Blue|Purple)_)*text',e.get(X,''))
   if strip_text and (text_ref or plain.startswith('txt') or plain in ['mcText','_hitArea']):p.remove(e)
   elif e.get(F+'characterId')=='2239':e.attrib.pop('filter',None)
 ids={e.get('id'):e for e in root.iter() if e.get('id')};wanted=set()
 def refs(e):
  for n in e.iter():
   names=([n.get(X)[1:]] if n.get(X,'').startswith('#') else [])
   for v in n.attrib.values():names+=re.findall(r'url\(#([^)]*)\)',v)
   for k in names:
    if k not in wanted and k in ids:wanted.add(k);refs(ids[k])
 svg=E.Element(S+'svg',{'viewBox':view});defs=E.SubElement(svg,S+'defs')
 for e in selections(root):refs(e);svg.append(copy.deepcopy(e))
 for k in sorted(wanted):defs.append(copy.deepcopy(ids[k]))
 E.ElementTree(svg).write(out/(name+'.svg'),encoding='utf8',xml_declaration=True)
def component(root,donor,prefix,selections):
 donor=copy.deepcopy(donor);renames={e.get('id'):prefix+e.get('id') for e in donor.iter() if e.get('id')}
 for e in donor.iter():
  for k,v in list(e.attrib.items()):
   if k=='id':e.set(k,renames[v])
   elif k==X and v.startswith('#'):e.set(k,'#'+renames.get(v[1:],v[1:]))
   elif 'url(#' in v:e.set(k,re.sub(r'url\(#([^)]*)\)',lambda m:'url(#'+renames[m[1]]+')',v))
 g=E.SubElement(donor,S+'g',{'id':prefix+'component'})
 for e in selections(donor):g.append(copy.deepcopy(e))
 E.SubElement(root,S+'defs').append(donor);return '#'+prefix+'component'
for country,palette in [('Green',1),('Red',2),('Blue',3),('Purple',2)]:
 if country=='Purple':
  # The original campaign chooser has the untinted black tapestry, without
  # a borrowed faction leader. It is appropriate for the added dark campaign.
  background=E.parse('reference/native-ui/DefineSprite_6708_scrChooseCampaignClass_scrChooseCampaignClass/1.svg').getroot()
  save('background-Purple',background,lambda r:[e for e in uses(r) if e.get(F+'characterId')=='2230'],'0 0 800 600')
 else:save('background-'+country,read(2231,palette),uses,'0 0 800 600')
 root=read(2388)
 # Keep the actual MissionOver LordPanel and its original coordinates.
 # Only its nation-specific mcPanel is replaced, not the whole throne UI.
 panel=next(e for e in root.iter() if e.get('id')=='mcPanel')
 donor=read(2243,palette)
 if country=='Purple':
  # Keep the native reusable border, but remove the actual Red leader art.
  # Empire CrestClass originates in the original intro's fourth country.
  empire=E.parse('assets/takeover/ui/empire-crest.svg').getroot()
  target=next(e for e in donor.iter() if e.get(F+'characterId')=='1515')
  target.set(X,component(donor,empire,'empire_',lambda r:[r[0]]))
  target.set(F+'characterId','6282');target.set('width','439');target.set('height','471')
  target.set('transform','matrix(.227 0 0 .227 4 -7.5)')
  target.attrib.pop('filter',None)
 # Strip the indicator here. Its original fill is rendered independently.
 for p in root.iter():
  for e in list(p):
   if e.get('id')=='mcXPIndicator':p.remove(e)
 panel.set(X,component(root,donor,country+'_',uses))
 # Source frame bounds place the border 0.35 px outside the scene. The
 # NEW tab's skewed right tip reaches x=805.95; move just that tab inward.
 panel.set('transform','matrix(1 0 0 1 -211.25 -36)')
 tab=next(e for e in root.iter() if e.get(F+'characterId')=='2255')
 tab.set('transform','matrix(.9397 0 .141 .9696 121.3 15.3)')
 save('chrome-'+country,root,lambda r:[e for e in uses(r) if e.get('id')=='_-WQ' or e.get(F+'characterId')=='2236' or e.get('id')=='_-Pv'],'0 0 800 600')
for country,palette in [('Green',1),('Red',2),('Blue',3),('Purple',4)]:
 save('stripe-'+country,read(2321,palette),lambda r:[e for e in uses(r) if e.get('id') not in ['mcUnitPurchased','mcUnitLost','mcResGold','mcResMana','mcSpellCast','mcKnSeized','mcKnLost','mcDefeatedRibon']],'-85 -3 825 106')
save('defeated-ribbon',read(2321),lambda r:[e for e in uses(r) if e.get('id')=='mcDefeatedRibon'],'-85 -3 825 106')
for win,frame in [('victory',1),('defeat',11)]:save(win,read(2261,frame),uses,'-90 -25 180 40',False)
for stars,frame in [(1,2),(2,3),(3,4)]:
 root=read(2388);status=next(e for e in uses(root) if e.get('id')=='mcStatus')
 status.set(X,component(root,read(2357,frame),'rating_',lambda r:[e for e in uses(r) if e.get(F+'characterId')!='2331']))
 save('rating-'+str(stars),root,lambda r:[e for e in uses(r) if e.get('id')=='mcStatus'],'0 0 800 600',False)
save('button',read(617),uses,'-95 -30 195 65')
for key,cid in [('purchased',2308),('lost',2311),('gold',2314),('magic',2317)]:
 for frame in range(1,101):save(f'bar-{key}-{frame}',read(cid,frame),lambda r:list(r[0]),'-76 -17 152 35')
for frame in range(1,101):save('xp-'+str(frame),read(2251,frame),lambda r:list(r[0]),'-20 -6 215 33')
print('Restored native result backgrounds/chrome, four faction stripes, victory/defeat lettering, three medals, OK button and 500 indicator frames.')
