# Jailoo parallax artwork

Source: `jailoo-cartoon-background.png`. Generated using the built-in imagegen tool, with alpha cleanup for the exported cutouts. All three plates share a 1672 × 941 canvas.

- `jailoo-sky-layer.png`: opaque sky and clouds; scroll speed 0.04.
- `jailoo-mountains-layer.png`: transparent above the mountains, opaque foothills and lake extending behind the meadow; scroll speed 0.16.
- `jailoo-foreground-layer.png`: transparent above the meadow, retaining flowers and rocks; scroll speed 0.34.

The section in `src/app/intro/Intro.tsx` uses the existing `useIntroAnimations` hook. Equal 16% overscan keeps the artwork aligned and covers the maximum scroll displacement. Horses and yurts move at the same depth as the meadow. Mobile movement is gentler; reduced-motion mode keeps the layers still.

## Generation prompts

### Sky

Edit target: supplied Jailoo landscape illustration. Create ONE production parallax layer, maintaining the original 1672:941 wide landscape aspect ratio, exact composition, scale, colors, painterly cartoon brushwork and object positions. Full canvas, no borders, no text, no labels, no rescaling or recentering of subjects. Use case: precise-object-edit. BACKGROUND SKY PLATE: retain the original blue sky and white clouds in their exact positions. Remove ALL mountains, hills, lake, grass, flowers, rocks and terrain, and inpaint the entire lower area with softly pale blue horizon sky. Output an opaque full-canvas sky-only image.

### Mountains

Edit target: supplied Jailoo landscape illustration. Create ONE production parallax layer, maintaining the original 1672:941 wide landscape aspect ratio, exact composition, scale, colors, painterly cartoon brushwork and object positions. Full canvas, no borders, no text, no labels, no rescaling or recentering of subjects. Use case: background-extraction. MIDGROUND MOUNTAIN PLATE on genuine transparent alpha: retain the original entire snow-capped mountain range and green/blue rolling foothills plus the distant lake, all at original canvas positions. Remove all sky and clouds above the exact jagged mountain skyline, making it fully transparent. Remove close wildflower meadow and foreground rocks below roughly 65% canvas height; extend the distant green pasture behind that area down to canvas bottom so the mountain plate has opaque terrain below the skyline, providing overlap behind the foreground. Keep peaks around 33-40% canvas height and lake around 52-62%. No sky, no white background, no checkerboard printed in image. Full landscape canvas, transparent ABOVE mountain silhouette, opaque BELOW silhouette through bottom edge.

### Foreground

Edit target: supplied Jailoo landscape illustration. Create ONE production parallax layer, maintaining the original 1672:941 wide landscape aspect ratio, exact composition, scale, colors, painterly cartoon brushwork and object positions. Full canvas, no borders, no text, no labels, no rescaling or recentering of subjects. Use case: background-extraction. FOREGROUND MEADOW PLATE on genuine transparent alpha: retain the original near green meadow, wildflowers and rocks, preserving their exact positions in lower portion. Remove sky, mountains, distant hills and lake; all area ABOVE the gently sloping near-meadow contour must be genuinely transparent. Meadow top silhouette starts at approximately x0 y470 (50% height), slopes to x550 y575 (61%), then x1100 y620 (66%), then x1672 y575 (61%), following existing natural grass contours. Preserve flowers and rocks at bottom exactly, keep full original wide canvas, opaque ground extends to bottom and side edges. No shadows outside cutout, no white background, no checkerboard printed in image.

