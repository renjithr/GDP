# GDP Village

An interactive 3D explainer for India's Q1 FY 2026–27 GDP debate.

A visitor arrives believing there is a contradiction — India reported **7.8%** real growth, but
₹86.05 lakh crore becoming ₹88.27 lakh crore looks like **2.6%**. They leave understanding that
those two figures come from two different statistical series, that GDP is an estimate assembled
from real information rather than a count of every transaction, and that a base-year revision
legitimately changes past estimates in both directions.

The teaching device is a low-poly village, built procedurally in WebGL, that grows from 2010 to
2026 while the visitor drags a timeline. The village is the mental model; every number stays in
HTML.

**Live site:** `https://USERNAME.github.io/gdp-village/` *(after the deployment steps below)*

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload, served at `/` |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build locally at the real base path |
| `npm test` | Vitest — asserts the three growth calculations and the revision path |
| `npm run typecheck` | TypeScript only |

After `npm run build`, `npm run preview` serves at **http://localhost:4173/gdp-village/** — the
same sub-path the site uses on GitHub Pages, so base-path mistakes show up locally rather than
after a deploy.

---

## Deploying to GitHub Pages

The whole application is static. No server, database, API, serverless function or runtime secret
is involved; `dist/` is the entire product.

### 1. Create the repository and push

```bash
git init
git add .
git commit -m "GDP Village"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

### 2. Turn on GitHub Actions as the Pages source

In the repository: **Settings → Pages → Build and deployment → Source**, choose
**GitHub Actions**. Do not pick "Deploy from a branch" — there is no `gh-pages` branch and none
is needed.

### 3. Push

`.github/workflows/deploy.yml` runs on every push to `main`:

```
push to main → install → npm test → npm run build → upload dist/ → deploy to Pages
```

The first run also creates the `github-pages` environment. When it finishes, the URL appears in
the workflow summary and under Settings → Pages.

### 4. Set the base path (only if your repository has a different name)

The workflow derives the base path from the repository name automatically:

```yaml
BASE_PATH: /${{ github.event.repository.name }}/
```

so renaming the repository needs no code change. To build for a different path locally:

```bash
BASE_PATH=/my-repo/ npm run build
```

Nothing in `src/` hardcodes an absolute `/assets/...` path. Assets go through Vite's pipeline,
and anything that needs the deployment prefix reads `import.meta.env.BASE_URL`.

### 5. Optional: a custom domain

Moving from `USERNAME.github.io/REPOSITORY/` to `example.com` takes two changes and no rewriting:

1. In `.github/workflows/deploy.yml`, set `BASE_PATH: /` and uncomment
   `CUSTOM_DOMAIN: example.com`. The build then writes `dist/CNAME` for you.
2. Point DNS at GitHub Pages (an `ALIAS`/`ANAME` at the apex, or a `CNAME` for `www`), then set
   the domain under Settings → Pages and enable **Enforce HTTPS**.

`SITE_URL` in the workflow controls the absolute URLs in the Open Graph and canonical tags; set
it to the custom domain at the same time. Every in-page link is a hash route, so navigation and
internal links are unaffected by the move.

---

## Routing

Hash-based, deliberately.

GitHub Pages has no rewrite rules, so a history-API router would return a real 404 on any direct
link or refresh. Every shareable location therefore lives after the `#`:

`#/problem` · `#/village` · `#/estimated` · `#/timeline` · `#/base-year` · `#/revisions` ·
`#/nominal-vs-real` · `#/answer` · `#/faq` · `#/sources`

All of them resolve from the single `index.html`, on a project sub-path or a custom domain,
with no server configuration. The build also emits a `404.html` that redirects to the site root,
so a stray non-hash path lands somewhere useful rather than on GitHub's error page.

---

## Why Three.js + React Three Fiber

The candidates were PlayCanvas, Babylon.js, plain Three.js and React Three Fiber. R3F won on the
things this particular product needs:

- **The scene is state, not a level.** The village is driven by an economic state object that
  interpolates across year keyframes. Expressing "this building's scale follows the factory
  level" as a component beside the narrative that mentions it is worth a lot for maintenance,
  and R3F makes the 3D scene part of the same state graph as the UI.
