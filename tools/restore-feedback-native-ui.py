"""Restore native popup framing and reusable settlement decoration."""
from pathlib import Path
import re, copy, xml.etree.ElementTree as E
ROOT=Path.cwd();S='{http://www.w3.org/2000/svg}';X='{http://www.w3.org/1999/xlink}href'
import sys,json,base64
sys.path.insert(0,str(ROOT/'.tools/video'))
from PIL import Image
E.register_namespace('',S[1:-1]);E.register_namespace('xlink',X[1:-5])
# Keep the original shared geometry/gold border. Only the wrong Red colour
# layer in the added Empire palette changes; its real fourth crest is intact.
palette={'#9c3e16':'#442e54','#ffbd76':'#c7adcf','#faa967':'#b799c3','#ea8a62':'#9779a9','#cb3f2e':'#68497c','#ae0404':'#43274e','#de7143':'#755583'}
for variant in range(1,5):
 r=E.parse(ROOT/f'assets/takeover/ui/native-level-info-Purple-{variant}.svg').getroot()
 ids={e.get('id'):e for e in r.iter() if e.get('id')};mc=next(e for e in r if e.get('id')=='mcColor');queue=[mc];seen=set()
 while queue:
  group=queue.pop()
  for n in group.iter():
   for key in ['fill','stroke','stop-color']:
    value=n.get(key,'').lower()
    if value in palette:n.set(key,palette[value])
   ref=n.get(X,'').lstrip('#')
   if ref in ids and ref not in seen:seen.add(ref);queue.append(ids[ref])
 E.ElementTree(r).write(ROOT/f'assets/takeover/ui/native-level-info-Purple-restored-{variant}.svg',encoding='utf-8',xml_declaration=True)
# The native gold crowns are split from their English glyphs at export.
namespace={}
exec((ROOT/'tools/restore-native-results.py').read_text(encoding='utf-8-sig').split('for country,palette')[0],namespace)
for stars,frame in [(1,2),(2,3),(3,4)]:
 namespace['save']('crown-'+str(stars),namespace['read'](2357,frame),lambda r:[e for e in namespace['uses'](r) if e.get('{https://www.free-decompiler.com/flash}characterId')!='2331'],'-65 -85 130 95',True)
# Stable standard encoding for Chinese browsers' XML parsers.
for f in (ROOT/'assets/takeover/ui/results').glob('crown-*.svg'):
 f.write_text(f.read_text(encoding='utf-8').replace("encoding='utf8'","encoding='utf-8'"),encoding='utf-8')
print('Restored 4 Empire native popup colour layers and 3 original crowns.')

# Replace the traced Empire controls with original reusable controls and its
# actual crest. The supplied update video provides the plain throne backdrop.
video=Image.open(ROOT/'reference/new-videos/dark-edicts-clean.png')
video.crop((0,0,80,300)).save(ROOT/'assets/takeover/ui/empire-throne-background.png')
F='{https://www.free-decompiler.com/flash}'
crest=E.parse(ROOT/'assets/takeover/ui/empire-crest.svg').getroot()
for target,source in [('native-edicts-Purple','native-edicts-Green'),('native-world-controls-Purple','native-world-controls-Green')]:
 r=E.parse(ROOT/f'assets/takeover/ui/{source}.svg').getroot()
 for n in list(r.iter()):
  if n.tag==S+'use' and n.get(F+'characterId')=='1512':
   n.set(X,namespace['component'](r,crest,'EmpireNative_',lambda a:[e for e in a if e.tag!=S+'defs' and e.get('id')!='EmpireNative_component']))
   n.set('transform','matrix(.227 0 0 .227 4 -7.5)');n.attrib.pop('filter',None)
  elif target=='native-edicts-Purple' and n.tag==S+'use' and n.get(F+'characterId')=='6743':
   data='data:image/png;base64,'+base64.b64encode((ROOT/'assets/takeover/ui/empire-throne-background.png').read_bytes()).decode()
   n.tag=S+'image';n.attrib.clear();n.set(X,data);n.set('width','800');n.set('height','600');n.set('preserveAspectRatio','none')
 E.ElementTree(r).write(ROOT/f'assets/takeover/ui/{target}.svg',encoding='utf-8',xml_declaration=True)

# English button captions are vector sprites named mcText, not text fields.
# Remove only those captions and the fixed XP sample; retain every native frame.
for glob in ['native-edicts-*.svg','native-world-controls-*.svg','native-world-node-*.svg']:
 for path in (ROOT/'assets/takeover/ui').glob(glob):
  r=E.parse(path).getroot()
  for parent in r.iter():
   for child in list(parent):
    plain=re.sub(r'^(?:(?:Green|Red|Blue|Purple)_)+','',child.get('id',''))
    if plain in ['mcText','mcXPIndicator']:parent.remove(child)
  E.ElementTree(r).write(path,encoding='utf-8',xml_declaration=True)

# The original demolition button is in WindowVillageClass, not a menu icon.
meta=next(s for s in json.loads((ROOT/'assets/takeover/animation/anim_manifest.json').read_text(encoding='utf-8'))['sheets'] if s['key']=='WindowVillageClass')
atlas=Image.open(ROOT/'assets/takeover/animation'/meta['sheet'])
atlas.crop((311,55,375,115)).save(ROOT/'assets/takeover/ui/demolish.png')
print('Restored original Empire control framing, video backdrop and native demolition icon.')

# Full original start/profile scenes replace the earlier atlas-as-background.
namespace['out']=ROOT/'assets/takeover/ui'
for name,folder,keep in [
 ('native-title-background','DefineSprite_7090_scrTitleClass_scrTitleClass',{'mcBack'}),
 ('native-profile-background','DefineSprite_2722_scrChooseProfileClass_scrChooseProfileClass',{'mcBack','mcBackPanel','mcSlot0','mcSlot1','mcSlot2'})
]:
 r=E.parse(ROOT/'reference/native-ui'/folder/'1.svg').getroot()
 # Publishing logos and the path lettering are excluded from the Chinese UI.
 for parent in r.iter():
  for child in list(parent):
   if child.get('id') in ['mcText','mcLogoIriySoft','butArmorLogo','mcNewGameMessage'] or child.get(F+'characterId')=='2673':parent.remove(child)
 namespace['save'](name,r,lambda a:[e for e in namespace['uses'](a) if e.get('id') in keep],'0 0 800 600')
 path=ROOT/'assets/takeover/ui'/f'{name}.svg'
 path.write_text(path.read_text(encoding='utf-8').replace("encoding='utf8'","encoding='utf-8'"),encoding='utf-8')
