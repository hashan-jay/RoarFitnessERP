"""Remove solid black studio background while preserving dark clothing."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

INPUT = Path(__file__).resolve().parents[1] / "src/assets/images/hero-left-athlete.png"
OUTPUT = INPUT
THRESHOLD = 42
FEATHER = 28


def is_background(r: int, g: int, b: int) -> bool:
    return max(r, g, b) <= THRESHOLD


def remove_background(input_path: Path, output_path: Path) -> None:
    image = Image.open(input_path).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    visited = bytearray(width * height)
    background = bytearray(width * height)

    def index(x: int, y: int) -> int:
        return y * width + x

    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        idx = index(x, y)
        if visited[idx]:
            continue
        visited[idx] = 1

        r, g, b, _ = pixels[x, y]
        if not is_background(r, g, b):
            continue

        background[idx] = 1
        if x > 0:
            queue.append((x - 1, y))
        if x < width - 1:
            queue.append((x + 1, y))
        if y > 0:
            queue.append((x, y - 1))
        if y < height - 1:
            queue.append((x, y + 1))

    for y in range(height):
        for x in range(width):
            idx = index(x, y)
            r, g, b, a = pixels[x, y]
            brightness = max(r, g, b)

            if background[idx]:
                pixels[x, y] = (r, g, b, 0)
                continue

            if brightness <= THRESHOLD + FEATHER:
                alpha = int(255 * (brightness - THRESHOLD) / FEATHER)
                alpha = max(0, min(255, alpha))
                pixels[x, y] = (r, g, b, alpha)

    image.save(output_path, "PNG", optimize=True)


if __name__ == "__main__":
    remove_background(INPUT, OUTPUT)
    print(f"Saved transparent cutout to {OUTPUT}")
