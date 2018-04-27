# pcb stackup

[![npm][npm-badge]][npm]

> Generate beautiful, precise SVG renders of PCBs from Gerber and drill files

## install

```shell
npm install --save pcb-stackup
# or
yarn add pcb-stackup
```

## example

![arduino-uno-top](https://tracespace.github.io/tracespace/example/arduino-top.svg)
![arduino-uno-bottom](https://tracespace.github.io/tracespace/example/arduino-bottom.svg)

After you clone and set-up the repository as detailed in [development setup](../..#development-setup), you can run `pcb-stackup`'s [example script](./example/index.js) to render the top and bottom of an Arduino Uno PCB.

```shell
cd tracespace/packages/pcb-stackup
yarn run example
```

Arduino Uno design files used here under the terms of the [Creative Commons Attribution Share-Alike license](https://www.arduino.cc/en/Main/FAQ).

## as seen on

* [viewer.tracespace.io](http://viewer.tracespace.io) - A Gerber viewer that lets you inspect the individual layers as well as the board preview
* [kitnic.it](https://kitnic.it) - An electronics project sharing site with links to easily buy the required parts
* [OpenHardware.io](https://www.openhardware.io) - A social site around open source hardware. Enables authors to sell and manufacture their boards.

## usage

This module is designed to work in Node or in the browser with Browserify or
Webpack. The function takes three parameters: an array of layer objects an
optional settings object and a callback function.

```javascript
const fs = require('fs')
const pcbStackup = require('pcb-stackup')

const fileNames = [
  '/path/to/board-F.Cu.gtl',
  '/path/to/board-F.Mask.gts',
  '/path/to/board-F.SilkS.gto',
  '/path/to/board-F.Paste.gtp',
  '/path/to/board-B.Cu.gbl',
  '/path/to/board-B.Mask.gbs',
  '/path/to/board-B.SilkS.gbo',
  '/path/to/board-B.Paste.gbp',
  '/path/to/board-Edge.Cuts.gm1',
  '/path/to/board.drl',
  '/path/to/board-NPTH.drl',
]

const layers = fileNames.map(filename => ({
  filename,
  gerber: fs.createReadStream(path),
}))

pcbStackup(layers, (error, stackup) => {
  if (error) return console.error(error)

  console.log(stackup.top.svg) // logs "<svg ... </svg>"
  console.log(stackup.bottom.svg) // logs "<svg ... </svg>"
})
```

## API

See [the API documentation](./API.md).

If your board doesn't appear at all or looks weirdly distorted try rendering it
with the options `{maskWithOutline: false}` or filling in gaps in the outline
with e.g. `{outlineGapFill: 0.011}`.

[![npm]()]()

[npm]: https://www.npmjs.com/package/pcb-stackup
[npm-badge]: https://img.shields.io/npm/v/pcb-stackup.svg?style=flat-square&maxAge=86400
