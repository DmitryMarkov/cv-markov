# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A single-page static CV/resume site (HTML + CSS, no JS framework) published at https://dmitrymarkov.pro. Source lives in `src/` (one HTML file, light-theme `main.css`, `dark-theme.css`); a Gulp pipeline emits a minified, versioned site to `build/`.

## Common commands

Yarn 4.14.1 is pinned via the `packageManager` field in `package.json`; Corepack downloads it on demand. First-time setup on a new machine: `corepack enable` (one-time, may need sudo on macOS), then `yarn install --immutable`.

- `yarn build` — run default Gulp task: `clean` → parallel `copy:assets` + `do:css` + `do:html`. Output → `build/`.
- `yarn build:favicons` — `gulp publish`: same as build but also regenerates favicons via RealFaviconGenerator (network call).
- `yarn serve` / `yarn start` — currently a no-op (`gulp watch` task body is empty / `// todo`). There is no functional dev server. To preview, run `yarn build` and serve `build/` with any static server (e.g. `npx polyserve --root build`).
- `yarn test` — builds, then runs Mocha (`test/index.js`, 15s timeout). See "Testing" below.
- `yarn test:update` — rebuilds, then regenerates the reference screenshots in `test/reference/{desktop,mobile}/`. Run this after any intentional visual change.
- Lint: `yarn css` (stylelint 17), `yarn css:fix`, `yarn html` (W3C, requires Java), `yarn markdown` (remark, scoped to CHANGELOG/README/TODO), `yarn editorconfig`, `yarn prettier` / `yarn prettier:fix`.
- `yarn security-audit` — `yarn npm audit --severity critical`; exits 0 unless a critical advisory is found.
- `yarn up` — interactive dependency upgrade (`yarn upgrade-interactive`, built-in to Yarn 4). Exact versions are enforced project-wide via `defaultSemverRangePrefix: ""` in `.yarnrc.yml`.

To run a single test, use Mocha's `--grep`: `yarn build && npx mocha test/index.js --timeout 15000 --grep "desktop"`.

## Architecture

### Build pipeline (`gulpfile.js` + `gulp/*.js`)

`gulpfile.js` loads each task module and exposes a shared `global.$` (gulp, plugins, fs, del, package.json, config). Each `gulp/*.js` file exports a function that registers one task; the entry adds them all on require.

- `do:css` — postcss (autoprefixer + cssnano, comments stripped) with sourcemaps.
- `do:html` — replaces literal `$version` with `package.json#version` (used for cache-busting query strings on assets), then htmlmin.
- `copy:assets` — incremental copy of `assets/**/*` to `build/assets`.
- `favicon:generate` — calls RealFaviconGenerator API using `materials/icon-transparent.png`; writes icons to `build/` and metadata to `faviconData.json`. Versioned by `package.json#version`.
- `favicon:check-for-update` and `favicon:inject-markups` exist but are not wired into `default` or `publish`.

`default = clean → parallel(copy:assets, do:css, do:html)`. `publish` adds `favicon:generate` to that parallel group.

### Visual regression tests (`test/`)

The test suite is purely a pixel-diff harness — there is no DOM or unit testing.

1. `test/index.js` boots a `polyserve` server rooted at `build/` on port 4444.
2. For each viewport in `test/config/index.js` (`desktop` 1280×1080, `mobile` 375×667) and each route in `test/config/routes.js` (currently just `index`), Puppeteer takes a full-page screenshot to `test/screenshots/<viewport>/<route>.png`.
3. `pixelmatch` (threshold 0.1) compares against `test/reference/<viewport>/<route>.png`. The test asserts **0 different pixels** — any visual drift fails. Diff images are written to `test/screenshots/<viewport>/diff.png`.

Because the assertion is `equal(0)`, screenshots are platform-sensitive (font rendering differs Linux vs macOS). The CI test job is currently gated off (`if: false` in `.github/workflows/pipeline.yml`); run tests locally and regenerate references with `yarn test:update` for any deliberate UI change.

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
