import sys,json,subprocess,math
from pathlib import Path
sys.path.insert(0,str(Path('.tools/video').resolve()))
import imageio_ffmpeg
from PIL import Image,ImageDraw
sources=json.loads(Path('reference/new-videos/sources.json').read_text(encoding='utf8')); ff=imageio_ffmpeg.get_ffmpeg_exe()
for s in sources:
 out=Path('reference/new-videos')/s['id'];out.mkdir(exist_ok=True)
 subprocess.run([ff,'-v','error','-i',s['path'],'-vf','fps=1/20,scale=427:-1','-y',str(out/'overview-%03d.jpg')],check=True)
 ims=sorted(out.glob('overview-*.jpg')); sheet=Image.new('RGB',(427*3,224*math.ceil(len(ims)/3)), '#20252a');d=ImageDraw.Draw(sheet)
 for n,p in enumerate(ims):
  im=Image.open(p);x=n%3*427;y=n//3*224;sheet.paste(im,(x,y+22));d.text((x+8,y+4),f'{s["id"]} ~{n*20+10}s',fill='white')
 sheet.save(out/'overview.jpg')
