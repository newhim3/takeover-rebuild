import sys,json,subprocess,math
from pathlib import Path
sys.path.insert(0,str(Path('.tools/video').resolve()))
import imageio_ffmpeg
from PIL import Image,ImageDraw
src={s['id']:s['path'] for s in json.loads(Path('reference/new-videos/sources.json').read_text(encoding='utf8'))}; ff=imageio_ffmpeg.get_ffmpeg_exe()
for name,start,length,fps in [('tribe',0,12,2),('church',365,10,2),('sandbox',28,6,2)]:
 out=Path('reference/new-videos')/name
 subprocess.run([ff,'-v','error','-ss',str(start),'-i',src[name],'-t',str(length),'-vf',f'fps={fps},scale=640:-1','-y',str(out/'sequence-%03d.jpg')],check=True)
 ims=sorted(out.glob('sequence-*.jpg'));sheet=Image.new('RGB',(1280,320*math.ceil(len(ims)/2)),'#222');d=ImageDraw.Draw(sheet)
 for n,p in enumerate(ims):
  x=n%2*640;y=n//2*320;sheet.paste(Image.open(p),(x,y+20));d.text((x+5,y+2),f'{name} {start+n/fps:.2f}s',fill='white')
 for part in range(math.ceil(sheet.height/1920)):
  sheet.crop((0,part*1920,1280,min(sheet.height,(part+1)*1920))).save(out/f'sequence-sheet-{part}.jpg')
