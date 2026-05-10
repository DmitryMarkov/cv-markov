# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A single-page static CV/resume site (HTML + CSS, no JS framework) published at https://dmitrymarkov.pro. Source lives in `src/` (one HTML file, light-theme `main.css`, `dark-theme.css`); a Vite-driven pipeline emits a minified, versioned site to `build/`.

## Common commands

Yarn 4.14.1 is pinned via the `packageManager` field in `package.json`; Corepack downloads it on demand. First-time setup on a new machine: `corepack enable` (one-time, may need sudo on macOS), then `yarn install --immutable`.

- `yarn build` — `vite build`. Output → `build/` (HTML minified, `$version` replaced with `package.json#version`, `main.css` and `dark-theme.css` processed through PostCSS with autoprefixer + cssnano, `assets/` copied verbatim into `build/assets/`).
- `yarn serve` / `yarn start` — `vite` dev server with HMR. CSS files served live (autoprefixer applied on the fly, no minification); assets/ available at `/assets/...`; HTML transforms (`$version` and CSS-link injection) apply on every reload.
- `yarn preview` — `vite preview --port 4444`, serves the production `build/` for manual smoke-testing or visual-regression tests.
- `yarn build:favicons` — `node scripts/generate-favicons.mjs`. Manual, offline regeneration of favicon set from `materials/icon-transparent.png`. Writes 33 files into `assets/favicons/` and prints HTML tags into `src/_favicon-tags.html` (gitignored scratch file) for manual integration into `src/index.html`. Re-run only when the source icon changes — the generated files are committed and copied as-is during `yarn build`.
- `yarn test` — builds, then runs Mocha (`test/index.js`, 15s timeout). Will be replaced by Playwright in Phase 5; currently broken on Node 24 because `polyserve` is abandoned.
- `yarn test:update` — rebuilds, then regenerates the reference screenshots in `test/reference/{desktop,mobile}/`. Same Phase 5 caveat.
- Lint: `yarn css` (stylelint 17), `yarn css:fix`, `yarn html` (`html-validate` 10, pure JS, config in `.htmlvalidate.json`), `yarn markdown` (remark, scoped to CHANGELOG/README/TODO), `yarn editorconfig`, `yarn prettier` / `yarn prettier:fix`.
- `yarn security-audit` — `yarn npm audit --severity critical`; exits 0 unless a critical advisory is found.
- `yarn up` — interactive dependency upgrade (`yarn upgrade-interactive`, built-in to Yarn 4). Exact versions are enforced project-wide via `defaultSemverRangePrefix: ""` in `.yarnrc.yml`.


## Architecture

### Build pipeline (`vite.config.js`)

Vite's HTML/CSS bundling is too aggressive for this project (it inlines small CSS as base64 and renames bundles after the HTML page). Instead the config uses Vite as a thin orchestrator and handles CSS through a custom PostCSS plugin so filenames stay stable.

