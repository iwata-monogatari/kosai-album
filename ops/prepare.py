"""Run on the editor's private workstation after redaction. Requires Pillow."""
import argparse
from pathlib import Path
from PIL import Image, ImageOps
p=argparse.ArgumentParser()
p.add_argument('source',type=Path)
p.add_argument('output',type=Path)
a=p.parse_args()
with Image.open(a.source) as raw:
    if raw.width*raw.height>40_000_000 or getattr(raw,'is_animated',False):
        raise ValueError('長辺・画素数または静止画の条件をご確認ください')
    raw.load()
    rgb=ImageOps.exif_transpose(raw).convert('RGB')
    a.output.mkdir(parents=True,exist_ok=True)
    previous=None
    for size in (480,1280,2560):
        image=rgb.copy()
        image.thumbnail((size,size),Image.Resampling.LANCZOS)
        if image.size==previous: continue
        previous=image.size
        image.info.clear()
        target=a.output/(str(size)+'.webp')
        image.save(target,'WEBP',quality=85,method=6)
        with Image.open(target) as check:
            check.load()
            assert not any(check.info.get(k) for k in ('exif','xmp','icc_profile'))
