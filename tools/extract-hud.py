exec(open('tools/extract_ui.py',encoding='utf-8-sig').read().split("(out/'manifest.json')")[0])
for color,f in [('Green',0),('Red',1),('Blue',2),('Purple',3)]:
 extract('castle-window-'+color,'WindowCastleClass',f,True)
extract('resource-bar','GamePanelClass',crop=(458,578,870,612))
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
