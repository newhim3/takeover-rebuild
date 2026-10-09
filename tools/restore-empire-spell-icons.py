"""Restore fourth-faction buttons from the user's newer gameplay video."""
from pathlib import Path
import sys,subprocess,json
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.tools/video'))
import imageio_ffmpeg
source=next(p for p in Path('D:/桌面/tools/bilbildownload').rglob('*.mp4') if '4国混战' in p.name)
out=ROOT/'reference/dark-art';out.mkdir(exist_ok=True)
for second in [20,85]:
 subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-ss',str(second),'-i',str(source),'-frames:v','1','-y',str(out/f'spells-video-{second}.png')],check=True)
frame=Image.open(out/'spells-video-85.png').convert('RGBA')
# The video's toolbar is: Desecration, Terror, Raise Dead, ultimate charge.
# Crop only the art above the number label; never bake a cooldown or price into it.
mapping={'heal':(252,358,280,378),'fire':(298,358,326,378),'summon':(344,358,372,378)}
metadata={}
for key,box in mapping.items():
 frame.crop(box).resize((53,53),Image.Resampling.LANCZOS).save(ROOT/f'assets/takeover/ui/spell-Purple-{key}.png')
 metadata[key]={'source':str(source),'seconds':85,'crop':box,'note':'Original video art above the UI price, resampled for the web button'}
Image.open(ROOT/'assets/takeover/art/images/1519.png').save(ROOT/'assets/takeover/ui/spell-Purple-ultimate.png')
metadata['ultimate']={'source':'original SWF bitmap 1519','note':'Empire crest; newer video ultimate icon is covered by charging curtain'}
(out/'spell-icons-provenance.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
