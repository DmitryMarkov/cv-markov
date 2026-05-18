# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A single-page static CV/resume site (HTML + CSS, no JS framework) published at https://dmitrymarkov.pro. Source lives in `src/` (one HTML file, light-theme `main.css`, `dark-theme.css`); a Vite-driven pipeline emits a minified, versioned site to `build/`.

## Common commands

Yarn 4.14.1 is pinned via the `packageManager` field in `package.json`; Corepack downloads it on demand. First-time setup on a new machine: `corepack enable` (one-time, may need sudo on macOS), then `yarn install --immutable`.

- `yarn build` — `vite build`. Output → `build/` (HTML minified, `$version` replaced with `package.json#version`, `main.css` and `dark-theme.css` processed through PostCSS with autoprefixer + cssnano, `assets/` copied verbatim into `build/assets/`).
- `yarn serve` / `yarn start` — `vite` dev server with HMR. CSS files served live (autoprefixer applied on the fly, no minification); assets/ available at `/assets/...`; HTML transforms (`$version` and CSS-link injection) apply on every reload.
- `yarn preview` — `vite preview --host 127.0.0.1 --port 4444`, serves the production `build/` for manual smoke-testing or visual-regression tests. The explicit `--host 127.0.0.1` is required for Playwright's `webServer` health check (bare default `localhost` resolves IPv6 first on Linux while Playwright uses IPv4).
- `yarn deploy` — `bash scripts/deploy.sh`. Rebuilds and mirrors `build/` to the production host via FTPS (forced TLS) using `lftp`. See "Deployment" below for one-time setup; requires `.env.deploy` to be filled in locally. Will fail loudly if any required env var is missing.
- `yarn build:favicons` — `node scripts/generate-favicons.mjs`. Manual, offline regeneration of favicon set from `materials/icon-transparent.png`. Writes 33 files into `assets/favicons/` and prints HTML tags into `src/_favicon-tags.html` (gitignored scratch file) for manual integration into `src/index.html`. Re-run only when the source icon changes — the generated files are committed and copied as-is during `yarn build`.
- `yarn test` — runs Playwright visual-regression tests *inside* the official Microsoft Playwright Docker container (`mcr.microsoft.com/playwright:v1.59.1-noble`) via `docker compose run --rm test`. The container does its own `yarn install --immutable && yarn build && yarn test:run`. This is the only sane way to run these tests: the assertion is `maxDiffPixels: 0` and font rendering differs Linux vs macOS, so the container guarantees identical rendering between local dev (mac) and CI (ubuntu-latest, same image).
- `yarn test:run` — direct `playwright test` invocation. Only useful inside the test container or in a CI job that already runs in the playwright image; running on macOS host will produce snapshots that the next Linux run rejects.
- `yarn test:update` — same as `yarn test` but with `--update-snapshots`; regenerates `tests/__screenshots__/<viewport>-<route>.png`. Run this after any intentional visual change.
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
- `publicDir` is `false` — there is no Vite public folder; everything served at the site root comes from the static-copy plugin or build outputs. Favicons live under `/assets/favicons/` (see "Favicons" below).

### Visual regression tests (`tests/`, `playwright.config.js`, `docker-compose.yml`)

`@playwright/test` 1.59.1 with full-page `toHaveScreenshot()` assertions and `maxDiffPixels: 0` (zero-tolerance). The harness covers two viewports — `desktop` 1280×1080 and `mobile` 375×667 — over the single `/` route. Reference snapshots live in `tests/__screenshots__/`.

The whole test run is wrapped in Docker:

