"""Recover original Flash registration points for map buildings and build signs.

The bitmap's top left is not the building's map position. FFDec puts the source
registration point at the translation of the SVG root matrix. Keep that point
and the original bitmap size when drawing normal buildings and their ruins.

ResourceManager defaults movie_clip scale to 1. RasterGraphicLayer renders the
world Y coordinate at 0.5, but does not scale the image or registration offset.
The JavaScript simulation already stores map-space Y, so it must draw at x/y
without another Y conversion or an arbitrary sprite-height normalization.
"""
from pathlib import Path
import json
import math
import re
import subprocess
import xml.etree.ElementTree as E


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'takeover拆解'
OUT = ROOT / 'reference' / 'building-pivots'
RESOURCE_KEY = re.compile(
    r'^(?:Castle|Town|MageTower|Warcamp|Mine|Village|Obelisk)'
    r'(?:Green|Red|Blue|Purple)(?:Raze|Razed)?(?:Anim)?Class$'
    r'|^BuildHere(?:Top|Bottom)Class$'
)
NUMBER = re.compile(r'[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?')


def main():
    data = json.loads((SOURCE / 'data' / 'animations.json').read_text(encoding='utf-8-sig'))
    keys = {key: value for key, value in data['sprites'].items() if RESOURCE_KEY.match(key)}
    OUT.mkdir(parents=True, exist_ok=True)
    missing = [value['charId'] for value in keys.values()
               if not list(OUT.glob(f"DefineSprite_{value['charId']}*/1.svg"))]
    if missing:
        # -select is the frame selection; -selectid is the source character ID.
        # Request frame 1; some FFDec versions still emit the full timeline.
        with (OUT / 'export.log').open('w', encoding='utf-8') as log:
            subprocess.run([
                str(SOURCE / 'tools' / 'ffdec' / 'ffdec-cli.exe'),
                '-format', 'sprite:svg', '-select', '1',
                '-selectid', ','.join(map(str, sorted(set(missing)))),
                '-export', 'sprite', str(OUT),
                str(SOURCE / 'scratch' / 'surgery' / 'nohit.swf'),
            ], stdout=log, stderr=log, check=True)

    pivots = {}
    audit = []
    for key, value in sorted(keys.items()):
        paths = sorted(OUT.glob(f"DefineSprite_{value['charId']}*/1.svg"))
        if not paths:
            raise RuntimeError(f'Missing SVG for {key}')
        svg = E.parse(paths[0]).getroot()
        transform = svg[0].get('transform', '')
        matrix = list(map(float, NUMBER.findall(transform)))
        if len(matrix) != 6 or matrix[:4] != [1, 0, 0, 1]:
            raise RuntimeError(f'Unexpected root matrix for {key}: {transform}')
        width, height = value['w'], value['h']
        # FFDec's PNG exporter extends the canvas symmetrically for filters;
        # the SVG exporter keeps the unextended source bounds. Account for
        # that existing atlas padding instead of moving the visible artwork.
        svg_width = float(svg.get('width', '').removesuffix('px'))
        svg_height = float(svg.get('height', '').removesuffix('px'))
        padding = [math.floor((width-math.floor(svg_width))/2),
                   math.floor((height-math.floor(svg_height))/2)]
        if padding[0] < 0 or padding[0] != padding[1]:
            raise RuntimeError(f'Unexpected atlas filter extent for {key}: {padding}')
        source_pivot = matrix[4:6]
        pivot = [source_pivot[0]+padding[0], source_pivot[1]+padding[1]]
        pivots[key] = pivot
        audit.append({
            'key': key, 'charId': value['charId'], 'pivot': pivot,
            'flashOrigin': source_pivot, 'atlasFilterPadding': padding,
            'bitmapSize': [width, height],
            'boundsAtOrigin': [-pivot[0], -pivot[1], width-pivot[0], height-pivot[1]],
            'source': str(paths[0].relative_to(ROOT)).replace('\\', '/'),
        })

    assert len(pivots) == len(keys), (len(pivots), len(keys))
    (ROOT / 'building-pivots.js').write_text(
        '/* Original Flash building registration points; draw at native scale. */\n'
        '(function(root){const pivots=' + json.dumps(pivots, separators=(',', ':'))
        + ';if(typeof module!=="undefined")module.exports=pivots;else root.BuildingPivots=pivots;})'
        '(typeof window!=="undefined"?window:globalThis);\n', encoding='utf-8')
    (OUT / 'audit.json').write_text(json.dumps({
        'coordinateRule': 'draw x-pivotX,y-pivotY at scale 1; map-space Y is already projected',
        'missingOptionalSymbols': [key for key in ['BuildHereBottomClass'] if key not in pivots],
        'resources': audit,
    }, indent=2), encoding='utf-8')
    # Retain only the registration reference actually used by this tool.
    for value in keys.values():
        for folder in OUT.glob(f"DefineSprite_{value['charId']}*"):
            for extra in folder.glob('*.svg'):
                if extra.stem.isdigit() and extra.stem != '1':
                    extra.unlink()
    print('Restored', len(pivots), 'original building/sign registration points.')


if __name__ == '__main__':
    main()
