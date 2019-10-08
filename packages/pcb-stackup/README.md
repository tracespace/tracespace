# pcb stackup

[![latest][pcb-stackup-latest-badge]][npm]
[![next][pcb-stackup-next-badge]][npm-next]
[![david][pcb-stackup-david-badge]][david]

> Render PCBs as beautiful, precise SVGs from Gerber / NC drill files

Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace
[npm]: https://www.npmjs.com/package/pcb-stackup
[npm-next]: https://www.npmjs.com/package/pcb-stackup/v/next
[david]: https://david-dm.org/tracespace/tracespace?path=packages/pcb-stackup
[pcb-stackup-latest-badge]: https://flat.badgen.net/npm/v/pcb-stackup
[pcb-stackup-next-badge]: https://flat.badgen.net/npm/v/pcb-stackup/next
[pcb-stackup-david-badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/pcb-stackup

## install

```shell
npm install --save pcb-stackup
# or
yarn add pcb-stackup
```

Or, use a script tag:

```html
<script src="https://unpkg.com/pcb-stackup@^4.0.0/dist/pcb-stackup.min.js"></script>
<script>
  // global variable pcbStackup now available
  pcbStackup(layers).then(stackup => {
    // ...
  })
</script>
```

## example

![arduino-uno-top](https://unpkg.com/pcb-stackup@next/example/arduino-uno-top.svg)
![arduino-uno-bottom](https://unpkg.com/pcb-stackup@next/example/arduino-uno-bottom.svg)

After you clone and set-up the repository as detailed in [development setup](../..#development-setup), you can run `pcb-stackup`'s [example script](./example/index.js) to render the top and bottom of an Arduino Uno PCB.

```shell
cd tracespace/packages/pcb-stackup
yarn example
```

Arduino Uno design files used here under the terms of the [Creative Commons Attribution Share-Alike license](https://www.arduino.cc/en/Main/FAQ).

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
  gerber: fs.createReadStream(filename),
}))

pcbStackup(layers).then(stackup => {
  console.log(stackup.top.svg) // logs "<svg ... </svg>"
  console.log(stackup.bottom.svg) // logs "<svg ... </svg>"
})
```

## API

See [the API documentation](./API.md).

If your board doesn't appear at all or looks weirdly distorted, try rendering it
with the options `{maskWithOutline: false}` or filling in gaps in the outline
with e.g. `{outlineGapFill: 0.011}`.
