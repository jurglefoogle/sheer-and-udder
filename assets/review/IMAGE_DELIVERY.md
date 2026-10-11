# Sheer & Udder image delivery

All 20 shots in CODEX_IMAGE_BRIEF.md are present. The existing tools/gen-images.mjs batch used Codex’s built-in image generation tool through codex exec and completed with 20 successes and no failures. Existing renders were preserved; no duplicate generation or replacement was needed.

Each final generation prompt is the top-level style paragraph plus the corresponding shot prompt and size in tools/image-prompts.json. Packaging uses assets/source/label-front.png as its artwork reference.

Original PNGs: assets/raw/<id>.png. Transparent PNGs: assets/cut/<id>.png for the four cutout shots. Responsive AVIF/WebP exports: public/img/<id>-<width>.{avif,webp}. Runtime metadata: src/data/image-manifest.json. Review overview: assets/review/contact-sheet.png.

Visual review covered all 20 shots and the four cutouts on ganache brown. No shots are missing or flagged for regeneration. The seven cocktail originals arrived at 1254×1254 instead of the requested 1024×1024; their square composition is preserved at higher source resolution. The remaining thirteen originals match their requested dimensions.

| Shot | Original PNG | Actual size | Brief target | Transparent PNG |
|---|---|---|---|---|
| hero-tin | assets/raw/hero-tin.png | 1024×1536 | 1024×1536 | assets/cut/hero-tin.png |
| hero-pouch | assets/raw/hero-pouch.png | 1024×1536 | 1024×1536 | assets/cut/hero-pouch.png |
| splash-chocolate | assets/raw/splash-chocolate.png | 1536×1024 | 1536×1024 | assets/cut/splash-chocolate.png |
| splash-milk | assets/raw/splash-milk.png | 1536×1024 | 1536×1024 | assets/cut/splash-milk.png |
| story-bar | assets/raw/story-bar.png | 1536×1024 | 1536×1024 | — |
| curtain | assets/raw/curtain.png | 1536×1024 | 1536×1024 | — |
| flavor-classic | assets/raw/flavor-classic.png | 1024×1536 | 1024×1536 | — |
| flavor-mexican | assets/raw/flavor-mexican.png | 1024×1536 | 1024×1536 | — |
| flavor-smores | assets/raw/flavor-smores.png | 1024×1536 | 1024×1536 | — |
| flavor-boston-cream | assets/raw/flavor-boston-cream.png | 1024×1536 | 1024×1536 | — |
| flavor-tiramisu | assets/raw/flavor-tiramisu.png | 1024×1536 | 1024×1536 | — |
| flavor-pb-cup | assets/raw/flavor-pb-cup.png | 1024×1536 | 1024×1536 | — |
| flavor-german-chocolate | assets/raw/flavor-german-chocolate.png | 1024×1536 | 1024×1536 | — |
| cocktail-grown-banana | assets/raw/cocktail-grown-banana.png | 1254×1254 | 1024×1024 | — |
| cocktail-cinnamon-outlaw | assets/raw/cocktail-cinnamon-outlaw.png | 1254×1254 | 1024×1024 | — |
| cocktail-campfire-confession | assets/raw/cocktail-campfire-confession.png | 1254×1254 | 1024×1024 | — |
| cocktail-espresso-undressed | assets/raw/cocktail-espresso-undressed.png | 1254×1254 | 1024×1024 | — |
| cocktail-nutty-professor | assets/raw/cocktail-nutty-professor.png | 1254×1254 | 1024×1024 | — |
| cocktail-cream-of-the-crop | assets/raw/cocktail-cream-of-the-crop.png | 1254×1254 | 1024×1024 | — |
| cocktail-coconut-confidential | assets/raw/cocktail-coconut-confidential.png | 1254×1254 | 1024×1024 | — |

Validation: npm run images passed. All 20 requested IDs and 142 AVIF/WebP exports passed file, width and cutout alpha-channel checks. The manifest contains 22 images, including the two supplied labels. Full results: assets/review/validation.json. This delivery concerns images; site implementation is outside the image brief.
