# @tracespace/renderer

An SVG renderer for [@tracespace/plotter][] images.

Part of the [tracespace][] collection of PCB visualization tools.

**This package is still in development and is not yet published.**

```shell
npm install @tracespace/renderer@next
```

[@tracespace/plotter]: https://www.npmjs.com/package/@tracespace/plotter
[tracespace]: https://github.com/tracespace/tracespace

## usage

```js
import {createParser} from '@tracespace/parser'
import {plot} from '@tracespace/plotter'
import {render} from '@tracespace/renderer'

const syntaxTree = createParser().feed(/* ...some gerber string... */).results()
const imageTree = plot(syntaxTree)
const image = render(imageTree)
```

### script tag

If you're not using a bundler and you want to try out the parser in a browser, you can use a `script` tag:

```html
<script src="https://unpkg.com/@tracespace/parser"></script>
<script src="https://unpkg.com/@tracespace/plotter"></script>
<script src="https://unpkg.com/@tracespace/renderer"></script>
<script>
  // namespaces TracespaceParser, TracespacePlotter, and TracespaceRenderer available
  const {createParser} = TracespaceParser
  const {plot} = TracespacePlotter
  const {render} = TracespaceRenderer
</script>
```
