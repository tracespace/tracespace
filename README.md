# pcb stackup

[![npm](https://img.shields.io/npm/v/pcb-stackup.svg?style=flat-square)](https://www.npmjs.com/package/pcb-stackup)
[![Travis](https://img.shields.io/travis/tracespace/pcb-stackup.svg?style=flat-square)](https://travis-ci.org/tracespace/pcb-stackup)
[![Coveralls](https://img.shields.io/coveralls/tracespace/pcb-stackup.svg?style=flat-square)](https://coveralls.io/github/tracespace/pcb-stackup)
[![David](https://img.shields.io/david/tracespace/pcb-stackup.svg?style=flat-square)](https://david-dm.org/tracespace/pcb-stackup)
[![David](https://img.shields.io/david/dev/tracespace/pcb-stackup.svg?style=flat-square)](https://david-dm.org/tracespace/pcb-stackup#info=devDependencies)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/pcb-stackup.svg)](https://saucelabs.com/u/pcb-stackup)

Generate beautiful, precise SVG renders of printed circuit boards given a set
of Gerber and drill files. Powered by
[gerber-to-svg](https://github.com/mcous/gerber-to-svg) and
[pcb-stackup-core](https://github.com/tracespace/pcb-stackup-core).

Install with:

```
$ npm install --save pcb-stackup
```

## example

![arduino-uno-top](https://cloud.githubusercontent.com/assets/2963448/16046141/5bfba2d2-3219-11e6-8131-92c769218d62.png)

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


## developing and contributing

Clone and then `$ npm install`. Please accompany all PRs with applicable tests.
Please test your code in browsers, as Travis CI cannot run browser tests for
PRs.

### unit testing

This module uses [Mocha](http://mochajs.org/) and [Chai](http://chaijs.com/)
for unit testing, [Istanbul](https://github.com/gotwarlost/istanbul) for
coverage, and [ESLint](http://eslint.org/) for linting.

* `$ npm test` - run the tests, calculate coverage, and lint
* `$ npm run test:watch` - run the tests on code changes (does not lint nor cover)
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
