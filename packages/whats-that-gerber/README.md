# what's that gerber?

[![npm](https://img.shields.io/npm/v/whats-that-gerber.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/whats-that-gerber)
[![Travis](https://img.shields.io/travis/tracespace/whats-that-gerber.svg?maxAge=2592000?style=flat-square)](https://travis-ci.org/tracespace/whats-that-gerber)
[![David](https://img.shields.io/david/tracespace/whats-that-gerber.svg?maxAge=2592000?style=flat-square)](https://david-dm.org/tracespace/whats-that-gerber)
[![David devDependencies](https://img.shields.io/david/dev/tracespace/whats-that-gerber.svg?maxAge=2592000?style=flat-square)](https://david-dm.org/tracespace/pcb-stackup#info=devDependencies)

Identify the probable PCB layer type of a Gerber or drill file by its filename.

## usage

``` javascript
var whatsThatGerber = require('whats-that-gerber')

console.log(whatsThatGerber('my-board-F_Cu.gbr'))

// logs:
// {id: 'tcu', name: 'top copper'}
```

### layer types

layer type         | id  | output
-------------------|-----|-------------------------------------------
gerber drawing     | drw | `{id: 'drw', name: 'gerber drawing'}`
top copper         | tcu | `{id: 'tcu', name: 'top copper'}`
top soldermask     | tsm | `{id: 'tsm', name: 'top soldermask'}`
top silkscreen     | tss | `{id: 'tss', name: 'top silkscreen'}`
top solderpaste    | tsp | `{id: 'tsp', name: 'top solderpaste'}`
bottom copper      | bcu | `{id: 'bcu', name: 'bottom copper'}`
bottom soldermask  | bsm | `{id: 'bsm', name: 'bottom soldermask'}`
bottom silkscreen  | bss | `{id: 'bss', name: 'bottom silkscreen'}`
bottom solderpaste | bsp | `{id: 'bsp', name: 'bottom solderpaste'}`
board outline      | out | `{id: 'out', name: 'board outline'}`
drill hits         | drl | `{id: 'drl', name: 'drill hits'}`

### supported cad programs

We should be able to identify files output by the following programs:

* KiCad
* Eagle
* Altium
* Orcad

## contributing

1. `$ git clone tracespace/whats-that-gerber`
2. `$ npm install`
3. `$ npm test`

If adding / modifying a filetype matcher, please remember to add / modify an example filename in [test/filenames-by-cad.js](test/filenames-by-cad.js).
