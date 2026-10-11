"""Removes the flat studio backdrop from shots flagged `"cutout": true` in image-prompts.json.

Reads assets/raw/<id>.png and writes an RGBA assets/cut/<id>.png.
- Light backdrops: alpha = max(rembg matte, colour-distance key), then edge colours are de-contaminated.
- Dark backdrops (milk splash): luminance key, which keeps fine droplets that matting models drop.
Usage: python tools/cutout.py [--force] [ids...]
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW, CUT = ROOT / "assets" / "raw", ROOT / "assets" / "cut"

try:
    from rembg import new_session, remove

    SESSION = new_session("isnet-general-use")
except Exception as exc:  # rembg is optional; the colour key still works on flat backdrops
    print(f"rembg unavailable ({exc.__class__.__name__}); using colour key only")
    SESSION = None


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def backdrop(px):
    border = np.concatenate([px[:8].reshape(-1, 3), px[-8:].reshape(-1, 3), px[:, :8].reshape(-1, 3), px[:, -8:].reshape(-1, 3)])
    return np.median(border, axis=0)


def cut(src: Path, dst: Path):
    img = Image.open(src).convert("RGB")
    px = np.asarray(img).astype(np.float32)
    bg = backdrop(px)
    dist = np.linalg.norm(px - bg, axis=2)

    if bg.mean() < 60:
        # Dark backdrop: treat brightness above the backdrop as coverage.
        lum = px.max(axis=2)
        alpha = smoothstep(bg.max() + 6, 235, lum) ** 0.8
    else:
        alpha = smoothstep(14, 70, dist)
        if SESSION is not None:
            matte = np.asarray(remove(img, session=SESSION, only_mask=True)).astype(np.float32) / 255
            alpha = np.maximum(alpha * (matte > 0.02), matte)

    alpha[alpha < 0.03] = 0  # drop backdrop noise so the bbox trims cleanly

    # Un-mix the backdrop from semi-transparent edge pixels.
    a = np.clip(alpha, 1e-3, 1)[..., None]
    rgb = np.clip((px - bg * (1 - a)) / a, 0, 255)
    rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    out = Image.fromarray(rgba, "RGBA")
    out = out.crop(out.getbbox())  # trim empty margins
    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, optimize=True)
    print(f"cut {src.name} -> {dst.relative_to(ROOT)} {out.size}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    shots = json.loads((ROOT / "tools" / "image-prompts.json").read_text(encoding="utf8"))["shots"]
    for shot in shots:
        if not shot.get("cutout") or (args and shot["id"] not in args):
            continue
        src, dst = RAW / f"{shot['id']}.png", CUT / f"{shot['id']}.png"
        if not src.exists():
            continue
        if dst.exists() and not force and dst.stat().st_mtime > src.stat().st_mtime:
            continue
        cut(src, dst)


if __name__ == "__main__":
    main()
