# tracespace

> PCB visualization tools for Node.js and the browser

tracespace is an open-source collection of tools to make looking at circuit boards on the internet easier.

## tools

* [tracespace viewer][viewer] - Online PCB viewer powered by `pcb-stackup`
* [pcb-stackup][] - Create SVG renders of PCBs by stacking gerber-to-svg renders
* [pcb-stackup-core][] - Layer stacking module for pcb-stackup
* [gerber-to-svg][] - Render Gerber and NC drill files as SVGs in Node and the browser
* [gerber-parser][] - Streaming Gerber/drill file parser
* [gerber-plotter][] - Streaming layer image plotter (consumer of `gerber-parser`)
* [whats-that-gerber][] - Identify Gerber and drill files by filename

## contributing

We could use your help maintaining and growing the tracespace ecosystem! Issues and pull requests are greatly appreciated.

### development setup

Most of the tracespace tools live here in this [monorepo][]. We use [lerna][] to manage this setup.

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

### tests

```shell
# run unit and integration tests tests with coverage and linting
yarn run test

# run unit and integration tests in watch mode (no coverage, no linting)
yarn run test:watch

# run unit tests in watch mode in Firefox and Chrome (using Karma)
# will autolaunch Chrome and/or Firefox if they're installed
yarn run test:browser
```

### integration tests

Automated integration tests consist of snapshot tests of SVG output, and are run automatically as part of `yarn run test`.

`pcb-stackup-core` and `gerber-to-svg` also have integration test servers that serve a set of reference renders for manual visual inspection.

```shell
# run all integration test servers
yarn run integration:server

# run server for a specific project
yarn run integration:server --scope gerber-to-svg
```

### linting and formatting

```shell
# format the code for styling
yarn run format

# lint the code for potential errors
yarn run lint
```

### publishing

Packages are published to npm by the CI server. To push a release, bump the version with the bump script

* Runs all tests
* Writes version to `package.json` in updated packages
* Generates / updates `CHANGELOG.md`
* Commits, tags, and pushes the release

```shell
# by default, bump to the next prerelease with identifier "next"
yarn run bump

# specify a bump level
# https://github.com/lerna/lerna#--cd-version
yarn run bump --cd-version=${major|minor|patch|premajor|preminor|prepatch|prerelease}
```

The release will be published to the `latest` npm tag for bare versions (e.g. `4.0.0`) and to `next` for pre-release versions (e.g. `4.0.0-next.0`).

[viewer]: http://viewer.tracespace.io
[pcb-stackup]: ./packages/pcb-stackup
[gerber-to-svg]: ./packages/gerber-to-svg
[pcb-stackup-core]: ./packages/pcb-stackup-core
[gerber-parser]: ./packages/gerber-parser
[gerber-plotter]: ./packages/gerber-plotter
[whats-that-gerber]: ./packages/whats-that-gerber
[monorepo]: https://github.com/babel/babel/blob/master/doc/design/monorepo.md
[yarn]: https://yarnpkg.com/
[lerna]: https://lernajs.io/
[conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
[commitizen]: https://commitizen.github.io/cz-cli/
