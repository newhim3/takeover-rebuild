"""Attach RecruitmentController to the saved Cocos scene without replacing artwork."""
import json
import uuid
from pathlib import Path

project = Path(r"D:\cocos\takerovermini")
scene = project / "assets/scene.scene"
items = json.loads(scene.read_text(encoding="utf-8"))
canvas = items[2]
assert canvas["__type__"] == "cc.Node" and canvas["_name"] == "Canvas"
assert items[32]["_name"] == "1" and items[32]["__type__"] == "cc.Node"
assert items[41]["_name"].startswith("IconT1_B_")
assert all(i.get("__type__") != "RecruitmentController" for i in items)

items[32]["_name"] = "RecruitmentPanel"
items[32]["_active"] = False
for index in (41, 44, 47):
    items[index]["_active"] = False
    items[index]["_name"] = "Sample_" + items[index]["_name"]

script_uuid = "a84edfkv3JOHImW8wjamfWd"  # compressed form of the .ts.meta UUID
index = len(items)
canvas["_components"].append({"__id__": index})
items.append({
    "__type__": script_uuid,
    "_name": "",
    "_objFlags": 0,
    "__editorExtras__": {},
    "node": {"__id__": 2},
    "_enabled": True,
    "__prefab": None,
    "_id": "recruitmentController",
})
scene.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"wired {scene} component {index}")
