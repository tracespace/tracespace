# @tracespace/plotter

[![npm][npm badge]][npm package]

Plot [@tracespace/parser][] ASTs into image trees. Part of the [tracespace][] collection of PCB visualization tools.

This module is one part of the tracespace render pipeline, and you may not need to use it directly. See [@tracespace/core][] to integrate the full render pipeline into your project.

```shell
npm install @tracespace/plotter@next
```

[tracespace]: https://github.com/tracespace/tracespace
[@tracespace/parser]: ../parser
[@tracespace/core]: ../core
[npm package]: https://www.npmjs.com/package/@tracespace/plotter/v/next
[npm badge]: https://img.shields.io/npm/v/@tracespace/plotter/next?style=flat-square

## usage

```js
import fs from 'node:fs/promises'
import {parse} from '@tracespace/parser'
import {plot} from '@tracespace/plotter'

const gerberContents = await fs.readFile('gerber.gbr', 'utf-8')
const syntaxTree = parse(gerberContents)
const imageTree = plot(syntaxTree)

await fs.writeFile('plot.json', JSON.stringify(imageTree, null, 2), 'utf-8')
```
