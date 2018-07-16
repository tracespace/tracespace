# tracespace

[![monorepo][monorepo-badge]][monorepo]
[![ci][ci-badge]][ci]
[![coverage][coverage-badge]][coverage]
[![dev dependencies][dev-dependencies-badge]][dev-dependencies]

> PCB visualization tools for Node.js and the browser

tracespace is an open-source collection of tools to make looking at circuit boards on the internet easier.

[monorepo]: https://github.com/tracespace/tracespace
[ci]: https://travis-ci.org/tracespace/tracespace
[coverage]: https://codecov.io/gh/tracespace/tracespace
[dev-dependencies]: https://david-dm.org/tracespace/tracespace?type=dev
[monorepo-badge]: https://img.shields.io/badge/dynamic/json.svg?label=monorepo&url=https%3A%2F%2Fraw.githubusercontent.com%2Ftracespace%2Ftracespace%2Fnext%2Flerna.json&query=%24.version&prefix=v&style=flat-square&maxAge=3600
[ci-badge]: https://img.shields.io/travis/tracespace/tracespace.svg?style=flat-square&maxAge=3600
[coverage-badge]: https://img.shields.io/codecov/c/github/tracespace/tracespace.svg?style=flat-square&maxAge=3600
[dev-dependencies-badge]: https://img.shields.io/david/dev/tracespace/tracespace.svg?style=flat-square&maxAge=3600

## packages

[![pcb-stackup][pcb-stackup-badge]][pcb-stackup] - Render PCBs as beautiful, precise SVGs from Gerber / NC drill files  
[![pcb-stackup-core][pcb-stackup-core-badge]][pcb-stackup-core] - Layer stacking core logic for pcb-stackup  
[![gerber-to-svg][gerber-to-svg-badge]][gerber-to-svg] - Render individual Gerber / NC drill files as SVGs  
[![gerber-plotter][gerber-plotter-badge]][gerber-plotter] - Streaming layer image plotter (consumer of `gerber-parser`)  
[![gerber-parser][gerber-parser-badge]][gerber-parser] - Streaming Gerber/drill file parser  
[![whats-that-gerber][whats-that-gerber-badge]][whats-that-gerber] - Identify Gerber and drill files by filename  
[![@tracespace/fixtures][tracespace-fixtures-badge]][tracespace-fixtures] - Test fixtures for tracespace projects
[![@tracespace/cli][tracespace-cli-badge]][tracespace-cli]

[pcb-stackup]: ./packages/pcb-stackup
[pcb-stackup-core]: ./packages/pcb-stackup-core
[gerber-to-svg]: ./packages/gerber-to-svg
[gerber-plotter]: ./packages/gerber-plotter
[gerber-parser]: ./packages/gerber-parser
[whats-that-gerber]: ./packages/whats-that-gerber
[tracespace-fixtures]: ./packages/fixtures
[tracespace-fixtures]: ./packages/cli
[pcb-stackup-badge]: https://img.shields.io/npm/v/pcb-stackup.svg?label=pcb-stackup&style=flat-square&maxAge=3600
[pcb-stackup-core-badge]: https://img.shields.io/npm/v/pcb-stackup-core.svg?label=pcb-stackup-core&style=flat-square&maxAge=3600
[gerber-to-svg-badge]: https://img.shields.io/npm/v/gerber-to-svg.svg?label=gerber-to-svg&style=flat-square&maxAge=3600
[gerber-plotter-badge]: https://img.shields.io/npm/v/gerber-plotter.svg?label=gerber-plotter&style=flat-square&maxAge=3600
[gerber-parser-badge]: https://img.shields.io/npm/v/gerber-parser.svg?label=gerber-parser&style=flat-square&maxAge=3600
[whats-that-gerber-badge]: https://img.shields.io/npm/v/whats-that-gerber.svg?label=whats-that-gerber&style=flat-square&maxAge=3600
[tracespace-fixtures-badge]: https://img.shields.io/npm/v/@tracespace/fixtures.svg?label=@tracespace/fixtures&style=flat-square&maxAge=3600
[tracespace-fixtures-badge]: https://img.shields.io/npm/v/@tracespace/cli.svg?label=@tracespace/cli&style=flat-square&maxAge=3600

## examples

Renders of the [Arduino Uno][arduino] produced by [pcb-stackup][] and [gerber-to-svg][]:

![arduino uno top][top]
![arduino uno bottom][bottom]

Arduino Uno design files used under the terms of the [Creative Commons Attribution Share-Alike license][arduino-osh].

