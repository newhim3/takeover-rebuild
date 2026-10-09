"""Replace only original declaration lettering, keeping every original SVG frame.

Input: FFDec sprite:svg export of 239,4709,5067,8150 from surgery/nohit.swf.
Embedded original bitmap textures are losslessly deduplicated into PNGs; the
DeclarationArt loader embeds them back before decoding an SVG image.
"""
from pathlib import Path
import base64, hashlib, json, re, subprocess, xml.etree.ElementTree as E

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'reference/ultimate-localization-source'
OUT = ROOT / 'assets/takeover/ui/ultimate'
S = '{http://www.w3.org/2000/svg}'
X = '{http://www.w3.org/1999/xlink}href'
F = '{https://www.free-decompiler.com/flash}'
E.register_namespace('', S[1:-1])
E.register_namespace('xlink', X[1:-5])
N = re.compile(r'[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?')
SPECS = {5067: ('UltimateMessage1Class', '神之降临'),
         239: ('UltimateMessage2Class', '天灾陨星'),
         4709: ('UltimateMessage3Class', '墓穴召唤'),
         8150: ('UltimateMessage4Class', '大转化术')}


def chinese(parent, title, x=0, y=0, size=22, fill='#ffffff', stroke=None):
    attrs = {'x': str(x), 'y': str(y), 'text-anchor': 'middle',
             'font-family': 'Microsoft YaHei, Noto Sans CJK SC, sans-serif',
             'font-size': str(size), 'font-weight': '900', 'fill': fill}
    if stroke:
        attrs.update({'stroke': stroke, 'stroke-width': '1.2', 'paint-order': 'stroke fill'})
    node = E.SubElement(parent, S + 'text', attrs)
    node.text = title
    return node


def replace_green(group, top, title):
    # These bounds identify the title subpaths, not the gold jewels/frame.
    # The original upper/lower plaques divide the title at local y=45.5/-44.
    removed = 0
    native_inner_fill = None
    for p in group.iter(S + 'path'):
        kept = []
        for sub in re.findall(r'M\s*[^M]+', p.get('d', '')):
            a = list(map(float, N.findall(sub)))
            xs, ys = a[::2], a[1::2]
            if min(xs) < -300 and max(xs) > 300 and p.get('fill', '').startswith('url(') and (
                    min(ys) >= -5 if top else max(ys) <= 5):
                native_inner_fill = p.get('fill')
            lettering = min(xs) >= -260 and max(xs) <= 260 and (
                min(ys) >= 18 if top else max(ys) <= -20)
            if lettering:
                removed += 1
            else:
                kept.append(sub)
        p.set('d', ' '.join(kept))
    if not removed:
        raise RuntimeError('Green plaque lettering not found')
    # Some native compound paths join a letter to a larger subpath, so the
    # bounds-only removal above leaves pieces of the English title behind.
    # Exclude only the lettering band; retain the original jewels and border.
    artwork = E.Element(S + 'g')
    for child in list(group):
        group.remove(child)
        artwork.append(child)
    artwork_clip = 'localized-artwork-' + ('top' if top else 'bottom')
    clip = E.SubElement(group, S + 'clipPath', {'id': artwork_clip})
    y0, y1 = (16, 45.5) if top else (-44, -15)
    E.SubElement(clip, S + 'path', {
        'clip-rule': 'evenodd',
        'd': f'M-1000 -1000H1000V1000H-1000Z M-250 {y0}V{y1}H250V{y0}Z'})
    artwork.set('clip-path', 'url(#' + artwork_clip + ')')
    group.append(artwork)
    if not native_inner_fill:
        raise RuntimeError('Native plaque lining not found')
    # Restore the native lining behind the replaced letters, including its
    # original gradient and the parent timeline's flash/fade filters.
    E.SubElement(group, S + 'rect', {'x': '-250', 'y': str(y0),
                                   'width': '500', 'height': str(y1-y0),
                                   'fill': native_inner_fill})
    clip_id = 'localized-title-half-' + ('top' if top else 'bottom')
    clip = E.SubElement(group, S + 'clipPath', {'id': clip_id})
    E.SubElement(clip, S + 'rect', {'x': '-300', 'y': '-500' if top else '-44',
                                 'width': '600', 'height': '545.5' if top else '544'})
    title_group = E.SubElement(group, S + 'g', {'clip-path': 'url(#' + clip_id + ')'})
    text = chinese(title_group, title, y=45.5 if top else -44,
                   size=54, fill='#ffe8a1', stroke='#69400a')
    text.set('dominant-baseline', 'central')
    return removed


