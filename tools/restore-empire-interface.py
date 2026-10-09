from pathlib import Path
from PIL import Image
import base64,xml.etree.ElementTree as E
out=Path('assets/takeover/ui')
# Video-only Empire icons; preserve original imagery instead of recolouring tribal icons.
im=Image.open('reference/new-videos/dark-edicts-clean.png')
for n,x,y in [(29,642,50),(28,166,50),(31,642,119),(30,166,119),(33,642,188),(32,166,188),(35,642,257),(34,166,257),(36,166,326)]:
 im.crop((x,y,x+47,y+47)).save(out/f'edict-{n}.png')
def data(path):
 mime='image/png' if str(path).endswith('.png') else 'image/svg+xml'
 return f'data:{mime};base64,'+base64.b64encode(Path(path).read_bytes()).decode()
# Shared original global geography and actual Empire castle silhouette. The fourth
# campaign route remains an adaptation because the supplied SWF has only 3 campaigns.
world=(out/'native-world-1.svg').read_text(encoding='utf8')
world=world.replace('</svg>', '<desc>Shared original continent artwork. Fourth campaign route remains adapted; no Khaganate castle or portrait used.</desc></svg>')
(out/'native-world-Purple.svg').write_text(world,encoding='utf8')
(out/'native-world-node-Purple.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -100 120 150"><desc>Original CastlePurpleClass, not a recoloured tribal castle.</desc><image x="-43" y="-94" width="86" height="109" href="{data("assets/takeover/animation/anim/CastlePurpleClass.png")}"/></svg>',encoding='utf8')
# Purple screen and buttons follow the supplied update video. They do not include
# a rival throne/portrait. Shared scroll rows remain the original SWF artwork.
background='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="button" x2="0" y2="1"><stop stop-color="#aa6de1"/><stop offset=".5" stop-color="#7132a3"/><stop offset="1" stop-color="#49125f"/></linearGradient></defs><rect width="800" height="600" fill="#1d001c"/><rect x="5" y="4" width="427" height="42" rx="21" fill="#8f1800" stroke="#e2b454" stroke-width="3"/><rect x="290" y="8" width="133" height="31" rx="16" fill="url(#button)" stroke="#edbf51" stroke-width="3"/><rect x="524" y="502" width="190" height="59" rx="30" fill="url(#button)" stroke="#edbf51" stroke-width="4"/><rect x="512" y="558" width="205" height="22" rx="9" fill="#18111e" stroke="#d1a452" stroke-width="2"/><path d="M457 527 Q437 507 448 495 Q470 480 489 501 Q509 480 529 495 Q539 509 518 527 L516 572 Q490 589 462 572Z" fill="#37154b" stroke="#694092" stroke-width="4"/><ellipse cx="760" cy="557" rx="36" ry="27" fill="#282142" stroke="#655585" stroke-width="3"/><desc>Empire dark screen and purple-gold controls traced from supplied 4-country update video at 4.8 seconds; no rival faction illustration.</desc></svg>'''
(out/'native-edicts-Purple.svg').write_text(background,encoding='utf8')
controls=background.replace('<rect width="800" height="600" fill="#1d001c"/>','').replace('<rect x="5" y="4" width="427" height="42" rx="21" fill="#8f1800" stroke="#e2b454" stroke-width="3"/>','').replace('<rect x="290" y="8" width="133" height="31" rx="16" fill="url(#button)" stroke="#edbf51" stroke-width="3"/>','')
controls=controls.replace('</svg>','<rect x="10" y="536" width="153" height="44" rx="22" fill="url(#button)" stroke="#d4ab55" stroke-width="3"/><rect x="216" y="536" width="190" height="44" rx="22" fill="url(#button)" stroke="#d4ab55" stroke-width="3"/></svg>')
(out/'native-world-controls-Purple.svg').write_text(controls,encoding='utf8')
