# pcb stackup

[![GitHub stars](https://img.shields.io/github/stars/tracespace/pcb-stackup.svg?style=flat-square&label=%E2%AD%90&maxAge=86400)](https://github.com/tracespace/pcb-stackup)
[![GitHub issues](https://img.shields.io/github/issues/tracespace/pcb-stackup.svg?style=flat-square&maxAge=86400)](https://github.com/tracespace/pcb-stackup/issues)
[![npm](https://img.shields.io/npm/v/pcb-stackup.svg?style=flat-square&maxAge=86400)](https://www.npmjs.com/package/pcb-stackup)
[![Travis](https://img.shields.io/travis/tracespace/pcb-stackup/master.svg?style=flat-square&maxAge=86400)](https://travis-ci.org/tracespace/pcb-stackup)
[![codecov](https://img.shields.io/codecov/c/github/tracespace/pcb-stackup.svg?style=flat-square&maxAge=86400)](https://codecov.io/gh/tracespace/pcb-stackup)
[![David](https://img.shields.io/david/tracespace/pcb-stackup.svg?style=flat-square&maxAge=86400)](https://david-dm.org/tracespace/pcb-stackup)
[![David](https://img.shields.io/david/dev/tracespace/pcb-stackup.svg?style=flat-square&maxAge=86400)](https://david-dm.org/tracespace/pcb-stackup#info=devDependencies)
[![Gitter](https://img.shields.io/gitter/room/tracespace/pcb-stackup.js.svg?style=flat-square&?maxAge=2592000)](https://gitter.im/tracespace/pcb-stackup)
[![Badges](https://img.shields.io/badge/badges-9-ff69b4.svg?style=flat-square)](http://shields.io/)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/pcb-stackup.svg)](https://saucelabs.com/u/pcb-stackup)

Generate beautiful, precise SVG renders of printed circuit boards given a set
of Gerber and drill files. Powered by
[gerber-to-svg](https://github.com/mcous/gerber-to-svg) and
[pcb-stackup-core](https://github.com/tracespace/pcb-stackup-core).

Install with:

```
$ npm install --save pcb-stackup
```

## sites using this

- [viewer.tracespace.io](http://viewer.tracespace.io) - A Gerber viewer that lets you inspect the individual layers as well as the board preview
- [kitnic.it](https://kitnic.it) - An electronics project sharing site with links to easily buy the required parts
- [OpenHardware.io](https://www.openhardware.io) - A social site around open source hardware. Enables authors to sell and manufacture their boards.

## example

![arduino-uno-top](https://tracespace.github.io/pcb-stackup/example/arduino-top.svg)
![arduino-uno-bottom](https://tracespace.github.io/pcb-stackup/example/arduino-bottom.svg)

1. `$ git clone https://github.com/tracespace/pcb-stackup`
2. `$ cd pcb-stackup && npm install`
3. `$ npm run example`

[The example script](./example/arduino.js) builds a render of the [Arduino
Uno](https://www.arduino.cc/en/Main/ArduinoBoardUno) PCB. Arduino Uno design
files copyright by Arduino and shared under the terms of a Creative Commons
Attribution Share-Alike license (https://www.arduino.cc/en/Main/FAQ).

## usage

This module is designed to work in Node or in the browser with Browserify or
Webpack. The  function takes three parameters: an array of layer objects an
optional settings object and a callback function.


``` javascript
var pcbStackup = require('pcb-stackup')
var fs = require('fs')

var fileNames = [
  'board-F.Cu.gtl',
  'board-F.Mask.gts',
  'board-F.SilkS.gto',
  'board-F.Paste.gtp',
  'board-B.Cu.gbl',
  'board-B.Mask.gbs',
  'board-B.SilkS.gbo',
  'board-B.Paste.gbp',
  'board-Edge.Cuts.gm1',
  'board.drl',
  'board-NPTH.drl'
]

var layers = fileNames.map(function (path) {
  return {gerber: fs.createReadStream(path), filename: path}
})

pcbStackup(layers, function (error, stackup) {
  if (error) {
    throw error
  }

  console.log(stackup.top.svg) // logs "<svg ... </svg>"
  console.log(stackup.bottom.svg) // logs "<svg ... </svg>"
})
```

## API

See [the API documentation](./API.md).

If your board doesn't appear at all or looks weirdly distorted try rendering it
with the options `{maskWithOutline: false}` or filling in gaps in the outline
with e.g. `{outlineGapFill: 0.011}`.

## developing and contributing

Clone and then `$ npm install`. Please accompany all PRs with applicable tests.
Please test your code in browsers, as Travis CI cannot run browser tests for
PRs.

### unit testing

This module uses [Mocha](http://mochajs.org/) and [Chai](http://chaijs.com/)
for unit testing, [nyc](https://github.com/istanbuljs/nyc) for
coverage, and [ESLint](http://eslint.org/) for linting.

* `$ npm test` - run the tests, calculate coverage, and lint
* `$ npm run test:watch` - run the tests on code changes (does not lint nor cover)
* `$ npm run coverage` - print the coverage report of the last test run
* `$ npm run coverage:html` - generate an html report for the last test run
* `$ npm run lint` - lint the code (will be run as a pre-commit script)

### integration testing

The integration tests run the example code on a variety of gerber files to
ensure proper interfacing with `gerber-to-svg` and proper rendering of
different stackups.

1. `$ npm run test:integration`
2. Open http://localhost:8001 in a browser

### browser testing

Browser tests are run with [Zuul](https://github.com/defunctzombie/zuul) and [Sauce Labs](https://saucelabs.com/opensauce/).

* `$ npm run test:browser` - run the unit tests in a local browser
* `$ npm run test:sauce` - run the units tests in several browsers using Open Sauce (Sauce Labs account and local
[.zuulrc](https://github.com/defunctzombie/zuul/wiki/Zuulrc) required)
