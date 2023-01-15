# @tracespace/parser

[![npm][npm badge]][npm package]

Parse [Gerber][]/[drill][] files into abstract syntax trees based on the [unist][] format. Part of the [tracespace][] collection of PCB visualization tools.

This module is one part of the tracespace render pipeline, and you may not need to use it directly. See [@tracespace/core][] to integrate the full render pipeline into your project.

```shell
npm install @tracespace/parser@next
```

[gerber]: https://en.wikipedia.org/wiki/Gerber_format
[drill]: https://en.wikipedia.org/wiki/PCB_NC_formats
[unist]: https://unifiedjs.com/
[tracespace]: https://github.com/tracespace/tracespace
[@tracespace/core]: ../core
[npm package]: https://www.npmjs.com/package/@tracespace/parser/v/next
[npm badge]: https://img.shields.io/npm/v/@tracespace/parser/next?style=flat-square

## usage

```js
import fs from 'node:fs/promises'
import {parse} from '@tracespace/parser'

const gerberContents = await fs.readFile('gerber.gbr', 'utf-8')
const syntaxTree = parse(gerberContents)

await fs.writeFile('parse.json', JSON.stringify(syntaxTree, null, 2), 'utf-8')
```
