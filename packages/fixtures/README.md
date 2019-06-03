# tracespace fixtures

[![latest][@tracespace/fixtures-latest-badge]][npm]
[![next][@tracespace/fixtures-next-badge]][npm-next]
[![david][@tracespace/fixtures-david-badge]][david]

> Test fixtures for tracespace projects

This module is a collection of data, including real-world open-source Gerber and drill files, used to drive tests on tracespace projects. It's published to npm so that any tool can use this data.

Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace
[npm]: https://www.npmjs.com/package/@tracespace/fixtures
[npm-next]: https://www.npmjs.com/package/@tracespace/fixtures/v/next
[david]: https://david-dm.org/tracespace/tracespace?path=packages/fixtures
[@tracespace/fixtures-latest-badge]: https://flat.badgen.net/npm/v/@tracespace/fixtures
[@tracespace/fixtures-next-badge]: https://flat.badgen.net/npm/v/@tracespace/fixtures/next
[@tracespace/fixtures-david-badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/fixtures

## install

Please note: because this package is a collection of test fixtures, it may not follow semver and changes could be introduced in _any_ version bump that cause your tests to fail. **You should install an exact version.**

```shell
npm install --save-dev --save-exact @tracespace/fixtures
# or
yarn add --dev --exact @tracespace/fixtures
```

## usage

```js
const fixtures = require('@tracespace/fixtures')
```

### gerber filenames

`gerber-filenames.json` is a JSON file with a collection of example Gerber / drill filenames along with what PCB layer type they represent organized by CAD package. This fixture is primarily used to test `whats-that-gerber`.

```js
const {gerberFilenames} = require('@tracespace/fixtures')
// or
const gerberFilenames = require('@tracespace/fixtures/gerber-filenames.json')
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
    /** expected whats-that-gerber type */
    type: string
  }>
}>
```

For non-npm projects, this file is also available via [the unpkg CDN][unpkg]:

```shell
curl https://unpkg.com/@tracespace/fixtures@${version}/gerber-filenames.json
```

[unpkg]: https://unpkg.com

### example boards

`@tracespace/fixtures` has a collection of sample open-source PCB files to test rendering full circuit boards. This fixture is primarily used to test `pcb-stackup` and `pcb-stackup-core`.

```js
const {getBoards} = require('@tracespace/fixtures')

// async
getBoards((error, boards) => {
  if (error) return console.error(error)
  console.log(boards)
})

// sync
const boards = getBoards.sync()
```

Where `boards` looks like:

```js
Array<{
  /** name of the board */
  name: string,
  /** path to the board's manifest */
  filepath: string,
  /** array of individual board layers */
  layers: Array<{
    /** name of the layer */
    name: string,
    /** path to the layer's gerber / drill file */
    filepath: string,
    /** basename of filepath */
    filename: string,
    /** format of the file */
    format: 'gerber' | 'drill',
    /** whats-that-gerber type of the layer */
    type: string,
    /** file contents (i.e. results of fs.readFile on filepath) */
    source: string
  }>
}>
```

### gerber specs

`@tracespace/fixtures` has a collection of simple Gerber and NC drill files to ensure proper rendering of different image primitives and structures. This fixture is primarily used to test `gerber-to-svg`.

```js
const {getGerberSpecs} = require('@tracespace/fixtures')

// async
getGerberSpecs((error, suites) => {
  if (error) return console.error(error)
  console.log(suites)
})

// sync
const suites = getGerberSpecs.sync()
```

Where `suites` looks like:

```js
Array<{
  /** name of the suite */
  name: string,
  /** array of individual specs in the suite */
  specs: Array<{
    /** name of the spec */
    name: string,
    /** category of the spec (matches suite's name) */
    category: string,
    /** path to the spec's gerber / drill file */
    filepath: string,
    /** file contents (i.e. results of fs.readFile on filepath) */
    source: string,
    /** SVG string of the expected render */
    expected: string
  }>
}>
```

### render suite server

Simple server to display the results of a render test. Has a peer dependency on Express, which you must install yourself before usage:

```shell
npm install --save-dev @tracespace/fixtures express
```

Usage:

```js
const {server, getGerberSpecs} = require('@tracespace/fixtures')

const app = server('suite name', getGerberSpecs, getSuiteResults)

app.listen(9000, () => console.log('listening on http://localhost:9000'))

function getSuiteResults(suite, done) {
  // get results of a single suite somehow and pass them to done
  done(null, suiteResults)
}
```

`server` is a function that takes:

1. `name` - A string name of the server
2. `getSuites` - One of `getGerberSpecs` or `getBoards`
3. `getSuiteResults` - An asynchronous function to render the results of one of the suites from `getSuites`

`getSuiteResults` should call its `done` callback with:

```js
{
  /** name of the suite */
  name: string,
  /** array of spec results in the suite */
  specs: Array<{
    /** name of the spec */
    name: string,
    /** spec render to display (SVG) */
    render: string,
    /** optional comparison render (SVG) */
    expected?: string,
    /** optional test source to display */
    source?: string,
  }>
}
```
