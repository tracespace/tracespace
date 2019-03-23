# gerber plotter

> Streaming Gerber / NC drill layer image plotter

[![latest][gerber-plotter-latest-badge]][npm]
[![next][gerber-plotter-next-badge]][npm-next]
[![david][gerber-plotter-david-badge]][david]

A printed circuit board Gerber and drill file plotter. Implemented as a Node transform stream that consumes objects output by [gerber-parser](../gerber-parser) and outputs PCB image objects.

Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace
[npm]: https://www.npmjs.com/package/gerber-plotter
[npm-next]: https://www.npmjs.com/package/gerber-plotter/v/next
[david]: https://david-dm.org/tracespace/tracespace?path=packages/gerber-plotter
[gerber-plotter-latest-badge]: https://flat.badgen.net/npm/v/gerber-plotter
[gerber-plotter-next-badge]: https://flat.badgen.net/npm/v/gerber-plotter/next
[gerber-plotter-david-badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/gerber-plotter

## install

```shell
npm install --save gerber-plotter
# or
yarn add gerber-plotter
```

`gerber-parser` is a peer dependency, so you probably want to install it too:

```shell
npm install --save gerber-parser
# or
yarn add gerber-parser
```

Or, use a script tag:

```html
<script src="https://unpkg.com/gerber-plotter@^4.0.0/dist/gerber-plotter.min.js"></script>
<script>
  // global variable gerberPlotter now available
  var plotter = gerberPlotter()
</script>
```

## example

```js
var fs = require('fs')
var gerberParser = require('gerber-parser')
var gerberPlotter = require('gerber-plotter')

var parser = gerberParser()
var plotter = gerberPlotter()

plotter.on('warning', function(w) {
  console.warn('plotter warning at line ' + w.line + ': ' + w.message)
})

plotter.once('error', function(e) {
  console.error('plotter error: ' + e.message)
})

fs.createReadStream('/path/to/gerber/file.gbr')
  .pipe(parser)
  .pipe(plotter)
  .on('data', function(obj) {
    console.log(JSON.stringify(obj))
  })
```

To run this module in a browser, it should be bundled with a tool like [browserify][] or [webpack][]. If you are using the script tag installation method instead, there will be a global variable `gerberPlotter` available after you have included `gerber-plotter.min.js`.

[browserify]: http://browserify.org/
[webpack]: https://webpack.js.org/

## api

See [API.md](./API.md)