- **Bundle weight.** Three.js is the lightest of the full-featured options for what is needed
  here, and R3F adds little on top. Babylon.js carries much more engine than this scene uses.
  No `drei` — the camera rig, the label projection and the instancing are hand-rolled, which
  avoids pulling in a large helper library for a handful of behaviours.
- **Lazy loading.** The 3D chunk is dynamically imported, so Act 1 renders and is fully
  interactive before three.js is requested at all. `vite.config.ts` keeps React in its own chunk
  and strips the 3D chunks from the HTML preload list, or Vite would helpfully preload ~180 kB
  of engine before first paint.
- **Static hosting.** No editor project format, no asset pipeline, no runtime service. The
  village is built from primitives in JavaScript, so there are no model or texture files to
  host at all.

### How the village is built

Everything is procedural — **no `.glb` files, no textures, nothing to download**. Parts are
accumulated into a small builder (`src/village/mesh.ts`), baked into a single merged geometry
with vertex colours, and drawn with one material. The whole static village — housing, bazaar,
civic buildings, poles, fields, roads — is a handful of draw calls. Trees, crops, people and
cartons are `InstancedMesh`. Crops sway in a vertex shader rather than on the CPU.

Performance behaviour worth knowing about:

- One canvas for the entire visit. No WebGL context is created or destroyed between sections.
- Rendering stops entirely (`frameloop="never"`) when the tab is hidden or the village is
  off-screen, and switches to on-demand rendering under `prefers-reduced-motion`.
- Device pixel ratio, tree/crop/people counts, vehicles and contact shadows all come from a
  quality profile detected once at startup (`src/lib/quality.ts`).
- Contact shadows are instanced sprites, not shadow maps.

---

## Project structure

```
src/
  data/            content and figures, deliberately separate from rendering
    actualIndiaData.ts        official MoSPI/PIB figures, each with a sourceId
    illustrativeVillageData.ts fictional teaching numbers, always badged
    sources.ts  sectors.ts  baseYearHistory.ts  faq.ts
    arithmetic.test.ts        the three growth calculations, asserted
  state/           hash routes and the app store
  story/           one component per act — the narrative and its copy
  components/      UI: calculators, the time slider, world-anchored labels
  village/         the 3D village
    layout.ts        the village plan: roads, plots, anchors, scatter
    worldState.ts    year keyframes and interpolation
    builders.ts      procedural geometry for every structure
    parts/           scene components, grouped by what they do
  fallback/        the same village states as plain DOM
public/            favicon, social card
scripts/           local screenshot + image generation helpers (not shipped)
```

### Data separation

`actualIndiaData.ts` holds only published Indian statistics, each carrying a `sourceId` that
resolves to an entry on the Sources page. `illustrativeVillageData.ts` holds only invented
teaching numbers, and everything drawn from it is rendered behind an `ILLUSTRATIVE EXAMPLE`
badge. The two are never combined in a single comparison.

---

## Accessibility

The explanation does not depend on WebGL.

- If WebGL is unavailable — or the visitor ticks **Simple view (no 3D)** in the footer — the
  village renders as DOM, driven by the same year states.
- Every sector is reachable as a keyboard-operable button; clicking the 3D object is a shortcut,
  never the only route. Selecting one exposes a text description of what the 3D is showing.
- The year slider is a native `<input type="range">`, so arrow keys work, with an
  `aria-valuetext` that reads the milestone rather than a bare number.
- `prefers-reduced-motion` removes ambient motion, cuts the camera instead of easing it, and
  reveals staged sequences immediately.
- The canvas is `aria-hidden`; all facts live in HTML, never as textures inside WebGL.
- `index.html` ships the complete argument as real markup, so search engines, crawlers and
  no-JavaScript visitors get the substance rather than an empty canvas.

---

## Sources

Every official figure is traceable to a MoSPI or PIB publication, listed with what it supports
on the `#/sources` page. Where a document's publication conventions are less precise — the older
base-year changes — the table says so rather than implying a precision that does not exist.

## Licence

Content and code in this repository are provided for reuse; the official statistics quoted
belong to their publishers and are cited accordingly.
