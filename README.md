# tracespace

[![ci badge][]][ci]
[![code coverage badge][]][code coverage]
[![license badge][]][license]
[![chat badge][]][chat]

> PCB visualization tools for Node.js and the browser

tracespace is an open-source collection of tools to make looking at circuit boards on the internet easier.

<!-- badge links -->

[ci]: https://github.com/tracespace/tracespace/actions
[code coverage]: https://codecov.io/gh/tracespace/tracespace/branch/v5
[license]: https://github.com/tracespace/tracespace/blob/main/LICENSE
[chat]: https://gitter.im/tracespace/Lobby

<!-- badges -->

[ci badge]: https://flat.badgen.net/github/checks/tracespace/tracespace/v5?label=ci
[code coverage badge]: https://flat.badgen.net/codecov/c/github/tracespace/tracespace/v5
[license badge]: https://flat.badgen.net/github/license/tracespace/tracespace
[chat badge]: https://flat.badgen.net/badge/icon/chat?icon=gitter&label&color=purple

## v5 checklist

**This is the branch for tracespace v5, which is still very much in development.**

- [x] Written in TypeScript
- `@tracespace/parser` package to generate [unist][] abstract syntax trees
  - [x] Parses Gerber files
  - [x] Parses drill files
  - [x] Syncronous by default but streaming compatible
  - [x] Fully covered by tests
  - [x] In-code documentation
- `@tracespace/plotter` package to take a board's collection of Gerber ASTs and generate image description trees
  - [ ] Can plot any Gerber file
  - [ ] Can plot any drill file
  - [ ] Infers coordinate format settings using the full context of all layers
  - [ ] Infers board outline
  - [ ] Fully covered by tests
  - [ ] In-code documentation
- `@tracespace/renderer` package to output [hast][] ASTs of the SVG translation of the image trees
  - [ ] Renders individual layer views
  - [ ] Renders board views
  - [ ] Covered by tests
  - [ ] In-code documentation
- [ ] tracespace CLI powered by new libraries
- [ ] tracespace view powered by new libraries
- [ ] documentation website

[unist]: https://unifiedjs.com/
[hast]: https://github.com/syntax-tree/hast

### issues

The v5 release will attempt to fix / address the following open issues:

