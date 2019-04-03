# abstract syntax tree format

> AST format for @tracespace/parser

@tracespace/parser parses Gerber and drill files into an abstract syntax tree. The syntax tree format is based on [unist][].

The syntax trees produced are minimal, and may exclude portions of the original file if that information isn't strictly necessary for visualization or manufacturing.

[unist]: https://github.com/syntax-tree/unist

## node types

If you're using TypeScript, all the node types are `import`able:

```ts
import {Root, Header, CoordinateFormat /* ... */} from '@tracespace/parser'
```

Strings constants for nodes' `type` values are also exported in `SNAKE_CASE`:

```js
import {ROOT, HEADER, COORDINATE_FORMAT /* ... */} from '@tracespace/parser'

// ...

if (node.type === ROOT) console.log('node is a Root node')
```

### Root

Root node of the syntax tree.

```ts
interface Root {
  type: 'root'
  filetype: 'gerber' | 'drill' | null
  done: boolean
  children: [Header, Image]
}
```

| property   | description                                     |
| ---------- | ----------------------------------------------- |
| `filetype` | File format: Gerber, drill, or neither          |
| `done`     | Whether the parser encountered a "done" command |

If `filetype` is `null` or `done` is `false`, this may be a sign that a) the parser has not finished parsing the file or b) the file is invalid and/or not a Gerber or drill file.

Filetype constants are exported:

```js
import {GERBER, DRILL} from '@tracespace/parser'
```

### Header

Node representing the header section of the file. Contains format specifications and tool definitions.

```ts
interface Header {
  type: 'header'
  children: Array<Units | CoordinateFormat | ToolDefinition>
}
```

#### Units

Node representing a units specification (inches or millimeters) for the file

```ts
interface Units {
  type: 'units'
  units: 'mm' | 'in'
}
```

Units constants are exported:

```js
import {MM, IN} from '@tracespace/parser'
```

#### CoordinateFormat

Node representing the format specification for coordinate values in the file:

```ts
interface CoordinateFormat {
  type: 'coordinateFormat'
  format: [number, number] | null
  zeroSuppression: 'leading' | 'trailing' | null
  mode: 'absolute' | 'incremental' | null
}
```

| property          | description                               |
| ----------------- | ----------------------------------------- |
| `format`          | Integer/decimal format setting; See below |
| `zeroSuppression` | Zero suppression setting; See below       |
| `mode`            | Absolute or incremental coordinate system |

In Gerber and drill files, coordinates are (almost always) specified as strings of digits without decimal points. `format` is a tuple where the first element is the number of integer places in the string and the second is the number of decimal places. Leading or trailing zeros may also be omitted from the coordinate strings.

For example, with `format` set to `[2, 4]`, some (intermediate) coordinate strings could be:

- `0.012` > `000120`
- `2.45` > `024500`
- `67` > `670000`

With those same numbers, either `leading` or `trailing` zeros can be dropped depending on the `zeroSuppression` setting:

- `0.012` > `000120` > leading omitted: `120`, trailing omitted: `00012`
- `2.45` > `024500` > leading omitted: `24500`, trailing omitted: `0245`
- `67` > `670000` > leading omitted: `670000`, trailing omitted: `67`

Some important things to keep in mind when processing coordinate strings according to the `CoordinateFormat` node:

- `format`, `zeroSuppression`, or `mode` could all be left unspecified
  - In this case, `format` and `zeroSuppress` should be assumed or inferred, if possible
  - It's very safe to assume `mode` is always `absolute` (`incremental` mode has been deprecated in the Gerber specification)
- Just because `zeroSuppression` is set doesn't mean zeros are necessarily dropped
  - It's common to see Gerber writers keep all zeros to ensure there is no ambiguity, but `zeroSuppression` still needs to be set to _something_

## example

Syntax tree of `packages/fixtures/gerbers/pads/circle-with-hole.gbr`

```js
{
  type: 'root',
  filetype: 'gerber',
  done: true,
  children: [
    {
      type: 'header',
      children: [
        {
          type: 'coordinateFormat',
          format: [3, 4],
          zeroSuppression: 'leading',
          mode: 'absolute',
        },
        {
          type: 'units',
          units: 'in',
        },
        {
          type: 'toolDefinition',
          code: '10',
          shape: {type: 'circle', diameter: 0.5},
          hole: {type: 'circle', diameter: 0.25},
        },
      ],
    },
    {
      type: 'image',
      children: [
        {
          type: 'tool',
          children: [
            {
              type: 'graphic',
              coordinates: {x: '0', y: '0'},
              graphic: 'shape'
            },
          ],
          code: '10',
        },
      ],
    },
  ],
}
```