def localize(svg, cid, title):
    ids = {e.get('id'): e for e in svg.iter() if e.get('id')}
    target_ids = {}
    for use in svg.iter(S + 'use'):
        target_ids.setdefault(use.get(F + 'characterId'), set()).add(use.get(X, '').lstrip('#'))
    if cid == 5067:
        for target, top in [('5062', True), ('5064', False)]:
            for identity in target_ids.get(target, []):
                replace_green(ids[identity], top, title)
    elif cid == 239:
        # 234 is the original fiery comet and must remain untouched.
        for identity in target_ids.get('232', []):
            group = ids[identity]
            for child in list(group):
                group.remove(child)
            text = chinese(group, title, size=64, fill='url(#gradient0)', stroke='#813725')
            text.set('dominant-baseline', 'central')
    else:
        # Independent original glyph groups. Their surrounding use transforms,
        # masks and filters still provide the original blur/fade timeline.
        for group in list(svg.iter()):
            if not re.fullmatch(r'text\d+', group.get('id', '')):
                continue
            width = 212 if cid == 4709 else 279.45
            for child in list(group):
                group.remove(child)
            chinese(group, title, x=width / 2, y=19, size=22,
                    stroke='#102b42' if cid == 8150 else None)
        # Glyph definitions no longer have references and can be omitted.
        for parent in list(svg.iter()):
            for child in list(parent):
                if child.get('id', '').startswith('font_'):
                    parent.remove(child)
    svg.set('width', '800')
    svg.set('height', '600')
    svg.set('viewBox', '0 0 800 600')
    svg[0].attrib.pop('transform', None)  # Native stage coordinates, not export bounds.
    # FFDec emits an empty filter for a no-op Flash colour transform. SVG
    # renders an empty filter as transparent, hiding the entire ice title.
    empty_filters = {e.get('id') for e in svg.iter(S + 'filter') if not len(e)}
    for e in svg.iter():
        if e.get('filter', '').removeprefix('url(#').removesuffix(')') in empty_filters:
            e.attrib.pop('filter', None)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    if not SOURCE.exists():
        original = ROOT.parent / 'takeover拆解'
        with (OUT / 'export.log').open('w', encoding='utf8') as log:
            subprocess.run([str(original / 'tools/ffdec/ffdec-cli.exe'), '-format', 'sprite:svg',
                            '-selectid', ','.join(map(str, SPECS)), '-export', 'sprite', str(SOURCE),
                            str(original / 'scratch/surgery/nohit.swf')],
                           stdout=log, stderr=log, check=True)
    bitmap_dir = OUT / 'bitmaps'
    bitmap_dir.mkdir(exist_ok=True)
    manifest = {}
    for cid, (key, title) in SPECS.items():
        folder = next(SOURCE.glob(f'DefineSprite_{cid}_*'))
        frames = sorted(folder.glob('*.svg'), key=lambda p: int(p.stem))
        destination = OUT / key
        destination.mkdir(exist_ok=True)
        bitmaps = set()
        for path in frames:
            svg = E.parse(path).getroot()
            localize(svg, cid, title)
            unique = {}
            defs = next(e for e in svg if e.tag == S + 'defs')
            for parent in list(svg.iter()):
                for element in list(parent):
                    if element.tag != S + 'image':
                        continue
                    data_url = element.get(X) or element.get('href')
                    data = base64.b64decode(data_url.split(',', 1)[1])
                    digest = hashlib.sha256(data).hexdigest()[:20]
                    bitmaps.add(digest)
                    image_id = 'localized-bitmap-' + digest
                    if digest not in unique:
                        (bitmap_dir / (digest + '.png')).write_bytes(data)
                        original = E.Element(S + 'image', dict(element.attrib))
                        original.set('id', image_id)
                        original.set(X, '__ULT_BITMAP_' + digest + '__')
                        original.attrib.pop('href', None)
                        defs.append(original)
                        unique[digest] = image_id
                    index = list(parent).index(element)
                    parent.remove(element)
                    parent.insert(index, E.Element(S + 'use', {X: '#' + image_id}))
            E.ElementTree(svg).write(destination / path.name, encoding='utf-8', xml_declaration=True)
        manifest[key] = {'title': title, 'charId': cid, 'frames': len(frames), 'fps': 30,
                         'width': 800, 'height': 600, 'pivot': [0, 0], 'bitmaps': sorted(bitmaps),
                         'base': 'assets/takeover/ui/ultimate/' + key + '/',
                         'source': '../takeover拆解/scratch/surgery/nohit.swf'}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    print('Localized original declaration frames:', sum(v['frames'] for v in manifest.values()))
    print('Preserved original stage transforms, masks, smoke, skulls, ice chains and gold plaques.')
    return manifest


if __name__ == '__main__':
    main()
