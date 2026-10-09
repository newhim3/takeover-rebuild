from pathlib import Path
import xml.etree.ElementTree as E
from collections import Counter
F='{https://www.free-decompiler.com/flash}';X='{http://www.w3.org/1999/xlink}href'
r=E.parse('reference/native-ui/DefineSprite_8465/1.svg').getroot()
for e in r[0]:
 if e.tag.endswith('use'): print(e.get(F+'characterId'),e.get(X),e.get('transform'))
for p in ['assets/takeover/ui/native-world-controls-Red.svg','assets/takeover/ui/native-world-controls-Purple.svg','assets/takeover/ui/native-world-Purple.svg']:
 r=E.parse(p).getroot();print(p,[(e.get('id'),e.get(F+'characterId')) for e in r if e.tag.endswith('use')])
