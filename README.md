# Sheer & Udder

Launch site for **Sheer & Udder**, an adult chocolate milk mix by Asinine Products.

Vite + TypeScript, GSAP (ScrollTrigger, SplitText), Lenis and an OGL WebGL hero shader.

```bash
npm install
npm run dev        # http://localhost:5173/sheer-and-udder/
npm run build      # type-check + production build to dist/
```

## Imagery

- `tools/image-prompts.json`: every shot's prompt (see `CODEX_IMAGE_BRIEF.md`)
- `npm run images:gen`: generate missing shots with the Codex CLI into `assets/raw/`
- `npm run images`: cut out product shots, build AVIF/WebP renditions into `public/img/`, and regenerate the favicon / OG image

## Deploy

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/pages.yml`.

## Waitlist

The form is front-end only. Set `WAITLIST_ENDPOINT` in `src/data/content.ts` (e.g. a Formspree URL) to collect real signups.
