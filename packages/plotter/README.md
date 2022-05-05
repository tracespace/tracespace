# @tracespace/plotter

An image plotter for [@tracespace/parser][] ASTs.

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
import {plot} from '@tracespace/plotter'

const syntaxTree = createParser().feed(/* ...some gerber string... */).results()

const imageTree = plot(syntaxTree)
```

### script tag

If you're not using a bundler and you want to try out the parser in a browser, you can use a `script` tag:

```html
<script src="https://unpkg.com/@tracespace/parser"></script>
<script src="https://unpkg.com/@tracespace/plotter"></script>
<script>
  // namespaces TracespaceParser and TracespacePlotter now available
  const {createParser} = TracespaceParser
  const {plot} = TracespacePlotter
</script>
```
