# @tracespace/parser

[![latest][@tracespace/parser-latest-badge]][npm]
[![next][@tracespace/parser-next-badge]][npm-next]
[![david][@tracespace/parser-david-badge]][david]

**Gerber and drill file parser**

A parser for printed circuit board manufacturing files. Compiles [Gerber][gerber] and NC drill files into abstract syntax trees based on the [unist][] format.

Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace
[npm]: https://www.npmjs.com/package/@tracespace/parser
[npm-next]: https://www.npmjs.com/package/@tracespace/parser/v/next
[david]: https://david-dm.org/tracespace/tracespace?path=packages/parser
[@tracespace/parser-latest-badge]: https://flat.badgen.net/npm/v/@tracespace/parser
[@tracespace/parser-next-badge]: https://flat.badgen.net/npm/v/@tracespace/parser/next
[@tracespace/parser-david-badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/parser

## usage

See [the api section](#api) below for more details.

```js
import {createParser} from '@tracespace/parser'
// commonjs is cool, too
// const {createParser} = require('@tracespace/parser')

const parser = createParser()
parser.feed(/* ...some gerber string... */)
const tree = parser.results()
```

### script tag

If you're not using a bundler and you want to try out the parser in a browser, you can use a `script` tag:

```html
<script src="https://unpkg.com/@tracespace/parser"></script>
<script>
  // global variable TracespaceParser now available
  var parser = TracespaceParser.createParser()
</script>
```

### streaming usage

The parser is stateful, and can be fed multiple times. This means it can be used in a streaming environment. For example, you could read from a `ReadableStream` and return a Promise with the AST when the stream is done:

```js
function parseGerberStream(stream) {
  const parser = createParser()

  return new Promise((resolve, reject) => {
    const handleReadable = () => {
      let data
      while ((data = stream.read())) {
        parser.feed(data)
      }
    }

    const handleEnd = () => {
      cleanup()
      resolve(parser.results())
    }

    const handleError = error => {
      cleanup()
      reject(error)
    }

    const cleanup = () => {
      stream.removeListener('readable', handleReadable)
      stream.removeListener('end', handleEnd)
      stream.removeListener('error', handleError)
    }

    stream.on('error', handleError)
    stream.on('end', handleEnd)
    stream.on('readable', handleReadable)
  })
}
```

## api

### createParser(): Parser

```js
import {createParser} from '@tracespace/parser'
const parser = createParser()
```

`createParser` is used to create an instance of `Parser`. A `Parser` is stateful, so be sure to create a new parser for every file.

### Parser

```ts
// TypeScript
import {createParser, Parser} from '@tracespace/parser'
const parser: Parser = createParser()
```

The underlying `Parser` class is available as an export if you need the type definition (or if, for some reason, you prefer to do `new Parser()` instead of `createParser`). An instance of `Parser` has the following methods:

| method                       | return              | description                      |
| ---------------------------- | ------------------- | -------------------------------- |
| `parser.feed(chunk: string)` | `void`              | Parse the next chunk of the file |
| `parser.results()`           | [`Tree.Root`][root] | Get the parsed AST               |

`parser.feed` may be called with an entire file or partial chunks of a file. See the [syntax tree documentation][tree-docs] for information about the AST format and nodes returned by `parser.results`.

A `Parser` has the following public properties:

| property       | type             | description                       |
| -------------- | ---------------- | --------------------------------- |
| `parser.lexer` | [`Lexer`][lexer] | The parser's underlying tokenizer |

See the [lexer documentation][lexer-docs] for more information about the `Lexer` and how it tokenizes the files.

[tree-docs]: ./src/tree/README.md
[root]: ./src/tree/README.md#Root
[lexer-docs]: ./src/lexer/README.md
[lexer]: ./src/lexer/README.md#Lexer

### advanced usage

@tracespace/parser exports some of its lower level modules for advanced usage. If you'd like to check them out, see the following documentation:

- Lexer/tokenization: [`./src/lexer/README.md`][lexer-docs]
- AST and node types: [`./src/tree/README.md`][tree-docs]