- `docker-compose.yml` defines a single `test` service using `mcr.microsoft.com/playwright:v1.59.1-noble`. The image tag must stay in sync with the `@playwright/test` package version (mismatch makes Playwright unable to find browser executables) — both are pinned exactly and Renovate is configured (in `package.json#renovate.packageRules`) to group them into one PR with shared semver versioning.
- The container bind-mounts the repo to `/work` and uses a named volume `playwright-node-modules` for `/work/node_modules` — keeps the host's macOS-native sharp/etc binaries separate from the container's Linux ones.
- Container runs as root (the playwright image's default) because non-root + `corepack enable` runs into `/usr/bin` write permission errors and named-volume-init ownership issues. To keep generated files owned by the dev rather than `root:root` on Linux hosts, the entrypoint sets a `trap '... chown -R "$HOST_UID:$HOST_GID" ...' EXIT` that fires on success or failure. On macOS Docker Desktop this is a no-op (VirtioFS already translates UIDs); on Linux it makes `build/`, `tests/__screenshots__/`, `playwright-report/`, and `test-results/` writable by the dev. `yarn test`/`yarn test:update` export `HOST_UID`/`HOST_GID` from `id -u`/`id -g` before invoking docker compose.
- Container start sequence: `corepack enable && yarn install --immutable && yarn build && yarn test:run` (plus `--update-snapshots` if `yarn test:update` was the entrypoint). The Yarn 4 cache lives in `.yarn/cache` (per-project, gitignored) and persists across runs via the bind mount.
- `playwright.config.js` boots `yarn preview` as the `webServer` on `127.0.0.1:4444`. On failure, the HTML report writes into `playwright-report/`.
- CI runs the test job directly inside the same `mcr.microsoft.com/playwright:v1.59.1-noble` image (via the workflow's `container:` field) — no docker-compose involvement on the runner. The chown trap doesn't run there; the runner uploads `playwright-report` and `test-results` directly via `actions/upload-artifact` on failure.

To regenerate snapshots after an intentional visual change: `yarn test:update`, commit `tests/__screenshots__/`. Snapshots are platform-specific to the Playwright Linux image — never run `yarn test:run` directly on macOS.

## Favicons

Generated offline by `scripts/generate-favicons.mjs` (the `favicons` npm package, depends on `sharp`). Output lives in `assets/favicons/` (33 PNG/ICO files plus `manifest.webmanifest` and `browserconfig.xml`) and gets copied into `build/assets/favicons/` by the same `vite-plugin-static-copy` target that handles `assets/`. URLs in HTML reference `/assets/favicons/...?v=$version` (Vite substitutes the version at build time). The manifest and browserconfig themselves do not carry cache-busting params on icon refs — they're loaded with `?v=$version` from the HTML and contain stable paths into the same icons folder.

`sharp` requires a postinstall build script. Yarn 4 disables those by default for security; the project enables it explicitly via `dependenciesMeta.sharp.built: true` in `package.json` (bare ident, so it covers any sharp version Renovate bumps to).

## Deployment

Static site deploys to OrangeHost shared hosting (Micro plan, cPanel) via FTPS using `lftp`. Single command: `yarn deploy`. The script (`scripts/deploy.sh`) contains zero hardcoded credentials or host-specific values — everything is sourced from `.env.deploy` (gitignored). The committed template is `.env.deploy.example` with empty placeholders.

SSH/rsync was the original choice but OrangeHost support confirmed SSH is not available on the Micro plan despite "SSH Access (Jailed)" being listed in the marketing copy — only the cPanel key manager is exposed; sshd does not accept connections. FTPS is the working alternative.

### One-time local setup

1. Install `lftp`: `brew install lftp` (macOS) or `apt install lftp` (Debian/CI).
2. In cPanel → **FTP Accounts** → create a **dedicated** FTP user scoped to the document-root directory only (do **not** reuse the main cPanel password). Generate a strong password — it will live in `.env.deploy` and pass through `lftp` argv. Limiting the user's directory means a leaked password can only overwrite the public site, not touch other files.
3. Look up the FTP host + port in cPanel → FTP Accounts → "Configure FTP Client". Port is typically 21 (explicit FTPS via AUTH TLS).
4. `cp .env.deploy.example .env.deploy` and fill in: `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER` (the dedicated FTP login, often `something@<your-domain>`), `DEPLOY_PASSWORD`, `DEPLOY_PATH`. Optionally set `DEPLOY_VERIFY_URL` to the public URL of the site — when set, the script does a post-deploy `curl` smoke check and fails on non-2xx/3xx. Leave empty to skip verification. The file is gitignored — never commit it.
5. Sanity-check FTPS before the first deploy: `lftp -c "set ftp:ssl-force true; open -u $DEPLOY_USER,$DEPLOY_PASSWORD ftp://$DEPLOY_HOST; ls $DEPLOY_PATH/"` should list the current site files.

### What `yarn deploy` does

- Sources `.env.deploy`, validates required vars (`DEPLOY_PORT` defaults to 21).
- Always runs `yarn build` first — guarantees the deployed bundle matches current HEAD; no risk of shipping a stale `build/`.
- `lftp mirror --reverse --delete` from `build/` to `$DEPLOY_PATH/` over **forced FTPS** (`ftp:ssl-force true`, `ftp:ssl-protect-data true`, `ssl:verify-certificate true` — connection aborts if the server can't do TLS or has a bad cert). Excludes (anchored regex, top-level only): `^\.well-known/`, `^cgi-bin/`, `^\.htaccess$`, `^\.ftpquota$`. These are cPanel/Let's-Encrypt-managed; `--delete` would otherwise wipe them every deploy. Anchored on purpose — same-named files deeper in the tree (e.g. `dm/.ftpquota` from a stale FTP user's dir) are not protected and get cleaned up.
- If `DEPLOY_VERIFY_URL` is set, does a `curl` smoke check at the end and exits non-zero on non-2xx/3xx; otherwise prints "Skipping verification".

### Security

The repo is public; `scripts/deploy.sh` and `.env.deploy.example` must stay free of usernames, hostnames, ports, or absolute paths. Real values live only in `.env.deploy` on disk.

`DEPLOY_PASSWORD` passes through `lftp` argv and is briefly visible in `ps` on the local machine — acceptable on a single-user dev box, mitigated by using a dedicated path-restricted FTP account. To rotate: change the password in cPanel → FTP Accounts and update `.env.deploy`.

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

- Node engines field requires `>=24`; CI jobs run on 24.x; `Dockerfile` uses `node:24`. The Playwright test container ships its own Node (currently 22) — that's fine because `yarn install --immutable` runs inside the container.
- `assets/documents/*.pdf|.docx` are the downloadable CV files and are served as-is from `build/assets/`.
- `materials/` contains source artwork (PSD, master icon) — not shipped.
