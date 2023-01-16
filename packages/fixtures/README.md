# @tracespace/fixtures

[![npm][npm badge]][npm package]

Sample Gerber/drill files for use as test fixtures. Part of the [tracespace][] collection of PCB visualization tools.

This module is a collection of data, including real-world open-source Gerber and drill files, used to drive tests on tracespace projects. It's published to npm so that any tool can use this data.

[tracespace]: https://github.com/tracespace/tracespace
[npm package]: https://www.npmjs.com/package/@tracespace/fixtures/v/next
[npm badge]: https://img.shields.io/npm/v/@tracespace/fixtures/next?style=flat-square

## install

Because this package is a collection of test fixtures, it may not follow semver and changes could be introduced in _any_ version bump that cause your tests to fail. **You should install an exact version.**

```shell
npm install --save-dev --save-exact @tracespace/fixtures@next
```

## usage

### gerber filenames

`gerber-filenames.json` is a JSON file with a collection of example Gerber / drill filenames along with what PCB layer type they represent organized by CAD package. This fixture is primarily used to test `@tracespace/identify-layers`.

```js
import gerberFilenames from '@tracespace/fixtures/gerber-filenames.json'
```

Where `gerberFilenames` looks like:

```js
Array<{
  /** CAD package, e.g. "eagle" */
  cad: string,
  /** collection of example Gerber and/or drill filenames */
  files: Array<{
    /** filename */
    name: string,
    /** expected @tracespace/identify-layers type */
    type: string
  }>
}>
```

For non-npm projects, this file is also available via the [unpkg][] CDN:

```shell
curl https://unpkg.com/@tracespace/fixtures@next/gerber-filenames.json
```

[unpkg]: https://unpkg.com
