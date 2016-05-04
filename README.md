# pcb stackup

[![npm](https://img.shields.io/npm/v/pcb-stackup.svg?style=flat-square)](https://www.npmjs.com/package/pcb-stackup)
[![Travis](https://img.shields.io/travis/tracespace/pcb-stackup.svg?style=flat-square)](https://travis-ci.org/tracespace/pcb-stackup)
[![Coveralls](https://img.shields.io/coveralls/tracespace/pcb-stackup.svg?style=flat-square)](https://coveralls.io/github/tracespace/pcb-stackup)
[![David](https://img.shields.io/david/tracespace/pcb-stackup.svg?style=flat-square)](https://david-dm.org/tracespace/pcb-stackup)
[![David](https://img.shields.io/david/dev/tracespace/pcb-stackup.svg?style=flat-square)](https://david-dm.org/tracespace/pcb-stackup#info=devDependencies)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/pcb-stackup.svg)](https://saucelabs.com/u/pcb-stackup)

This module takes individual printed circuit board layer converters output by [gerber-to-svg](https://www.npmjs.com/package/gerber-to-svg) and uses them to build SVG renders of what the manufactured PCB will look like from the top and the bottom.

Install with:

```
$ npm install --save pcb-stackup
```

## example

``` javascript
var fs = require('fs')
var async = require('async')
var shortId = require('shortid')
var gerberToSvg = require('gerber-to-svg')
var whatsThatGerber = require('whats-that-gerber')
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

// asynchronously map a gerber filename to a layer object expected by pcbStackup
var mapFilenameToLayerObject = function(filename, done) {
  var gerber = fs.createReadStream(filename, 'utf-8')
  var type = whatsThatGerber(filename)
  var converterOptions = {
    id: shortId.generate(),
    plotAsOutline: type.id === 'out'
  }

  var converter = gerberToSvg(gerber, converterOptions, function(error, result) {
    if (error) {
      console.warn(filename + ' failed to convert')
      return done()
    }

    done(null, {type: type, converter: converter})
  })
}

// pass an array of layer objects to pcbStackup and write the stackup results
var handleLayers = function(error, layers) {
  if (error) {
    return console.error('error mapping gerber file paths to array of converters')
  }

  var stackup = pcbStackup(layers.filter(Boolean), 'my-board')
  fs.writeFileSync('path/to/top.svg', stackup.top)
  fs.writeFileSync('path/to/bottom.svg', stackup.bottom)
}

// map the gerber files to layer objects, then pass them to pcbStackup
async.map(gerberPaths, mapFilenameToLayerObject, handleLayers)
```

## usage

This module is designed to work in Node or in the browser with Browserify or Webpack. The  function takes two parameters: an array of layer objects and an options object. It returns an object with a `top` key and a `bottom` key, each of which contain the SVG string for that side of the board.

``` javascript
var pcbStackup = require('pcb-stackup')
var options = {id: 'my-board'}
var stackup = pcbStackup(layersArray, options)

console.log(stackup.top) // logs "<svg id="my-board_top"...</svg>"
console.log(stackup.bottom) // logs "<svg id="my-board_bottom"...</svg>"
```

### layers array

The first parameter to the function is an array of layer objects. A layer object is an object with a `type` key and a `converter` key, where `type` is a Gerber filetype as output by [whats-that-gerber](https://www.npmjs.com/package/whats-that-gerber) and `converter` is the converter object returned by gerber-to-svg for that Gerber file.

It is expected that the converters will have already finished before being passed to `pcbStackup`. This can be done by listening for the converter's `end` event or by using `gerber-to-svg` in callback mode, as shown in the example above.

``` javascript
var topCopperLayer = {
  type: GERBER_FILE_TYPE,
  converter: FINISHED_GERBER_TO_SVG_CONVERTER
}
```

### options

The second parameter of the pcbStackup function is an options object. The only required option is the `id` options. For ease, if no other options are being specified, the id string may be passed as the second parameter directly.

``` javascript
// stackup 1 and 2 are equivalent
var stackup1 = pcbStackup(layers, 'my-unique-board-id')
var stackup2 = pcbStackup(layers, {id: 'my-unique-board-id'})
```

key             | default   | description
----------------|-----------|-----------------------------------------------------------
id              | N/A       | Unique board identifier
color           | see below | Colors to apply to the board render by layer type
maskWithOutline | false     | Use the board outline layer as a mask for the board shape

#### id

The board ID is a string that is prefixed to `id` and `class` attributes of the internal nodes to the SVG documents. The IDs of any two stackups that may appear on the same web-page must be unique to avoid id collisions and potentially weird styling issues.

This option is required and the function will throw if it is missing.

#### color

The color object allows the user to override the default styling of the stackup. It consists of layer identifiers as the keys and CSS colors as the values. Any to all layers may be overridden. The default color object is:

``` javascript
var DEFAULT_COLOR = {
  fr4: '#666',
  cu: '#ccc',
  cf: '#c93',
  sm: 'rgba(0, 66, 0, 0.75)',
  ss: '#fff',
  sp: '#999',
  out: '#000'
}
```

The keys represent the following layers:

layer | component        
------|------------------
fr4   | Substrate
cu    | Copper
cf    | Copper (finished)
sm    | Soldermask
ss    | Silkscreen
sp    | Solderpaste
out   | Board outline

If a value is falsey (e.g. an empty string), the layer will not be added to the style node. This is useful if you want to add styles with an external stylesheet. If applying colors with an external stylesheet, use the following classnames and specify the `color` attribute:

layer | classname   | example (id = 'my-board')
------|-------------|-------------------------------------------------
fr4   | id + `_fr4` | `.my-board_fr4 {color: #666;}`
cu    | id + `_cu`  | `.my-board_cu {color: #ccc;}`
cf    | id + `_cf`  | `.my-board_cf {color: #c93;}`
sm    | id + `_sm`  | `.my-board_sm {color: #rgba(0, 66, 0, 0.75);}`
ss    | id + `_ss`  | `.my-board_ss {color: #fff;}`
sp    | id + `_sp`  | `.my-board_sp {color: #999;}`
out   | id + `_out` | `.my-board_out {color: #000;}`

#### mask board shape with outline

When constructing the stackup, a "mechanical mask" is built and applied to the final image to remove the image wherever there are drill hits. If the `maskWithOutline` option is passed as true, the stackup function will also add the board outline to this mechanical mask, effectively (but not literally) using the outline layer as a [clipping path](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath) for the final image.

`maskWithOutline` works best if the outline layer is one or more fully-enclosed loops. If your board outline is not working, please open an issue to see if we can improve the masking process.

### layer types

The stackup can be made up of the following layer types:

layer type               | abbreviation
-------------------------|--------------
top / bottom copper      | tcu / bcu
top / bottom soldermask  | tsm / bsm
top / bottom silkscreen  | tss / bss
top / bottom solderpaste | tsp / bsp
board outline            | out      
drill hits               | drl      

## developing and contributing

Clone and then `$ npm install`. Please accompany all PRs with applicable tests. Please test your code in browsers, as Travis CI cannot run browser tests for PRs.

### unit testing

This module uses [Mocha](http://mochajs.org/) and [Chai](http://chaijs.com/) for unit testing, [Istanbul](https://github.com/gotwarlost/istanbul) for coverage, and [ESLint](http://eslint.org/) for linting.

* `$ npm test` - run the tests, calculate coverage, and lint
* `$ npm run test:watch` - run the tests on code changes (does not lint nor cover)
* `$ npm run lint` - lint the code (will be run as a pre-commit script)

### integration testing

The integration tests run the example code on a variety of gerber files to ensure proper interfacing with `gerber-to-svg` and proper rendering of different stackups.

1. `$ npm run test:integration`
2. Open http://localhost:8001 in a browser

### browser testing

Browser tests are run with [Zuul](https://github.com/defunctzombie/zuul) and [Sauce Labs](https://saucelabs.com/opensauce/).

* `$ npm run test:browser` - run the unit tests in a local browser
* `$ npm run test:sauce` - run the units tests in several browsers using Open Sauce (Sauce Labs account and local [.zuulrc](https://github.com/defunctzombie/zuul/wiki/Zuulrc) required)