- [ ] Handle disagreements between filename type vs parsed type ([#49][])
- [ ] Reduce number of `<use>` tags in SVG output ([#80][])
- [ ] Arc plotting should be more lenient ([#82][])
- [ ] Operation with non-existent tool should no-op with a warning ([#83][])
- [x] Fails to detect units if format spec combined with units spec ([#234][])
- [ ] clipPath for outline breaks in Firefox if outline has clear layers ([#302][])
- [x] gerberParser.parseSync clobbers filetype option ([#306][])
- [x] Gerber file starting with newline incorrectly identified as drill file ([#307][])
- [ ] Generate consistent document size for all layers. ([#324][])

[#49]: https://github.com/tracespace/tracespace/issues/49
[#80]: https://github.com/tracespace/tracespace/issues/80
[#82]: https://github.com/tracespace/tracespace/issues/82
[#83]: https://github.com/tracespace/tracespace/issues/83
[#234]: https://github.com/tracespace/tracespace/issues/234
[#302]: https://github.com/tracespace/tracespace/issues/302
[#306]: https://github.com/tracespace/tracespace/issues/306
[#307]: https://github.com/tracespace/tracespace/issues/307
[#324]: https://github.com/tracespace/tracespace/issues/324

## examples

Renders of the [Arduino Uno][arduino] produced by tracespace:

![arduino uno top][top]
![arduino uno bottom][bottom]

Arduino Uno design files used under the terms of the [Creative Commons Attribution Share-Alike license][arduino-osh].

<details>
  <summary>Individual layers</summary>
  <h4>top copper</h4>
  <img
    title='arduino uno cmp'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.cmp.svg'
  >

  <h4>drill hits</h4>
  <img
    title='arduino uno drd'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.drd.svg'>

  <h4>outline</h4>
  <img
    title='arduino uno gko'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.gko.svg'>

  <h4>top silkscreen</h4>
  <img
    title='arduino uno plc'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.plc.svg'>

  <h4>bottom copper</h4>
  <img
    title='arduino uno sol'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.sol.svg'>

  <h4>top soldermask</h4>
  <img
    title='arduino uno stc'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.stc.svg'>

  <h4>bottom soldermask</h4>
  <img
    title='arduino uno sts'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.sts.svg'>
</details>

[arduino]: https://www.arduino.cc/
[arduino-osh]: https://www.arduino.cc/en/Main/FAQ
[top]: https://unpkg.com/pcb-stackup@latest/example/arduino-uno-top.svg
[bottom]: https://unpkg.com/pcb-stackup@latest/example/arduino-uno-bottom.svg

### tracespace in the wild

- [tracespace.io/view][tracespace-view] - A Gerber viewer powered by the tracespace libraries
- [kitspace.org][kitspace] - An electronics project sharing site with links to easily buy the required parts
- [OpenHardware.io][openhardware] - A social site around open source hardware. Enables authors to sell and manufacture their boards.

[tracespace-view]: https://tracespace.io/view
[kitspace]: https://kitspace.org
[openhardware]: https://www.openhardware.io

## apps and libraries

| package                | description                                               |                                                                                                                 |
| ---------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [@tracespace/view][]   | Probably the best Gerber viewer on the internet           | <https://tracespace.io/view>                                                                                    |
| [@tracespace/cli][]    | Render PCBs as SVGs from the comfort of your own terminal | [![cli npm badge][]][cli npm] [![cli deps badge][]][cli deps]                                                   |
| [@tracespace/parser][] | Gerber and drill file parser                              | [![parser npm badge][]][parser npm] [![parser deps badge][]][parser deps] [![parser size badge][]][parser size] |
| [@tracespace/xml-id][] | XML ID generation and sanitation utilities                | [![xml-id npm badge][]][xml-id npm] [![xml-id deps badge][]][xml-id deps] [![xml-id size badge][]][xml-id size] |
| [whats-that-gerber][]  | Identify Gerber and drill files by filename               | [![wtg npm badge][]][wtg npm] [![wtg deps badge][]][wtg deps] [![wtg size badge][]][wtg size]                   |

<!-- monorepo links -->

[@tracespace/view]: ./apps/view
[@tracespace/cli]: ./packages/cli
[@tracespace/parser]: ./packages/parser
[@tracespace/xml-id]: ./packages/xml-id
[whats-that-gerber]: ./packages/whats-that-gerber

<!-- npm links -->

[cli npm]: https://www.npmjs.com/package/@tracespace/cli
[parser npm]: #
[xml-id npm]: https://www.npmjs.com/package/@tracespace/cli
[wtg npm]: https://www.npmjs.com/package/whats-that-gerber

<!-- npm version badges -->

[cli npm badge]: https://flat.badgen.net/npm/v/@tracespace/cli
[parser npm badge]: https://flat.badgen.net/badge/npm/wip/orange
[xml-id npm badge]: https://flat.badgen.net/npm/v/@tracespace/xml-id
[wtg npm badge]: https://flat.badgen.net/npm/v/whats-that-gerber

<!-- dependency links -->

[cli deps]: https://david-dm.org/tracespace/tracespace?path=packages/cli
[parser deps]: #
[xml-id deps]: https://david-dm.org/tracespace/tracespace?path=packages/xml-id
[wtg deps]: https://david-dm.org/tracespace/tracespace?path=packages/whats-that-gerber

<!-- dependency badge -->

[cli deps badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/cli
[parser deps badge]: https://flat.badgen.net/badge/dependencies/wip/orange
[xml-id deps badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/xml-id
[wtg deps badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/whats-that-gerber

<!-- bundle size links -->

[parser size]: #
[xml-id size]: https://bundlephobia.com/result?p=@tracespace/xml-id
[wtg size]: https://bundlephobia.com/result?p=whats-that-gerber

<!-- bundle size badge -->

[parser size badge]: https://flat.badgen.net/badge/minzipped%20size/wip/orange
[xml-id size badge]: https://flat.badgen.net/bundlephobia/minzip/@tracespace/xml-id
[wtg size badge]: https://flat.badgen.net/bundlephobia/minzip/whats-that-gerber

## contributing

We could use your help maintaining and growing the tracespace ecosystem! Issues and pull requests are greatly appreciated.

### development setup

The tracespace tools live here in this [monorepo][]. We use [yarn][] and [lerna][] to manage this setup.

Node v10 or later is required for development, but v12 is recommended.

```shell
# clone repository and install dependencies
git clone git@github.com:tracespace/tracespace.git
cd tracespace
yarn install
```

This repository adheres to the [Conventional Changelog][conventional-changelog] commit specification for automatic changelog generation. We recommend installing [commitizen][commitizen] to ensure your commit messages are properly formatted:

```shell
yarn global add commitizen

# later, when you're ready to commit
git add some/files/*
git cz
```

All development scripts below **should be run from the root of the repository**. Lerna handles delegating scripts downwards to the individual projects as necessary.

[monorepo]: https://github.com/babel/babel/blob/main/doc/design/monorepo.md
[yarn]: https://yarnpkg.com
[lerna]: https://lernajs.io/
[conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
[commitizen]: https://commitizen.github.io/cz-cli/

### tests

```shell
# run unit tests tests with coverage
yarn test

# run unit tests in watch mode (no coverage)
yarn test:watch
```

### development servers

`pcb-stackup`, `pcb-stackup-core`, `gerber-to-svg`, and `@tracespace/view` have development servers. The first three serve a set of reference renders for manual visual inspection, and the `@tracespace/view` development server builds and serves the web-app locally.

```shell
# run all dev servers
yarn start

# run server for a specific project
yarn start --scope @tracespace/view
```

### production assets

There are two production asset types that you can build:

- Full web-app bundles
  - `@tracespace/view`
- Standalone library bundles
  - `@tracespace/cli`
  - `@tracespace/xml-id`
  - `whats-that-gerber`

To build them:

```shell
# build production ESM bundles, UMD bundles, app bundles, and type definitions
yarn build

# build:all
# runs yarn build and also builds example files and documentation
yarn build:all

# build all bundles and serve them for testing/validation
yarn serve

# as with the dev server, these commands may be scoped by name
yarn serve --scope @tracespace/view
```

### linting and formatting

```shell
# format the code for styling
yarn format

# lint the code for potential errors
yarn lint

# typecheck any typescript code
yarn types
```

### publishing

Packages are published to npm by the CI server. To publish a release, you must have write access to the repository. There is a `bump` script in the `package.json` that will:

- Run all tests
- Write new version to `package.json` in updated packages
- Generate / update the changelogs
- Commit, tag, and push to git

First, checkout and pull down the latest commits on `main`:

```shell
git checkout main
get pull origin main
```

Then, bump the version:

```shell
# by default, bump to the next version as determined by conventional commits
yarn bump

# you may specify a bump level or exact version
# prerelease bumps will be prefixed with "next", e.g. 4.0.0 -> 4.0.1-next.0
# https://github.com/lerna/lerna/tree/master/commands/version#readme
yarn bump ${major|minor|patch|premajor|preminor|prepatch|prerelease}
yarn bump v42.0.0

# to do a "dry run", you can stop before commit and tag
yarn bump --no-git-tag-version
```

After you bump, push the commit and tag:

```shell
git push origin main --follow-tags
```

The release will be published to the `latest` npm tag for bare versions (e.g. `4.0.0`) and to `next` for pre-release versions (e.g. `4.0.0-next.0`).
