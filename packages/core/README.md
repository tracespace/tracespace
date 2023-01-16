# @tracespace/core

[![npm][npm badge]][npm package]

Use Gerber/drill files to create an SVG render of a finished PCB in Node.js or the browser. Part of the [tracespace][] collection of PCB visualization tools.

This library contains the main logic for tracespace's render pipeline, built up of the following lower-level libraries:

- [@tracespace/identify-layers][]
- [@tracespace/parser][]
- [@tracespace/plotter][]
- [@tracespace/renderer][]

[tracespace]: https://github.com/tracespace/tracespace
[@tracespace/identify-layers]: ../identify-layers
[@tracespace/parser]: ../parser
[@tracespace/plotter]: ../plotter
[@tracespace/renderer]: ../renderer
[npm package]: https://www.npmjs.com/package/@tracespace/core/v/next
[npm badge]: https://img.shields.io/npm/v/@tracespace/core/next?style=flat-square

## usage

```js
import fs from 'node:fs/promises'
import {read, plot, renderLayers, renderBoard} from '@tracespace/core'

const files = [
  'top-copper.gbr',
  'top-solder-mask.gbr',
  'top-silk-screen.gbr',
  'bottom-copper.gbr',
  'bottom-solder-mask.gbr',
  'outline.gbr',
  'drill.xnc',
]

const readResult = await read(files)
const plotResult = plot(readResult)
const renderLayersResult = renderLayers(plotResult)
const renderBoardResult = renderBoard(renderLayersResult)

await Promise.all([
  fs.writeFile('top.svg', renderBoardResult.top)
  fs.writeFile('bottom.svg', renderBoardResult.bottom)
])
```
