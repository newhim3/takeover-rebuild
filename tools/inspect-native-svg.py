import xml.etree.ElementTree as E
from pathlib import Path
p=Path('../takeover拆解/scratch/surgery/ui_windows_svg/DefineSprite_3977_WindowCastleClass_WindowCastleClass')
for f in [1,21,23]:
 r=E.parse(p/f'{f}.svg').getroot(); print(f,[(e.get('id'),e.get('transform')) for e in r[0] if e.tag.endswith('use')])