<details>
  <summary>Individual layers</summary>
  <h4>top copper</h4>
  <img
    title='arduino uno cmp'
    src='https://unpkg.com/gerber-to-svg@next/example/arduino-uno.cmp.svg'
  >

  <h4>drill hits</h4>
  <img
    title='arduino uno drd'
    src='https://unpkg.com/gerber-to-svg@next/example/arduino-uno.drd.svg'>

  <h4>outline</h4>
  <img
    title='arduino uno gko'
    src='https://unpkg.com/gerber-to-svg@next/example/arduino-uno.gko.svg'>

  <h4>top silkscreen</h4>
  <img
    title='arduino uno plc'
    src='https://unpkg.com/gerber-to-svg@next/example/arduino-uno.plc.svg'>

  <h4>bottom copper</h4>
  <img
    title='arduino uno sol'
    src='https://unpkg.com/gerber-to-svg@next/example/arduino-uno.sol.svg'>

  <h4>top soldermask</h4>
  <img
    title='arduino uno stc'
    src='https://unpkg.com/gerber-to-svg@next/example/arduino-uno.stc.svg'>

  <h4>bottom soldermask</h4>
  <img
    title='arduino uno sts'
    src='https://unpkg.com/gerber-to-svg@next/example/arduino-uno.sts.svg'>
</details>

[arduino]: https://www.arduino.cc/
[arduino-osh]: https://www.arduino.cc/en/Main/FAQ
[top]: https://unpkg.com/pcb-stackup@next/example/arduino-uno-top.svg
[bottom]: https://unpkg.com/pcb-stackup@next/example/arduino-uno-bottom.svg

### tracespace in the wild

* [viewer.tracespace.io][tracespace-viewer] - A Gerber viewer that lets you inspect the individual layers as well as the board preview
* [kitspace.org][kitspace] - An electronics project sharing site with links to easily buy the required parts
* [OpenHardware.io][openhardware] - A social site around open source hardware. Enables authors to sell and manufacture their boards.

[tracespace-viewer]: http://viewer.tracespace.io
[kitspace]: https://kitspace.org
[openhardware]: https://www.openhardware.io

## contributing

We could use your help maintaining and growing the tracespace ecosystem! Issues and pull requests are greatly appreciated.

### development setup

The tracespace tools live here in this [monorepo][]. We use [lerna][] to manage this setup.

Node v8 (lts/carbon) is recommended and [yarn][] is required.

```shell
# clone repository and install dependencies
git clone git@github.com:tracespace/tracespace.git
cd tracespace
yarn
```

This repository adheres to the [Conventional Changelog][conventional-changelog] commit specification for automatic changelog generation. We recommend installing [commitizen][commitizen] to ensure your commit messages are properly formatted:

```shell
yarn global add commitizen

# later, when you're ready to commit
git add some/files/*
git cz
```

[monorepo]: https://github.com/babel/babel/blob/master/doc/design/monorepo.md
[yarn]: https://yarnpkg.com/
[lerna]: https://lernajs.io/
[conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
[commitizen]: https://commitizen.github.io/cz-cli/

### tests

```shell
# run unit and integration tests tests with coverage and linting
yarn run test

# set SNAPSHOT_UPDATE=1 to update integration test snapshots
SNAPSHOT_UPDATE=1 yarn run test

# run unit tests in watch mode (no coverage, no linting)
yarn run test:watch

# set INTEGRATION=1 to also include integration tests
INTEGRATION=1 yarn run test:watch

# run unit tests in watch mode in Firefox and Chrome (using Karma)
# will autolaunch Chrome and/or Firefox if they're installed
# TODO: not yet implemented
# yarn run test:browser
```

### integration tests

Automated integration tests consist of [snapshot tests][snapshot-testing] of SVG and data outputs and are run automatically as part of `yarn run test`.

`pcb-stackup`, `pcb-stackup-core`, and `gerber-to-svg` also have integration test servers that serve a set of reference renders for manual visual inspection.

```shell
# run all integration test servers
yarn run integration:server

# run server for a specific project
yarn run integration:server --scope gerber-to-svg
```

[snapshot-testing]: https://facebook.github.io/jest/docs/en/snapshot-testing.html

### linting and formatting

```shell
# format the code for styling
yarn run format

# lint the code for potential errors
yarn run lint
```

### publishing

Packages are published to npm by the CI server. To publish a release, you must have write access to the repository. There is a `bump` script in the `package.json` that will:

* Run all tests
* Write new version to `package.json` in updated packages
* Generate / update the changelogs
* Commit, tag, and push to git

```shell
# by default, bump to the next prerelease with identifier "next"
# e.g. 4.0.0 -> 4.0.1-next.0
yarn run bump

# you may specify a bump level
# https://github.com/lerna/lerna#--cd-version
yarn run bump --cd-version=${major|minor|patch|premajor|preminor|prepatch|prerelease}

# to do a "dry run", you can stop before commit, tag, and push
yarn run bump --skip-git
```

The release will be published to the `latest` npm tag for bare versions (e.g. `4.0.0`) and to `next` for pre-release versions (e.g. `4.0.0-next.0`).
