"""Recover native Flash spell/effect registration points from original SVG exports."""
from pathlib import Path
import json, math, re, subprocess
import xml.etree.ElementTree as E

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT.parent/'takeover拆解'
OUT=ROOT/'reference'/'spell-pivots'
KEY=re.compile(r'^(?:SpellThunderClass|Banner.*Class|Terror.*Class|FrostEncahntmentEffectClass|RaiseDeadSpellEffectClass|StoneWormsEffectClass|StonewormsExplosionEffect|FireballEffectClass|FireBallExplosionClass|CraterFromExplosionClass|IceBlast.*Class|GrandTransformationEffectClass|SignOfAdventEffectClass|Avatar(?:Front|Back)LightEffectClass|UltimateMessage[1-4]Class)$')
NUM=re.compile(r'[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?')

def main():
    data=json.loads((SOURCE/'data/animations.json').read_text(encoding='utf-8-sig'))
    keys={k:v for k,v in data['sprites'].items() if KEY.match(k)}
    OUT.mkdir(parents=True,exist_ok=True)
    missing=[v['charId'] for v in keys.values() if not list(OUT.glob(f"DefineSprite_{v['charId']}*/1.svg"))]
    if missing:
        with (OUT/'export.log').open('w',encoding='utf-8') as log:
            subprocess.run([str(SOURCE/'tools/ffdec/ffdec-cli.exe'),'-format','sprite:svg','-select','1','-selectid',','.join(map(str,sorted(set(missing)))),'-export','sprite',str(OUT),str(SOURCE/'scratch/surgery/nohit.swf')],stdout=log,stderr=log,check=True)
    pivots={}; audit=[]
    for k,v in sorted(keys.items()):
        paths=sorted(OUT.glob(f"DefineSprite_{v['charId']}*/1.svg"))
        if not paths: raise RuntimeError('Missing SVG '+k)
        svg=E.parse(paths[0]).getroot(); matrix=list(map(float,NUM.findall(svg[0].get('transform',''))))
        if len(matrix)!=6 or matrix[:4]!=[1,0,0,1]:raise RuntimeError('Unexpected matrix '+k)
        w,h=v['w'],v['h']; sw=float(svg.get('width','').removesuffix('px')); sh=float(svg.get('height','').removesuffix('px'))
        padding=[math.floor((w-math.floor(sw))/2),math.floor((h-math.floor(sh))/2)]
        if min(padding)<0:raise RuntimeError(f'Unexpected bounds {k}: {padding}')
        pivot=[matrix[4]+padding[0],matrix[5]+padding[1]]; pivots[k]=pivot
        audit.append({'key':k,'charId':v['charId'],'pivot':pivot,'flashOrigin':matrix[4:6],'atlasFilterPadding':padding,'bitmapSize':[w,h],'boundsAtOrigin':[-pivot[0],-pivot[1],w-pivot[0],h-pivot[1]],'source':str(paths[0].relative_to(ROOT)).replace('\\','/')})
    (ROOT/'spell-pivots.js').write_text('/* Original Flash spell registration points; native bitmap scale. */\n(function(root){const pivots='+json.dumps(pivots,separators=(',',':'))+';if(typeof module!=="undefined")module.exports=pivots;else root.SpellPivots=pivots;})(typeof window!=="undefined"?window:globalThis);\n',encoding='utf-8')
    (OUT/'audit.json').write_text(json.dumps({'coordinateRule':'draw x-pivotX,y-pivotY at scale 1; map-space Y already projected; ultimate messages use stage origin 0,0','resources':audit},indent=2),encoding='utf-8')
    # Keep only the generated SVG frame used by this registration audit.
    for v in keys.values():
        for folder in OUT.glob(f"DefineSprite_{v['charId']}*"):
            assert folder.resolve().is_relative_to(OUT.resolve())
            for extra in folder.glob('*.svg'):
                if extra.stem.isdigit() and extra.stem!='1':extra.unlink()
    print('Restored',len(pivots),'original spell registration points.')

if __name__=='__main__': main()