- `src/index.html` is the only Rollup input. The `inject-version-and-css` plugin runs `transformIndexHtml` with `order: 'post'` (after Vite's own asset rewrite) and: (a) substitutes `$version` for `package.json#version` and (b) replaces the `<!-- vite-css-injection -->` placeholder with the three `<link>` tags for `main.css` (preload + stylesheet) and `dark-theme.css` (media-query-gated). The `order: 'post'` is load-bearing — putting it `pre` lets Rolldown pick up `main.css` and bundle it under a hashed name.
- The `postcss-static-build` plugin runs in `closeBundle` (build only) and processes `src/main.css` and `src/dark-theme.css` through autoprefixer + cssnano (`discardComments: { removeAll: true }`), writing `build/main.css(+.map)` and `build/dark-theme.css(+.map)`.
- The `postcss-static-dev` plugin (serve only) installs a middleware that intercepts `/main.css` and `/dark-theme.css` and runs autoprefixer (no minification) on the fly.
- `vite-plugin-static-copy` copies `assets/` → `build/assets/` and serves the same files at `/assets/...` in dev. Source is an absolute path against `import.meta.dirname` because the plugin's fast-glob doesn't accept Vite's `root: 'src'`-relative paths well.
- `publicDir` is `false` — there is no Vite public folder; everything served at the site root comes from the static-copy plugin or build outputs. Favicon files referenced in HTML (`/favicon.ico` etc) currently 404 in dev/build until Phase 4 lands the offline favicon pipeline.

### Visual regression tests (`test/`)

The test suite is purely a pixel-diff harness — there is no DOM or unit testing.

1. `test/index.js` boots a `polyserve` server rooted at `build/` on port 4444.
2. For each viewport in `test/config/index.js` (`desktop` 1280×1080, `mobile` 375×667) and each route in `test/config/routes.js` (currently just `index`), Puppeteer takes a full-page screenshot to `test/screenshots/<viewport>/<route>.png`.
3. `pixelmatch` (threshold 0.1) compares against `test/reference/<viewport>/<route>.png`. The test asserts **0 different pixels** — any visual drift fails. Diff images are written to `test/screenshots/<viewport>/diff.png`.

Because the assertion is `equal(0)`, screenshots are platform-sensitive (font rendering differs Linux vs macOS). The CI test job is currently gated off (`if: false` in `.github/workflows/pipeline.yml`); run tests locally and regenerate references with `yarn test:update` for any deliberate UI change.

## Favicons

Generated offline by `scripts/generate-favicons.mjs` (the `favicons` npm package, depends on `sharp`). Output lives in `assets/favicons/` (33 PNG/ICO files plus `manifest.webmanifest` and `browserconfig.xml`) and gets copied into `build/assets/favicons/` by the same `vite-plugin-static-copy` target that handles `assets/`. URLs in HTML reference `/assets/favicons/...?v=$version` (Vite substitutes the version at build time). The manifest and browserconfig themselves do not carry cache-busting params on icon refs — they're loaded with `?v=$version` from the HTML and contain stable paths into the same icons folder.

`sharp` requires a postinstall build script. Yarn 4 disables those by default for security; the project enables it explicitly via `dependenciesMeta."sharp@0.33.5".built: true` in `package.json`. If `sharp`'s major version changes after a Renovate bump, update that key.

## HTML validation

`.htmlvalidate.json` extends `html-validate:recommended` but overrides two stylistic rules to align with Prettier (the source of truth for formatting): `doctype-style` accepts `lowercase` (Prettier 3 always lowercases `<!doctype html>`) and `void-style` accepts `selfclose` (Prettier outputs `<meta />`). Without these overrides, the formatter and the linter would chase each other forever. Substantive rules (alt text, attribute names, deprecated tags, accessibility) stay strict. The CI `html-validate` job no longer needs `actions/setup-java` — pure JS.

## Conventions enforced by tooling

- **Yarn 4** with `nodeLinker: node-modules` (no PnP). `.yarnrc.yml` sets `defaultSemverRangePrefix: ""` so every `yarn add` writes exact versions — preserve this when editing `package.json` by hand.
- **Conventional Commits** via commitlint (`commit-msg` husky 9 hook).
- **No direct commits to `master`** — `pre-commit` husky hook hard-fails. Work on a feature branch.
- `pre-commit` runs `lint-staged`: prettier + stylelint on `*.{css,html}`, remark on `!(CLAUDE).md` (CLAUDE.md is excluded from the markdown style-guide lint).
- Prettier config lives in `package.json`: `singleQuote`, no semicolons, `printWidth: 76`, `arrowParens: avoid`. Stylelint extends `stylelint-prettier/recommended`.
- Renovate is enabled with full automerge (including major); dependency PRs land on green CI without review.

## CI specifics

In `.github/workflows/pipeline.yml`, every job runs steps in this order: `actions/checkout` → `corepack enable` → `actions/setup-node@v6.4.0` (with `cache: 'yarn'`) → `yarn install --immutable`. `corepack enable` must come *before* `setup-node@cache:'yarn'`: setup-node calls `yarn cache dir` internally to locate the cache directory, and without corepack already enabled that call resolves to the runner's preinstalled Yarn 1.22, which refuses to run because of the `packageManager` mismatch. Corepack's shims read the active Node from PATH at call time, so enabling it before setup-node still picks up setup-node's Node correctly.

## Notes

- Node engines field requires `24`; CI jobs run on 24.x; the disabled test job is also set to 24.x; `Dockerfile` uses `node:24`. Use Node 24 locally, including if you want to run the screenshot tests under the same conditions as the Docker image.
- `assets/documents/*.pdf|.docx` are the downloadable CV files and are served as-is from `build/assets/`.
- `materials/` contains source artwork (PSD, master icon) — not shipped.
