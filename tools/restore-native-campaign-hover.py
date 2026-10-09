"""Export the actual three-country campaign _over timeline, never draw a replacement.

Run with the bundled Python runtime. Set TAKEOVER_SOURCE_SWF / FFDEC_CLI /
TAKEOVER_NODE / TAKEOVER_SHARP for a different local tool installation.
The reference export is deliberately retained for source comparison.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import xml.etree.ElementTree as E

ROOT = Path(__file__).resolve().parent.parent
S = '{http://www.w3.org/2000/svg}'
X = '{http://www.w3.org/1999/xlink}href'
E.register_namespace('', S[1:-1])
E.register_namespace('xlink', X[1:-5])
E.register_namespace('ffdec', 'https://www.free-decompiler.com/flash')
SPECS = {'Green': (6674, 6672), 'Blue': (6690, 6685), 'Red': (6706, 6702)}
RUNTIME = Path.home() / '.cache/codex-runtimes/codex-primary-runtime/dependencies'
SOURCE = Path(os.environ.get('TAKEOVER_SOURCE_SWF', str(ROOT.parent / 'takeover拆解/scratch/surgery/inner.swf')))
FFDEC = Path(os.environ.get('FFDEC_CLI', str(ROOT.parent / 'takeover拆解/tools/ffdec/ffdec-cli.exe')))
NODE = Path(os.environ.get('TAKEOVER_NODE', str(RUNTIME / 'node/bin/node.exe')))
REFERENCE = ROOT / 'reference/native-campaign-hover-r19'


def normalize(source, target):
    tree = E.parse(source)
    svg = tree.getroot()
    # FFDec's exported viewport offset is not the original symbol registration.
    # Match the already used native-campaign-flag SVG coordinate system.
    group = next(child for child in svg if child.tag == S + 'g')
    group.set('transform', 'matrix(1 0 0 1 0 0)')
    svg.set('viewBox', '-150 -245 300 490')
    svg.set('width', '450')
    svg.set('height', '735')
    svg.set('preserveAspectRatio', 'xMidYMid meet')
    removed = []
    for parent in svg.iter():
        for child in list(parent):
            identity = child.get('id', '')
            href = child.get(X, '')
            # The game's Chinese labels supply these original dynamic fields.
            # All cloth, country portrait/crest, morphs and image filters remain.
            if identity in ('mcNewGameMessage', 'mcRankBlock', '_hitArea', 'mcText') or identity.startswith('txt') or href.startswith('#text'):
                removed.append(identity or href)
                parent.remove(child)
    target.parent.mkdir(parents=True, exist_ok=True)
    tree.write(target, encoding='utf-8', xml_declaration=True)
    return removed


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--skip-export', action='store_true', help='Use the retained native FFDec reference frames.')
    args = parser.parse_args()
    REFERENCE.mkdir(parents=True, exist_ok=True)
    if not args.skip_export:
        command = [str(FFDEC), '-selectid', '6674,6690,6706', '-select', '6674:11,6690:11,6706:11', '-sublength', '10', '-format', 'sprite:svg', '-ignorebackground', '-export', 'sprite', str(REFERENCE / 'parent-svg'), str(SOURCE)]
        completed = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace', check=True)
        (REFERENCE / 'export.log').write_text(completed.stdout + completed.stderr, encoding='utf-8')
    result = {'sourceSWF': str(SOURCE), 'sourceSHA256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'fps': 30, 'viewBox': [-150, -245, 300, 490], 'raster': [450, 735], 'labels': {'up': 1, 'over': 11, 'down': 21}, 'countries': {}}
    for country, (parent, morph) in SPECS.items():
        removed = []
        for frame in range(1, 11):
            source = REFERENCE / f'parent-svg/DefineSprite_{parent}/11/{frame}.svg'
            removed.append(normalize(source, REFERENCE / f'normalized-svg/{country}/{frame}.svg'))
        result['countries'][country] = {'parentSymbol': parent, 'overFrame': 11, 'animatedChild': morph, 'frames': 10, 'removedDynamicFields': removed[0], 'originalFiltersRetained': True}
    result['Purple'] = 'No verified independent fourth-country campaign hover timeline; keep existing original-cloth / genuine Empire-crest adaptation.'
    (REFERENCE / 'source.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    subprocess.run([str(NODE), str(ROOT / 'tools/pack-native-campaign-hover.cjs')], cwd=ROOT, check=True)


if __name__ == '__main__':
    main()
