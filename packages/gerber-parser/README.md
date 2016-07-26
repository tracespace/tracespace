# gerber parser

[![npm](https://img.shields.io/npm/v/gerber-parser.svg?style=flat-square)](https://www.npmjs.com/package/gerber-parser)
[![Travis](https://img.shields.io/travis/mcous/gerber-parser.svg?style=flat-square)](https://travis-ci.org/mcous/gerber-parser)
[![Coveralls](https://img.shields.io/coveralls/mcous/gerber-parser.svg?style=flat-square)](https://coveralls.io/github/mcous/gerber-parser)
[![David](https://img.shields.io/david/mcous/gerber-parser.svg?style=flat-square)](https://david-dm.org/mcous/gerber-parser)
[![David](https://img.shields.io/david/dev/mcous/gerber-parser.svg?style=flat-square)](https://david-dm.org/mcous/gerber-parser#info=devDependencies)

A printed circuit board Gerber and drill file parser. Implemented as a Node transform stream that takes a Gerber text stream and emits objects to be consumed by some sort of PCB plotter.

## how to

`$ npm install gerber-parser`

``` javascript
var fs = require('fs')
var gerberParser = require('gerber-parser')

var parser = gerberParser()
parser.on('warning', function(w) {
  console.warn('warning at line ' + w.line + ': ' + w.message)
})

fs.createReadStream('/path/to/gerber/file.gbr')
  .pipe(parser)
  .on('data', function(obj) {
    console.log(JSON.stringify(obj))
  })
```

To run in the browser, this module should be bundled with a tool like [browserify](http://browserify.org/) or [webpack](http://webpack.github.io/).

## api

See [API.md](./API.md)

## developing and contributing

Tests are written in [Mocha](http://mochajs.org/) and run in Node and a variety of browsers with [Zuul](https://github.com/defunctzombie/zuul) and [Open Sauce](https://saucelabs.com/opensauce/). All PRs should be accompanied by unit tests, with ideally one feature / bugfix per PR. Code is linted with [ESLint](http://eslint.org/).

Code is deployed on tags via [TravisCI](https://travis-ci.org/) and code coverage is tracked with [Coveralls](https://coveralls.io/).

### build scripts

* `$ npm test` - runs Node unit tests, calculates coverage, and runs the `lint` task
* `$ npm run coverage` - print the coverage report of the last test run
* `$ npm run coverage:html` - generate an html report for the last test run
* `$ npm run lint` - lints code
* `$ npm run test:watch` - runs unit tests and re-runs on changes
* `$ npm run test:browser` - runs tests in a local browser
* `$ npm run test:sauce` - runs tests in Sauce Labs on multiple browsers
  * Sauce Labs account required
  * Local [.zuulrc](https://github.com/defunctzombie/zuul/wiki/Zuulrc) required
* `$ npm run ci` - Script for CI server to run
  * Runs `npm test` and sends coverage report to Coveralls
  * If not a PR, runs browser tests in Sauce
  * Not designed to (and won't) run locally

### deploying

The module is published to npm automatically by Travis if the commit is tagged (and tests pass). To deploy:

1. `$ npm version ...` - Use the npm version command to bump the version and tag the commit
2. `$ git push --tags` - Push the tag to trigger a build
