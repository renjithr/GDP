import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Deployment base path.
 *
 * GitHub Pages project site  ->  https://USER.github.io/REPO/   ->  BASE_PATH=/REPO/
 * GitHub Pages user/org site ->  https://USER.github.io/        ->  BASE_PATH=/
 * Custom domain              ->  https://example.com/           ->  BASE_PATH=/  (+ CUSTOM_DOMAIN)
 *
 * Nothing in src/ hardcodes an absolute asset path; everything either goes through
 * Vite's asset pipeline or through `import.meta.env.BASE_URL` (see src/lib/paths.ts).
 */
const BASE_PATH = process.env.BASE_PATH ?? '/gdp-village/';
const CUSTOM_DOMAIN = process.env.CUSTOM_DOMAIN ?? '';

/**
 * Absolute origin+path the site will live at. Only used for absolute URLs that
 * social crawlers require (og:image, og:url, canonical). Everything the browser
 * itself loads uses relative/base-aware paths.
 */
const SITE_URL = (process.env.SITE_URL ?? `https://example.github.io${BASE_PATH}`).replace(/\/?$/, '/');

/** Emits the few static files GitHub Pages wants that Vite does not produce itself. */
function githubPagesFiles(base: string) {
  return {
    name: 'github-pages-files',
    apply: 'build' as const,
    transformIndexHtml(html: string) {
      return html.replaceAll('__SITE_URL__', SITE_URL);
    },
    closeBundle() {
      const out = (f: string) => resolve(__dirname, 'dist', f);

      // Tell Pages not to run the artifact through Jekyll.
      writeFileSync(out('.nojekyll'), '');

      // Hash routing means every real route is served by index.html, but a stray
      // deep path (or an old link) should still land somewhere useful instead of
      // GitHub's 404 page.
      writeFileSync(
        out('404.html'),
        `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
          `<title>Redirecting - GDP Village</title>` +
          `<meta name="robots" content="noindex">` +
          `<script>location.replace(${JSON.stringify(base)} + location.hash);</script>` +
          `</head><body><p>Redirecting to <a href="${base}">GDP Village</a>.</p></body></html>\n`,
      );

      if (CUSTOM_DOMAIN) writeFileSync(out('CNAME'), `${CUSTOM_DOMAIN}\n`);
    },
  };
}

export default defineConfig(({ command, isPreview }) => ({
  // The dev server runs at "/" so local URLs stay short. The build is prefixed — and so
  // is `vite preview`, which reports command: 'serve' but has to serve the built HTML's
  // absolute asset paths.
  base: command === 'build' || isPreview ? BASE_PATH : '/',
  plugins: [
    react(),
    {
      name: 'site-url-dev',
      apply: 'serve' as const,
      transformIndexHtml: (html: string) => html.replaceAll('__SITE_URL__', SITE_URL),
    },
    githubPagesFiles(BASE_PATH),
  ],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    modulePreload: {
      /**
       * Keep the 3D engine out of index.html's preload list.
       *
       * Vite preloads every manual chunk from the entry document, which would have the
       * browser fetching ~180 kB of three.js at high priority before Act 1 has painted.
       * The village still preloads its own dependencies at the moment its dynamic
       * import fires, which is what "lazy-load WebGL" is supposed to mean.
       */
      resolveDependencies: (_filename, deps, { hostType }) =>
        hostType === 'html' ? deps.filter((dep) => !/(three|r3f|VillageScene)-/.test(dep)) : deps,
    },
    rollupOptions: {
      output: {
        // three + fiber are lazy-loaded with the village; keeping them in their own
        // chunk means Act 1 never waits on the 3D engine.
        manualChunks(id) {
          // React must be its own chunk. Left unnamed it gets hoisted into the r3f
          // chunk (its only other consumer), which drags three.js into the first load.
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('@react-three')) return 'r3f';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
