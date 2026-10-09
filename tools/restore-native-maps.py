"""Rebuild each original map with its SWF timeline transforms and territory frames."""
import re,json
from pathlib import Path
base=Path('reference/native-canvas'); out=Path('assets/takeover/maps');out.mkdir(exist_ok=True)
xml=Path('../takeover拆解/scratch/swf.xml').read_text(encoding='utf8')
manifest=[]
for folder in sorted(base.iterdir()):
 m=re.search(r'DefineSprite_(\d+)_Level(\d+)Class',folder.name)
 if not m:continue
 sid,level=map(int,m.groups());html=(folder/'frames.html').read_text(encoding='utf8');support=(folder/'canvas.js').read_text(encoding='utf8');support=support.split("window.addEventListener('load'")[0]+support[support.index('function drawMorphPath'):]
 js=html.split('<script>var canvas=')[1].split('</script>')[0]
 js=js[js.index('var scalingGrids'):js.index('var frame = -1;')]
 assets=[]
 def imageurl(m):
  iid=int(m[1]);p=Path(f'assets/takeover/art/images/{iid}.png')
  if not p.exists():raise Exception(f'Missing image {iid}')
  assets.append(iid);return f'if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj{iid},"assets/takeover/art/images/{iid}.png","assets/takeover/packs/map-{level}.pack?v=20261006-r11");else imageObj{iid}.src="assets/takeover/art/images/{iid}.png";'
 js=re.sub(r'imageObj(\d+)\.src\s*=\s*"data:[^"]+";',imageurl,js)
 js=re.sub(r'var imageObj(\d+)\s*=\s*document.createElement\("img"\);',lambda m:f'var imageObj{m[1]}=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/{m[1]}.png"):document.createElement("img");',js)
 marker=f'function sprite{sid}(ctx,ctrans,frame,ratio,time){{';a=js.index(marker);root=js[a:];js=js[:a]
 root=re.sub(r'\tctx.transform\(1,0,0,1,[^;]+;','',root,count=1)
 # The sky belongs to the viewport, rather than a repeating rectangle in the map.
 root=re.sub(r'\s*place\("shape358"[^\n]+','',root)
 # Export-only viewport masks and the editor sky on the special battle map.
 # These rectangles are not terrain; drawing them directly leaves dark square frames.
 omitted=[]
 for cid in re.findall(r'place\("shape(\d+)"',root):
  f=re.search(r'function shape'+cid+r'\([^\n]*\)\{(.*?)\n\}',js,re.S)
  if not f:continue
  body=f[1]
  if ('M -2000 -2000' in body and '16000 12000' in body) or (cid=='5411' and '214,228,235' in body):
   root=re.sub(r'\s*place\("shape'+cid+r'"[^\n]+','',root);omitted.append(int(cid))
 pos=xml.index(f'spriteId="{sid}"');block=xml[pos:xml.index('</subTags>',pos)]
 regions={};object_regions={}
 for chunk in re.findall(r'<item type="PlaceObject\d*Tag".*?</item>',block,re.S):
  n=re.search(r'name="mc(?:Area|Roads|Objects)(\d+)"',chunk);c=re.search(r'characterId="(\d+)"',chunk)
  if n and c:
   regions[int(c[1])]=int(n[1])
   if 'name="mcObjects' in chunk:object_regions[int(c[1])]=int(n[1])
 for cid,loc in regions.items():
  root=re.sub(r'(place\("sprite'+str(cid)+r'"[^\n]*),time\);',lambda m:m[1]+f',ownerTime({loc}));',root)
 object_calls=[]
 for cid,loc in object_regions.items():
  call=re.search(r'place\("sprite'+str(cid)+r'",canvas,ctx,(\[[^\]]+\])',root)
  if call:object_calls.append({'symbol':cid,'location':loc,'matrix':json.loads(call[1])})
 # Levels 7/17/24 share shape5495 and the same original cliff transforms.
 # Preserve the original central mask, reconstruct only its rectangular export edges.
 land_mask_call=None;natural_mask=None;mask_image=None
 first_clip=root.find('clips.push({ctx:ctx,canvas:canvas});')
 if first_clip>=0:
  clip_match=re.search(r'place\("shape\d+"[^\n]+',root[first_clip:])
  if clip_match:land_mask_call=clip_match[0].strip()
 if level in (7,17,24) and land_mask_call and land_mask_call.startswith('place("shape5495"'):
  mask_path=out/'masks/level-7.png';mask_meta=out/'masks/level-7.json'
  if mask_path.exists() and mask_meta.exists():
   natural_mask=json.loads(mask_meta.read_text(encoding='utf8'));natural_mask['file']=mask_path.as_posix();mask_image=f'imageObj{9000000+level}'
   root=root.replace(land_mask_call,f'ctx.drawImage({mask_image},{natural_mask["left"]},{natural_mask["top"]});',1)
 js+=root
 support=support.replace('var place = function (obj, canvas, ctx, matrix, ctrans, blendMode, frame, ratio, time) {', 'var place = function (obj, canvas, ctx, matrix, ctrans, blendMode, frame, ratio, time) {\n    if(objectCollector){objectCollector.push({obj,matrix:concatMatrix(matrix,ctx._matrix),ctrans,blendMode,frame,ratio,time,location:objectLocation});return;}\n    if(groundOnly&&nativeObjectSymbols.has(obj))return;')
 bounds=re.search(r'ctx.transform\(1,0,0,1,([^,]+),([^\)]+)\)',html[html.index(marker):]);normal=[float(bounds[1]),float(bounds[2])] if bounds else [0,0]
 imagevars=sorted(set(re.findall(r'var (imageObj\d+)',js)))
 if mask_image:imagevars.append(mask_image)
 footer='\nconst loaded=['+','.join(imagevars)+'''].map(im=>new Promise(resolve=>{if(im.complete&&im.naturalWidth)resolve();else{im.addEventListener('load',resolve,{once:true});im.addEventListener('error',resolve,{once:true});}}));
Promise.all(loaded).then(()=>{window.NativeMaps[level]={draw(target,owners){ownerFrames=owners;const ctx=layerContext(target);try{DRAW(ctx,new cxform(0,0,0,0,255,255,255,255),0,0,0);}finally{canvas=null;}},drawGround(target,owners){groundOnly=true;try{this.draw(target,owners);}finally{groundOnly=false;}},objects:collectNativeObjects};window.dispatchEvent(new Event('native-map-ready'));});
})();'''
 footer=Path('tools/native-map-layers.js').read_text(encoding='utf8')+footer.replace('DRAW',f'sprite{sid}')
 header=f'''/* Original map geometry exported by JPEXS; isolated from the game renderer. */
(function(){{var Filters,BlendModes,canvas,ownerFrames={{}},level={level};
var groundOnly=false,objectCollector=null,objectLocation=0,nativeObjectRegions={json.dumps(object_calls,separators=(',',':'))};
var nativeObjectSymbols=new Set(nativeObjectRegions.map(r=>'sprite'+r.symbol));
function ownerTime(location){{return ownerFrames[location]??0;}}
'''
 if mask_image:
  name=natural_mask['file'];header+=f'var {mask_image}=window.NativeAssetPacks?window.NativeAssetPacks.image("{name}"):document.createElement("img");if(window.NativeAssetPacks)window.NativeAssetPacks.assign({mask_image},"{name}","assets/takeover/packs/map-{level}.pack?v=20261006-r11");else {mask_image}.src="{name}";\n'
 (out/f'level-{level}.js').write_text(header+support+'\n'+js+footer,encoding='utf8')
 manifest.append({'level':level,'symbol':sid,'images':len(set(assets)),'regions':regions,'normalization':normal,'hiddenEditorShapes':omitted,'objectRegions':object_calls,'landMaskCall':land_mask_call,'reconstructedEdgeMask':natural_mask})
Path('reference/native-map-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8');print('Restored',len(manifest),'maps with source transforms and faction frames')
