# Codex Image Brief — Sheer & Udder website

You are generating the photography for the Sheer & Udder launch site. The site is built separately; your only job is images.

> **Status / coordination (Claude, 2026-10-11):**
> - A first full pass of all 20 shots already exists in `assets/raw/`. Claude generated it through `codex exec`.
> - Please **review those images and improve or replace only the weak ones**. Overwrite `assets/raw/<id>.png` in place, and note which ids you changed at the bottom of this file under "Codex changes".
> - New ideas are welcome as extra shots. Save them as `assets/raw/extra-<name>.png` and describe them here.
> - Please don't edit `src/`, `index.html` or `public/img/`. Claude owns the site code and regenerates `public/img/` with `npm run images`.

## Deliverable
- Generate **one image per shot** listed in [`tools/image-prompts.json`](tools/image-prompts.json) with your image generation tool.
- Save each one as **`assets/raw/<id>.png`**, using the shot's `id` exactly (e.g. `assets/raw/flavor-tiramisu.png`). Don't rename or nest files.
- Use the `size` given for each shot (`1024x1536` portrait, `1536x1024` landscape, `1024x1024` square).
- Each prompt = the top-level `style` paragraph + the shot's `prompt`. Apply the style to every shot.
- If a shot has `ref`, attach that image (`assets/source/label-front.png`) as a reference. The tin and pouch must reproduce that label artwork faithfully: the pin-up cow in a brown dress on a glass of chocolate milk, the "Sheer & Udder" lettering and the "Adult Chocolate Milk Mix" banner.
- Skip any id that already exists in `assets/raw/` unless asked to redo it.

## Important: backgrounds
- Shots with `"cutout": true` must be on a **flat, solid studio backdrop** in the color the prompt names: light gray `#d9d9d9`, or near-black `#141414` for the milk splash.
- **Do not** fake transparency. A painted gray/white checkerboard has already happened once and is unusable.
- The site pipeline removes these backgrounds itself.
- Every other shot is a full-bleed photograph on the dark ganache palette described in `style`.

## Art direction (summary)
- **Mood:** "After Hours Dairy". A luxury spirits campaign meets a speakeasy: dark, warm, cinematic, chiaroscuro.
- **Colors:** ganache brown `#1a0f0a`–`#3b2117`, milk cream, antique gold accents, a hint of deep cherry red.
- **Consistency:** keep it across sets. The seven `flavor-*` still lifes share a composition (tall fluted glass, ingredients around the base, accent light in that flavor's hue). The seven `cocktail-*` shots share a bar-top setting.
- **Content:** no people, no hands, no added text, logos or watermarks. The only exceptions are the label on the tin and pouch.
- **Taste:** classy and appetizing, never crude. Mexican chocolate means cinnamon, chile and stone-ground chocolate, with no cultural costume props.

## Shot list (20)
| id | size | purpose on site |
|---|---|---|
| hero-tin | 1024x1536 | Hero product (cut out, floats over animated chocolate/milk shader) |
| hero-pouch | 1024x1536 | Alternate pack shown in cart and size picker |
| splash-chocolate | 1536x1024 | Decorative splash layers (cut out) |
| splash-milk | 1536x1024 | Decorative splash layers (cut out) |
| story-bar | 1536x1024 | "Lady of the House" story backdrop (text on the left third) |
| curtain | 1536x1024 | 21+ age-gate velvet curtain |
| flavor-classic, flavor-mexican, flavor-smores, flavor-boston-cream, flavor-tiramisu, flavor-pb-cup, flavor-german-chocolate | 1024x1536 | "Tasting Menu" flavor cards |
| cocktail-grown-banana, cocktail-cinnamon-outlaw, cocktail-campfire-confession, cocktail-espresso-undressed, cocktail-nutty-professor, cocktail-cream-of-the-crop, cocktail-coconut-confidential | 1024x1024 | "After-Hours Recipes" flip cards |

## When finished
List any shots you couldn't produce or aren't happy with. After that, run `npm run images` from the project root. It cuts out the backgrounds and builds the optimized AVIF/WebP sizes the site uses.

> Optional: `node tools/gen-images.mjs` automates this same list through `codex exec`. It works, but manual generation in a Codex session is fine too.
