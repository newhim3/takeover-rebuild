"""Classify Takeover animation atlases while preserving Cocos .meta UUIDs.

Run --dry-run first.  The SWF XML is used only to infer the role of anonymous
`#1234` symbols through their nearest named parent; ambiguous symbols stay in
shared_unknown so no unsupported semantic label is invented.
"""
import argparse
import collections
import json
import re
import shutil
from pathlib import Path

PROJECT = Path(r"D:\cocos\takerovermini")
BASE = PROJECT / "assets/takeover/animation"
ANIM = BASE / "anim"
XML = Path(r"D:\Users\wtwl\Documents\ChatGPT\takeover拆解\scratch\swf.xml")
MANIFEST = BASE / "anim_manifest.json"
OUT = Path(r"D:\Users\wtwl\Documents\ChatGPT\takeover-cocos手搓\anim_classification_report.json")

CATEGORIES = ("ui", "icons", "buildings", "units", "maps", "effects", "fonts", "shared_unknown")
UNIT_ACTIONS = ("_Go", "_Attack", "_Die", "SpecialA", "SpecialB", "SpecialC", "SpecialD", "SpecialE")

def classify_name(name, group=None):
    n = name.lower()
    if group == "unit" or (n.startswith(("red", "blue", "green", "purple", "gray")) and any(a.lower() in n for a in UNIT_ACTIONS)):
        return "units"
    if re.search(r"^(castle|town|village|mine|obelisk|magetower|warcamp|node(?:castle|town|camp|magetower|build|chest)|buildhere|building)", n):
        return "buildings"
    if re.search(r"^(level\d|pathpoint|emptyNode|skyClouds|chestClass)", name, re.I):
        return "maps"
    if n.startswith("nodedefenderogre"):
        return "units"
    if re.search(r"^(icon|spellIcon|goldStarIcon|silverStarIcon|squadRoundIcon|slotIcon|mst_|ast|keyNodeHealthBar|redCross)", name, re.I):
        return "icons"
    if re.search(r"(effect|explosion|bullet|missile|crater|spellthunder|terrorflying|stoneworm|banner|cursor(?:on|off)|backlight|frontlight)", n):
        return "effects"
    if re.search(r"(font|glyph|bitmapfont|digitatlas)", n):
        return "fonts"
    if re.search(r"^(scr|window|hint|gameButton|gamePanel|achievement|badgesArrow|mission|resourcePanel|pageIndicator|onlineSave|smallLogo|tutorial|ultimateMessage|versionNum|blackBack|goldMessage|gui_fla|switchHighlight|levelInfoPanel)", name, re.I):
        return "ui"
    return "shared_unknown"

def sprite_children():
    children = collections.defaultdict(set)
    current = None
    nesting = 0
    # FFDec writes one tag per line. A sprite's direct subTags contain placements.
    with XML.open(encoding="utf-8", errors="replace") as f:
        for line in f:
            if current is None:
                m = re.search(r'<item type="DefineSpriteTag"[^>]*spriteId="(\d+)"', line)
                if m:
                    current = int(m.group(1))
                    nesting = 1
                continue
            if '<item ' in line and not line.rstrip().endswith('/>'):
                nesting += 1
            if 'type="PlaceObject' in line:
                m = re.search(r'characterId="(\d+)"', line)
                if m:
                    children[current].add(int(m.group(1)))
            if '</item>' in line:
                nesting -= 1
                if nesting == 0:
                    current = None
    return children

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    files = sorted(ANIM.glob("*.png"))
    if len(files) != 3079:
        raise RuntimeError(f"Expected 3079 PNGs before classification; found {len(files)}")
    sheet_by_name = {Path(s["sheet"]).name: s for s in manifest["sheets"]}
    index = json.loads((Path(r"D:\Users\wtwl\Documents\ChatGPT\takeover拆解") / "data/animations.json").read_text(encoding="utf-8"))
    known_ids = {k: v["charId"] for section in ("sprites", "animations") for k, v in index[section].items()}
    file_names = {f.name for f in files}
    roles = {}
    confidence = {}
    for file in files:
        sheet = sheet_by_name.get(file.name)
        if sheet:
            role = classify_name(sheet["key"], sheet.get("group"))
            roles[file.name] = role
            confidence[file.name] = "named" if role != "shared_unknown" else "unknown"
    graph = sprite_children()
    # Propagate context from known named sprites to nested anonymous sprites.
    votes = collections.defaultdict(collections.Counter)
    for file in files:
        if file.name not in roles or roles[file.name] == "shared_unknown":
            continue
        root = known_ids.get(file.stem)
        if root is None:
            continue
        queue = collections.deque([(root, 0)])
        seen = {root}
        while queue:
            node, distance = queue.popleft()
            if distance >= 5:
                continue
            for child in graph.get(node, ()):
                if child in seen:
                    continue
                seen.add(child)
                if f"#{child}.png" in file_names:
                    votes[child][roles[file.name]] += 1 / (distance + 1)
                queue.append((child, distance + 1))
    for file in files:
        if file.name in roles and roles[file.name] != "shared_unknown":
            continue
        if file.stem.startswith("#"):
            score = votes.get(int(file.stem[1:]), {})
            if score:
                top = sorted(score.items(), key=lambda x: x[1], reverse=True)
                if len(top) == 1 or top[0][1] >= top[1][1] * 2:
                    roles[file.name] = top[0][0]
                    confidence[file.name] = "parent_inferred"
                    continue
        roles[file.name] = "shared_unknown"
        confidence[file.name] = "unknown"
    report = {"source": str(ANIM), "total_png": len(files), "counts": dict(collections.Counter(roles.values())),
              "confidence": dict(collections.Counter(confidence.values())),
              "files": {f.name: {"category": roles[f.name], "confidence": confidence[f.name]} for f in files}}
    print(json.dumps({k: report[k] for k in ("total_png", "counts", "confidence")}, ensure_ascii=False, indent=2))
    if args.dry_run:
        return
    for file in files:
        destination = ANIM / roles[file.name] / file.name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(file), str(destination))
        meta = file.with_name(file.name + ".meta")
        if meta.exists():
            shutil.move(str(meta), str(destination.with_name(destination.name + ".meta")))
    for sheet in manifest["sheets"]:
        name = Path(sheet["sheet"]).name
        sheet["sheet"] = f"anim/{roles[name]}/{name}"
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"moved={len(files)} report={OUT}")

if __name__ == "__main__":
    main()
