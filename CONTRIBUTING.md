# Contributing Guide

Thanks for your interest in maintaining and growing the tracespace ecosystem!

## Issues and pull requests

Got a question, comment, or problem? File an [issue][]! If you are reporting a bug or rendering problem, please give as much detail as you can.

It's really helpful if you can share Gerber/drill files. If you are uncomfortable posting the files to GitHub, but you are still able to share them through another channel, please say so in the issue.

[Pull requests][] are greatly appreciated! Please strongly consider opening an issue before submitting a pull request. That way, we can provide guidance ahead of time.

[issue]: https://github.com/tracespace/tracespace/issues
[pull requests]: https://github.com/tracespace/tracespace/pulls

## Development setup

To get started, ensure [Node.js][] v18 (or later) is installed on your machine. Then, clone the repository and install tracespace's development dependencies with [corepack][] and [pnpm][].

```shell
git clone https://github.com/tracespace/tracespace.git
cd tracespace
corepack enable
pnpm install
```

[monorepo]: https://github.com/babel/babel/blob/main/doc/design/monorepo.md
[node.js]: https://nodejs.org
[corepack]: https://nodejs.org/dist/latest-v18.x/docs/api/corepack.html
[pnpm]: https://pnpm.io/

## Development scripts

We use `package.json` scripts to define various development tasks. Most of them live in the root [package.json](./package.json) of the repository.

### Check everything

Want to make sure absolutely everything works? Use the `all` script to remove all previously built assets and run all tests, checks, and builds.

```shell
pnpm all
```

### Run tests

Tests for all tracespace projects run from the top-level of the repository. Use the `test` script to run tests in watch mode, or the `test:once` script to run the test suite once, with coverage reporting.

```shell
pnpm test
pnpm test:once
```

### Code formatting and linting

Use `format` to ensure all your code adheres to the correct style, and `lint` to run code quality checks.

```shell
pnpm format
pnpm lint
```

### Build production assets

We build two types of production assets:

- Package bundles
- Type definitions

You can use the `build` and `clean` scripts to build and remove these assets, respectively.

```shell
pnpm build
pnpm clean
```

### Run the dev server

You can spin up the development server of the tracespace website using the `dev` script.

```shell
pnpm dev
```

## Publishing

We're still figuring out the deployment process for v5. Stay tuned!
