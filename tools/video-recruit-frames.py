import sys,json,subprocess,math
from pathlib import Path
sys.path.insert(0,str(Path('.tools/video').resolve()))
import imageio_ffmpeg
from PIL import Image,ImageDraw
src={s['id']:s['path'] for s in json.loads(Path('reference/new-videos/sources.json').read_text(encoding='utf8'))};ff=imageio_ffmpeg.get_ffmpeg_exe();out=Path('reference/new-videos/church/recruit-frames');out.mkdir(exist_ok=True)
subprocess.run([ff,'-v','error','-ss','370','-i',src['church'],'-t','2','-vf','scale=427:-1','-y',str(out/'%03d.jpg')],check=True)
ims=sorted(out.glob('*.jpg'));sheet=Image.new('RGB',(427*4,216*math.ceil(len(ims)/4)),'#222');d=ImageDraw.Draw(sheet)
for n,p in enumerate(ims):
 x=n%4*427;y=n//4*216;sheet.paste(Image.open(p),(x,y+16));d.text((x+4,y+1),f'{370+n/30:.3f}s',fill='white')
for i in range(math.ceil(sheet.height/1296)):sheet.crop((0,i*1296,1708,min(sheet.height,(i+1)*1296))).save(out/f'sheet-{i}.jpg')
