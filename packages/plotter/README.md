# @tracespace/plotter

A image plotter for [@tracespace/parser][] ASTs.

Part of the [tracespace][] collection of PCB visualization tools.

**This package is still in development and is not yet published.**

```shell
npm install @tracespace/plotter@next
```

[@tracespace/parser]: https://www.npmjs.com/package/@tracespace/parser
[tracespace]: https://github.com/tracespace/tracespace

## usage

```js
import {createParser} from '@tracespace/parser'
import {createPlotter} from '@tracespace/plotter'

const parser = createParser()
const plotter = createPlotter()

parser.feed(/* ...some gerber string... */)

const syntaxTree = parser.results()
const imageTree = plotter.plot(syntaxTree)
```

### script tag

If you're not using a bundler and you want to try out the parser in a browser, you can use a `script` tag:

```html
<script src="https://unpkg.com/@tracespace/parser"></script>
<script src="https://unpkg.com/@tracespace/plotter"></script>
<script>
  // global variables TracespaceParser and TracespacePlotter now available
  const parser = TracespaceParser.createParser()
  const plotter = TracespacePlotter.createPlotter()
</script>
```
