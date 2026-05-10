![CI][actions-ci]

# Dmitry Markov's CV

Available on <https://dmitrymarkov.pro>.

## Local development

```sh
corepack enable           # one-time, may need sudo
yarn install --immutable
yarn serve                # Vite dev server with HMR
yarn build                # production build → ./build
yarn test                 # visual regression in Docker
```

See [CLAUDE.md](./CLAUDE.md) for the full architecture and tooling notes.

[actions-ci]: https://github.com/DmitryMarkov/cv-markov/actions/workflows/pipeline.yml/badge.svg?branch=master
