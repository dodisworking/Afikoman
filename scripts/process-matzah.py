#!/usr/bin/env python3
"""
Make matzah PNG background transparent (source file is opaque gray/black around the circle).
Uses flood-fill from corners: only neutral dark grays count as background.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


def is_background(r: int, g: int, b: int) -> bool:
    """True for flat dark gray / black around the matzah (not brown/tan bread pixels)."""
    lo, hi = min(r, g, b), max(r, g, b)
    spread = hi - lo
    # Colored matzah / char (brown, tan): channels differ a lot
    if spread > 26:
        return False
    # Light gray that could be matzah edge highlight
    if hi > 118:
        return False
    return True


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    src = root / "assets" / "matzah.source.png"
    out = root / "assets" / "matzah.png"
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    q: deque[tuple[int, int]] = deque()
    seen = [[False] * w for _ in range(h)]
    for x, y in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        r, g, b = px[x, y][:3]
        if is_background(r, g, b):
            q.append((x, y))
            seen[y][x] = True

    while q:
        x, y = q.popleft()
        r, g, b = px[x, y][:3]
        if not is_background(r, g, b):
            continue
        px[x, y] = (r, g, b, 0)
        for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx]:
                seen[ny][nx] = True
                q.append((nx, ny))

    im.save(out, "PNG")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
