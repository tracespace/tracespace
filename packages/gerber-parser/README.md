# gerber parser

> Streaming Gerber/drill file parser

[![npm][npm-badge]][npm]

A printed circuit board Gerber and drill file parser. Implemented as a Node transform stream that takes a Gerber text stream and emits objects to be consumed by some sort of PCB plotter.

Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace
[npm]: https://www.npmjs.com/package/gerber-parser
[npm-badge]: https://img.shields.io/npm/v/gerber-parser.svg?style=flat-square&max-age=3600

## install

```
npm install --save gerber-parser
# or
yarn add gerber-parser
```

## example

```js
var fs = require('fs')
var gerberParser = require('gerber-parser')

var parser = gerberParser()

parser.on('warning', function(w) {
  console.warn('warning at line ' + w.line + ': ' + w.message)
})

fs
  .createReadStream('/path/to/gerber/file.gbr')
  .pipe(parser)
  .on('data', function(obj) {
    console.log(JSON.stringify(obj))
  })
```

To run this module in a browser, it should be bundled with a tool like [browserify][] or [webpack][].

[browserify]: http://browserify.org/
[webpack]: https://webpack.js.org/

## api

See [API.md](./API.md)
