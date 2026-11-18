# Cut the 1-pixel-per-block floor renders (raw/hires/floor-N-{surface,underground}.png) into Leaflet tiles.
# Leaflet CRS.Simple: at zoom z one block = 2^z px, so a 512px tile spans 512/2^z blocks.
# Output: site/tiles/<floor>/<layer>/<z>/<x>_<y>.webp  +  site/data/tiles.js (bounds and which tiles exist).
import json, os, sys
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.join(os.path.dirname(__file__), '..')
ORIGIN = {1: (-216, -165), 2: (-1075, -1075), 3: (-255, -79)}  # world X, Z of image pixel (0,0); found by tools register step
ZOOMS = [0, -1, -2, -3]
TILE = 512
manifest = {}
for fl, (ox, oz) in ORIGIN.items():
    for layer in ('surface', 'underground'):
        src = os.path.join(ROOT, 'raw', 'hires', f'floor-{fl}-{layer}.png')
        if not os.path.exists(src): continue
        im = Image.open(src).convert('RGBA'); w, h = im.size
        have = []
        for z in ZOOMS:
            span = TILE / 2 ** z  # blocks per tile
            tx0, tx1 = int((ox) // span), int((ox + w - 1) // span)
            ty0, ty1 = int((oz) // span), int((oz + h - 1) // span)
            for tx in range(tx0, tx1 + 1):
                for ty in range(ty0, ty1 + 1):
                    bx, bz = tx * span - ox, ty * span - oz  # tile corner in image pixels
                    crop = im.crop((int(bx), int(bz), int(bx + span), int(bz + span)))
                    if crop.getbbox() is None: continue  # fully transparent
                    if span != TILE: crop = crop.resize((TILE, TILE), Image.LANCZOS if span > TILE else Image.NEAREST)
                    d = os.path.join(ROOT, 'site', 'tiles', str(fl), layer, str(z)); os.makedirs(d, exist_ok=True)
                    crop.save(os.path.join(d, f'{tx}_{ty}.webp'), 'WEBP', quality=80, method=6)
                    have.append(f'{z}/{tx}_{ty}')
        manifest.setdefault(str(fl), {})[layer] = {'bounds': [ox, oz, ox + w, oz + h], 'tiles': have}
        print(fl, layer, len(have), 'tiles')
with open(os.path.join(ROOT, 'site', 'data', 'tiles.js'), 'w', encoding='utf-8') as f:
    f.write('window.TILES=' + json.dumps(manifest, separators=(',', ':')) + ';\n')
