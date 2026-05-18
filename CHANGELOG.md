# Changelog

## v4.3.0 [2026-05-18]

- Added Lighthouse CI job to pipeline.yml (treosh/lighthouse-ci-action)
- Runs against yarn preview, mobile profile, 3 runs averaged
- Asserts >=0.9 on all four categories (perf, a11y, best-practices, seo)
- Added to deploy job needs:; failed Lighthouse blocks production push
- Reports uploaded as workflow artifacts on every run

## v4.2.0 [2026-05-18]

- Added CI deploy job (auto on master push + manual workflow_dispatch)
- Deploy job gated by all lint/test jobs; only runs on refs/heads/master
- Concurrency group prevents overlapping production deploys
- Credentials sourced from GitHub Secrets, not the workflow file

## v4.1.0 [2026-05-18]

- Added scripts/deploy.sh + yarn deploy (FTPS via lftp to OrangeHost)
- Added .env.deploy.example template (.env.deploy gitignored)
- Documented one-time FTP account + lftp setup in CLAUDE.md

## v4.0.0 [2026-05-10]

- Bumped @commitlint/cli + config-conventional 20.5.0 -> 21.0.0
- Bumped lint-staged 13.2.3 -> 17.0.4 (four majors)
- Bumped editorconfig-checker 5.0.1 -> 6.1.1
- Renovate major.automerge -> false (review majors by hand)
- browserslist simplified to ["defaults", "not op_mini all"]
- README replaced multi-badge legacy with single CI badge
- TODO checked off completed items (local dev, dockerized tests)
- Replaced mocha/chai/puppeteer/pixelmatch/pngjs/polyserve with @playwright/test
- Tests run inside mcr.microsoft.com/playwright:v1.59.1-noble Docker image
- Added docker-compose.yml; yarn test wraps it locally
- Added yarn test:run for in-container/CI direct invocation
- Reference snapshots regenerated in tests/\_\_screenshots\_\_/
- Re-enabled CI test job (was if:false) using container: field
- Dropped legacy mocha CMD from Dockerfile
- vite preview now binds to 127.0.0.1 to align with Playwright baseURL
- Added "type": "module" to package.json (consistent ESM, no .mjs renames)
- Renovate groups @playwright/test and the playwright Docker image into one PR
- docker-compose entrypoint chowns generated files back to host UID on exit
- Added favicons 7.2.0 with offline scripts/generate-favicons.mjs
- Generated 33 static icons + manifest.webmanifest + browserconfig.xml
- Removed gulp-real-favicon (was Phase 2) and faviconData.json artifact
- yarn build:favicons now runs locally with no network call
- Favicons live under /assets/favicons/, cache-busted by ?v=$version
- Allowed sharp postinstall via dependenciesMeta in package.json
- Replaced node-w3c-validator (Java) with html-validate 10.15.0
- Added .htmlvalidate.json extending recommended preset
- Overrode doctype-style and void-style to match Prettier output
- Dropped actions/setup-java step from CI html-validate job
- Removed nodeW3Cvalidator config block from package.json
- Replaced Gulp pipeline with Vite 8.0.11 + custom PostCSS plugin
- Removed gulp and 7 plugins, plus del and standalone postcss.config.js
- Added vite-plugin-static-copy 4.1.0 for assets/ -> build/assets/
- yarn serve now boots a Vite dev server with HMR (was a no-op)
- yarn preview added (vite preview --port 4444) for production smoke
- yarn build:favicons removed (returns in Phase 4 as offline script)
- main.css and dark-theme.css filenames preserved in build output
- Migrated from Yarn Classic 1.22 to Yarn 4.14.1 via Corepack
- Added .yarnrc.yml with nodeLinker: node-modules and exact-version policy
- Set packageManager field in package.json
- Regenerated yarn.lock in v4 format
- Replaced manual yarn cache step in CI with setup-node cache: 'yarn'
- Replaced --frozen-lockfile with --immutable in CI and Dockerfile
- Dockerfile: dropped npm install -g yarn, switched to corepack
- Updated up script to yarn upgrade-interactive (built-in to v4)
- Rewrote security-audit as yarn npm audit --severity critical
- Added Yarn 4 ignore rules to .gitignore
- Bumped engines.node to >=24 (Node 24 LTS)
- Bumped CI Node version from 18.x to 24.x
- Updated GitHub Actions to current patch versions
- Migrated workflow set-output syntax to GITHUB_OUTPUT
- Migrated setup-java v1 (deprecated) to v4 with required distribution
- Upgraded Husky to 9.1.7 and rewrote hooks under v9 format
- Removed yarn check --integrity from pre-commit (deprecated)
- Fixed silently-broken lint-staged glob
- Bumped Stylelint to 17.11.0 and stylelint-prettier to 5.0.3
- Dropped redundant stylelint-config-prettier
- Added corepack enable step to CI jobs and Dockerfile
- Scoped remark to explicit files (excludes CLAUDE.md)
- Added CLAUDE.md for future Claude Code sessions

## v3.2.1 [2025-07-08]

- Changed title
- Tweak pipeline
- Removed unrelated experience

## v3.2.0 [2025-04-07]

- Added new experience (Allthings)
- Added security audit check to pipeline
- Upgrade runners from Nodejs 14.x to 18.x
- Added git hook to prevent commits directly to master
- Turn off screenshot tests on PRs

## v3.1.0 [2020-11-10]

- Added new experience (OXYGEN TECHNOLOGIES)
- Updated image assets, layout and styles (Lighthouse optimization)
- Updated node engine and dependencies

## v3.0.0 [2020-11-08]

- Added husky, lint-staged, commitlint, editorconfigchecker, markdown lint
- Added prettier, stylelint and renovate-bot
- Added gulp build pipeline
- Added GitHub Actions
- Added screenshot tests with Puppeteer
- Added versioning tag to assets to prevent undesired cashing
- Added icon generator and manifest
- Added dark theme
- Updated CV verbiage and assets

## v2.3.0 [2019-12-07]

- Improved Lighthouse analytics score (100/4)

## v2.2.0 [2019-12-02]

- Updated title, experience and assets
- Replaced Behance link with LinkedIn
- Updated icons format from woff to woff2

## v2.1.0 [2019-07-20]

- Added new experience (Allthings)
- Updated introduction

## v2.0.0 [2018-10-28]

- Removed russian version
- Updated last position experience
- Updated assets and verbiage
- Fixed list presentation on small viewports

## v1.0.0 [2018-07-22]

- Initial release
