# pcb stackup
[![npm](https://img.shields.io/npm/v/pcb-stackup.svg?style=flat-square)](https://www.npmjs.com/package/pcb-stackup)
[![Travis](https://img.shields.io/travis/tracespace/pcb-stackup.svg?style=flat-square)](https://travis-ci.org/tracespace/pcb-stackup)
[![Coveralls](https://img.shields.io/coveralls/tracespace/pcb-stackup.svg?style=flat-square)](https://coveralls.io/github/tracespace/pcb-stackup)
[![David](https://img.shields.io/david/tracespace/pcb-stackup.svg?style=flat-square)](https://david-dm.org/tracespace/pcb-stackup)
[![David](https://img.shields.io/david/dev/tracespace/pcb-stackup.svg?style=flat-square)](https://david-dm.org/tracespace/pcb-stackup#info=devDependencies)

This module takes individual printed circuit board layers output by [gerber-to-svg](https://github.com/mcous/gerber-to-svg) and uses them to build SVG renders of what the manufactured PCB will look like from the top and the bottom.

Install with:

``` shell
$ npm install tracespace-pcb-stackup
```

Used by [trace | space](https://tracespace.io).

## usage
This module is designed to work in Node or in the browser with Browserify.

``` javascript
var pcbStackup = require('tracespace-pcb-stackup');
var myBoardStackup = pcbStackup(layersArray, 'my-board');
```

### input
The pcbStackup function takes two parameters: an array of layer objects and a board ID. The board ID is a string that is prepended to various IDs and class-names. A layer object is an object with a layer type and the SVG object output from `gerber-to-svg`:

``` javascript
var topCopperLayer = {
  type: 'tcu',
  svg: {svg: {...}}
};
```

### output
The function will output an object containing two keys: 'top' and 'bottom'. Both keys refer to an SVG object that can be run through `gerberToSvg` to obtain an SVG string of the top and bottom render, respectively. The SVG will be unstyled, but each component of the stackup has a class you can use to color it appropriately:


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
For each type of PCB layer, this module expects a three character abbreviation:

| layer type                  | abbreviation    |
|-----------------------------|-----------------|
| top / inner / bottom copper | tcu / icu / bcu |
| top / bottom soldermask     | tsm / bsm       |
| top / bottom silkscreen     | tss / bss       |
| top / bottom solderpaste    | tsp / bsp       |
| board outline               | out             |
| drill hits                  | drl             |
| generic drawing             | drw             |

As a convenience, this module contains a function to try to identify a layer type by its filename using common naming patterns from various EDA packages (Eagle, KiCad, Orcad, and Altium). For example:

``` javascript
var idLayer = require('tracespace-pcb-stackup/lib/layer-types').identify;
var filename = "some-project-F_Cu.gbr";
var layerType = idLayer(filename);

console.log(layerType); // logs 'tcu'
```

### stackup example
``` javascript
var fs = require('fs');
var gerberToSvg = require('gerber-to-svg');
var pcbStackup = require('tracespace-pcb-stackup');
var idLayer = require('tracespace-pcb-stackup/lib/layer-types').identify;

var gerbersPaths = [
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
];
var layers = [];

gerberPaths.forEach(function(filename) {
  var gerberString = fs.readFileSync(filename, 'utf-8');
  var layerType = idLayer(filename);
  var options = {object: true, drill: (layerType === 'drl')};
  var svgObj = gerberToSvg(gerberString, options);

  layers.push({type: layerType, svg: svgObj});
});

var stackup = pcbStackup(layers, 'my-board');
fs.writeFileSync('path/to/top.svg', gerberToSvg(stackup.top));
fs.writeFileSync('path/to/bottom.svg', gerberToSvg(stackup.bottom));
```

## developing
This module is written in CoffeeScript and uses Make to manage building and testing.

* `$ make` - build the JavaScript
* `$ make clean` - delete the JavaScript `lib` folder
* `$ make watch` - watch the source and recompile on changes
* `$ make test` - run the unit tests
* `$ make test-watch` - run the unit tests and rerun on changes
* `$ make test-phantom` - run the unit tests in PhantomJS
* `$ make test-browsers` - run the unit tests on SauceLabs
* `$ make lint` - lint the source and tests

### contributing
Please ensure all feature and bug-fix pull-requests include unit tests. There is a pre-commit hook that will automatically lint, compile, and add any changed lib files to the commit. Files in lib are source-controlled so you can `npm install` the module from GitHub.
