# pcb stackup

[![npm](https://img.shields.io/npm/v/pcb-stackup.svg?style=flat-square)](https://www.npmjs.com/package/pcb-stackup)
[![Travis](https://img.shields.io/travis/tracespace/pcb-stackup.svg?style=flat-square)](https://travis-ci.org/tracespace/pcb-stackup)
[![Coveralls](https://img.shields.io/coveralls/tracespace/pcb-stackup.svg?style=flat-square)](https://coveralls.io/github/tracespace/pcb-stackup)
[![David](https://img.shields.io/david/tracespace/pcb-stackup.svg?style=flat-square)](https://david-dm.org/tracespace/pcb-stackup)
[![David](https://img.shields.io/david/dev/tracespace/pcb-stackup.svg?style=flat-square)](https://david-dm.org/tracespace/pcb-stackup#info=devDependencies)

This module takes individual printed circuit board layers output by [gerber-to-svg](https://www.npmjs.com/package/gerber-to-svg) and uses them to build SVG renders of what the manufactured PCB will look like from the top and the bottom.

Install with:

```
$ npm install --save pcb-stackup
```

## usage

This module is designed to work in Node or in the browser with Browserify or Webpack.

``` javascript
var pcbStackup = require('pcb-stackup')
var myBoardStackup = pcbStackup(layersArray, options)
```

### input

The pcbStackup function takes two parameters: an array of layer objects and an options object. A layer object is an object with a `filename` key and a `layer` key, where `filename` is the filename of the Gerber file and `layer` is the converter object returned by `gerber-to-svg` for that Gerber file.

It is expected that the converters will have already finished (which can be checked by listening for the converter's `end` event) before being passed to `pcbStackup`.

``` javascript
var topCopperLayer = {
  filename: GERBER_FILENAME,
  layer: FINISHED_GERBER_TO_SVG_CONVERTER
}
```

#### options

The second parameter of the pcbStackup function is an options object. The only required option is the `id` options. For ease, if no other options are being specified, the id string may be passed as the second parameter directly.


### output

The function will output an object containing two keys: 'top' and 'bottom'. Each key will hold the SVG string of that side of the board's render.

#### styling

| component         | classname         |
|-------------------|-------------------|
| Substrate         | ID + '_board-fr4' |
| Copper (masked)   | ID + '_board-cu'  |
| Copper (finished) | ID + '_board-cf'  |
| Soldermask        | ID + '_board-sm'  |
| Silkscreen        | ID + '_board-ss'  |
| Solderpaste       | ID + '_board-sp'  |

The classnames have the board ID prefixed so that, if you inline a stylesheet, the styles won't leak (as they are wont to do with inline stylesheets) to other PCB renders on the page.

### layer types

The stackup can be made up of the following layer types:

| layer type                  | abbreviation    |
|-----------------------------|-----------------|
| top / inner / bottom copper | tcu / icu / bcu |
| top / bottom soldermask     | tsm / bsm       |
| top / bottom silkscreen     | tss / bss       |
| top / bottom solderpaste    | tsp / bsp       |
| board outline               | out             |
| drill hits                  | drl             |
| generic drawing (not used)  | drw             |

### stackup example

``` javascript
var fs = require('fs')
var async = require('async')
var gerberToSvg = require('gerber-to-svg')
var pcbStackup = require('pcb-stackup')

var gerberPaths = [
  'path/to/board-F_Cu.gbr',
  'path/to/board-F_Mask.gbr',
  'path/to/board-F_SilkS.gbr',
  'path/to/board-F_Paste.gbr',
  'path/to/board-B_Cu.gbr',
  'path/to/board-B_Mask.gbr',
  'path/to/board-B_SilkS.gbr',
  'path/to/board-B_Paste.gbr',
  'path/to/board-Edge_Cuts.gbr',
  'path/to/board.drl'
]

async.map(gerberPaths, function(filename, done) {
  var gerber = fs.createReadStream(filename, 'utf-8')
  var converter = gerberToSvg(gerber, filename, function(error, result)) {
    if (error) {
      console.warn(filename + ' failed to convert')
      return done()
    }

    done(null, {filename: filename, layer: converter})
  }
}, function(error, layers) {
  if (error) {
    return console.error('error mapping gerber file paths to array of converters')
  }

  var stackup = pcbStackup(layers.filter(Boolean), 'my-board')
  fs.writeFileSync('path/to/top.svg', stackup.top)
  fs.writeFileSync('path/to/bottom.svg', stackup.bottom)
})
```

## developing and contributing

Clone and then `$ npm install`. Please accompany all PRs with applicable tests. Please test your code in browsers, as Travis CI cannot run browser tests for PRs.

### testing

This module uses [Mocha](http://mochajs.org/) and [Chai](http://chaijs.com/) for unit testing, [Istanbul](https://github.com/gotwarlost/istanbul) for coverage, and [ESLint](http://eslint.org/) for linting.

* `$ npm test` - run the tests, calculate coverage, and lint
* `$ npm run test:watch` - run the tests on code changes (does not lint nor cover)
* `$ npm run lint` - lint the code (will be run as a pre-commit script)

### browser testing

Browser tests are run with [Zuul](https://github.com/defunctzombie/zuul) and [Sauce Labs](https://saucelabs.com/opensauce/).

* `$ npm run test:browser` - run the unit tests in a local browser
* `$ npm run test:sauce` - run the units tests in several browsers using Open Sauce (Sauce Labs account and local [.zuulrc](https://github.com/defunctzombie/zuul/wiki/Zuulrc) required)
