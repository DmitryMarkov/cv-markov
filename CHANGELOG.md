# Changelog

## v4.0.0 [unreleased]

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
- Migrated workflow set-output syntax to GITHUB\_OUTPUT
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
