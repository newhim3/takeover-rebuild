"""Measure one SWF sprite timeline from the existing FFDec XML export."""
import json
import re
from pathlib import Path

ROOT = Path(r"D:\Users\wtwl\Documents\ChatGPT\takeover拆解")
XML = ROOT / "scratch/swf.xml"
SPRITE_ID = 5673

inside = False
depth = 0
frames = 0
placements = 0
removals = 0
characters = set()
changed_depths = set()
matrix_changes = 0
current_depth = None

with XML.open(encoding="utf-8", errors="replace") as source:
    for line in source:
        if not inside:
            if f'spriteId="{SPRITE_ID}"' not in line or 'type="DefineSpriteTag"' not in line:
                continue
            inside = True
            depth = 1
            continue
        if '<item ' in line:
            if not line.rstrip().endswith('/>'):
                depth += 1
            if 'type="ShowFrameTag"' in line:
                frames += 1
            elif 'type="PlaceObject' in line:
                placements += 1
                match = re.search(r'characterId="(\d+)"', line)
                if match:
                    characters.add(int(match.group(1)))
                match = re.search(r'depth="(\d+)"', line)
                current_depth = int(match.group(1)) if match else None
                if 'placeFlagMove="true"' in line and current_depth is not None:
                    changed_depths.add(current_depth)
            elif 'type="RemoveObject' in line:
                removals += 1
        if '<matrix ' in line and current_depth is not None:
            matrix_changes += 1
        if '</item>' in line:
            depth -= 1
            current_depth = None
            if depth == 0:
                break

atlas = ROOT / "unity-project/Assets/StreamingAssets/takeover/anim/BlueArchers2Down_Go.png"
frames_dir = ROOT / "extracted/swf2/assets/sprites/DefineSprite_5673_BlueArchers2Down_Go_BlueArchers2Down_Go"
print(json.dumps({
    "sprite_id": SPRITE_ID,
    "frames": frames,
    "place_tags": placements,
    "matrix_tags": matrix_changes,
    "changed_depths": len(changed_depths),
    "remove_tags": removals,
    "unique_child_ids": len(characters),
    "child_ids": sorted(characters),
    "atlas_bytes": atlas.stat().st_size,
    "individual_frame_bytes": sum(p.stat().st_size for p in frames_dir.glob("*.png")),
}, indent=2))
