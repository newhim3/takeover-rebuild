import sys,json,subprocess
from pathlib import Path
sys.path.insert(0,str(Path('.tools/video').resolve()))
import imageio_ffmpeg
f=imageio_ffmpeg.get_ffmpeg_exe(); sources=[]
for label,term in [('tribe','部落8-10'),('church','神教8-10'),('sandbox','所有满级AI')]:
 p=next(p for p in Path('D:/桌面/tools/bilbildownload').rglob('*.mp4') if term in p.name)
 r=subprocess.run([f,'-i',str(p)],capture_output=True).stderr.decode('utf8','replace')
 print(label,str(p));print(r[r.find('Duration:'):r.find('At least')])
 sources.append({'id':label,'path':str(p)})
Path('reference/new-videos').mkdir(exist_ok=True)
Path('reference/new-videos/sources.json').write_text(json.dumps(sources,ensure_ascii=False),encoding='utf8')
