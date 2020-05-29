# abstract syntax tree format

> AST format for @tracespace/parser

@tracespace/parser parses [Gerber][gerber] and drill files into an abstract syntax tree. The syntax tree format is based on [unist][].

The syntax trees produced are minimal, and may exclude portions of the original file if that information isn't strictly necessary for visualization or manufacturing.

[unist]: https://github.com/syntax-tree/unist
[gerber]: https://www.ucamco.com/gerber

## node types

If you're using TypeScript, all the node types are `import`able:

```ts
import {Root, CoordinateFormat /* ... */} from '@tracespace/parser'
```

Strings constants for nodes' `type` values are also exported in `SNAKE_CASE`:

```js
import {ROOT, COORDINATE_FORMAT /* ... */} from '@tracespace/parser'

// ...

if (node.type === ROOT) console.log('node is a Root node')
```

All nodes extend the [unist Node interface](https://github.com/syntax-tree/unist#node) and include a `position` field that represents their [location in the source file](https://github.com/syntax-tree/unist#position).

### Root

Root node of the syntax tree.

```ts
interface Root extends Node {
  type: 'root'
  filetype: 'gerber' | 'drill' | null
  done: boolean
  children: ChildNode[]
}
```

Where A `ChildNode` may be one of:

```ts
type ChildNode =
  | Comment
  | Done
  | Units
  | CoordinateFormat
  | ToolDefinition
  | ToolMacro
  | ToolChange
  | InterpolateMode
  | RegionMode
  | QuadrantMode
  | Graphic
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

### Comment

Node representing a comment in the file. Usually, comment nodes can be ignored, but in NC drill files, they may contain important format specifications that are not able to be expressed in the file itself.

```ts
interface Comment extends Node {
  type: 'comment'
  comment: string
}
```

### Done

Node representing a done command. This represents an `M02` or `M00` command in a Gerber file or an `M00` or `M30` in an NC drill file. Its presence in a tree means the full source file was parsed.

```ts
interface Done extends Node {
  type: 'done'
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

#### ToolDefinition

A ToolDefinition node defines a "tool" that may be used to either create a shape ("pad" or "drill hit") or a stroke ("trace" or "route") in a later graphic command.

```ts
interface ToolDefinition extends Node {
  type: 'toolDefinition'
  code: string
  shape: Circle | Rectangle | Obround | Polygon | MacroShape
  hole: Circle | Rectangle | null
}
```

`code` is a unique identifier for the tool that will be used in later `ToolChange` nodes. `shape` describes the shape of the tool, and `hole` describes an optional hole in the middle of the shape that may cause the tool itself to generate a more complex image.

Only `Circle` or `Rectangle` tools without a `hole` may be used to create a stroke.

##### Circle

A `Circle` shape is a circle with a given diameter. Drill files will only contain `Circle` tools.

```ts
interface Circle {
  type: 'circle'
  diameter: number
}
```

##### Rectangle

A `Rectangle` shape is a centered rectangle with the given sizes in the x and y dimensions.

```ts
interface Rectangle {
  type: 'rectangle'
  xSize: number
  ySize: number
}
```

##### Obround

An `Obround` shape is a variant of a `Rectangle` with a corner radius set to half of its shorter dimension, such that it has a "pill" shape

```ts
interface Obround {
  type: 'obround'
  xSize: number
  ySize: number
}
```

##### Polygon

A `Polygon` shape represents a regular polygon. Its `diameter` property is the diameter of the polygon's circumscribing circle, `vertices` is the number of vertices, and `rotation` is an optional counter-clockwise rotation in degrees to apply to the shape about its origin. If `rotation` is unspecified, one vertex will lie on the positive X-axis.

```ts
interface Polygon {
  type: 'polygon'
  diameter: number
  vertices: number
  rotation: number | null
}
```

##### MacroShape

A `MacroShape` describes a complex shape made up of other shapes described in a [`ToolMacro`](#ToolMacro) node with a matching unique `name`. At tool definition time, any `params` specified in the tool definition are given to the macro so that it can be "run" to generate a concrete shape.

```ts
interface MacroShape {
  type: 'macroShape'
  name: string
  params: number[]
}
```

#### ToolMacro

A `ToolMacro` describes a complex shape in a Gerber file that can use a variety of "primitives", simple arithmetic, and differing polarities to lay out an image that will later be repeated.

See the [Gerber File Specification][gerber] for an in-depth description of how macros are run and displayed.

```ts
interface ToolMacro extends Node {
  type: 'toolMacro'
  name: string
  children: Array<MacroComment | MacroVariable | MacroPrimitive>
}

interface MacroComment extends Node {
  type: 'macroComment'
  comment: string
}

interface MacroVariable extends Node {
  type: 'macroVariable'
  name: string
  value: MacroValue
}

interface MacroPrimitive extends Node {
  type: 'macroPrimitive'
  code: '1' | '20' | '21' | '4' | '5' | '6' | '7' | string
  modifiers: MacroValue[]
}

interface MacroExpression {
  left: MacroValue
  right: MacroValue
  operator: '+' | '-' | 'x' | '/'
}

type MacroValue = number | string | MacroExpression
```

#### ToolChange

At a given point in time, a certain "tool" may be active in a file, and that tool determines the image that various graphical operations will produce. A `ToolChange` node switches the active tool.

```ts
interface ToolChange extends Node {
  type: 'toolChange'
  code: string
}
```

`code` represents the same unique code of a previous [`ToolDefinition`](#ToolDefinition).

#### Graphic

A `Graphic` node represents an image being "drawn" to the active layer.

```ts
interface Graphic extends Node {
  type: 'graphic'
  graphic: 'shape' | 'move' | 'segment' | 'slot' | null
  coordinates: Partial<{[axis: string]: string}>
}
```

The type of graphic drawn is represented by the `graphic` field, and the location is determined by the `coordinates` field.

- `shape` - the shape of the current tool is added to the image at `coordinates`
- `move` - the tool is moved from its previous location to `coordinates` **without affecting the image**
- `segment` - the tool is "stroked" from its previous location to `coordinates`, producing a segment along the path the tool took
  - The path the tool takes is determined by the current [`IterpolateMode`](#InterpolateMode)
  - The segment may be a standalone path, or it may be a part of a region fill set by a [`RegionMode`](#RegionMode)
- `slot` - a drill-specific graphic that creates a slot from `(coordinates.x1, coordinates.y1)` to `(coordinates.x2, coordinates.y2)`
- `null` - The graphic type was not explicitly specified in the source file
  - In a Gerber file, the last used graphic type should be repeated here
  - In a drill file, this means `shape` if in `drill` mode (default), `move` if in `move` mode, or `segment` if in a routing mode

The `coordinates` dictionary may have any or none of the following axes:

| axis | default if unspecified | description                                                 |
| ---- | ---------------------- | ----------------------------------------------------------- |
| `x`  | Current `x` position   | Coordinate along the x-axis                                 |
| `y`  | Current `y` position   | Coordinate along the y-axis                                 |
| `i`  | `0`                    | Distance along the x-axis to an arc center                  |
| `j`  | `0`                    | Distance along the y-axis to an arc center                  |
| `a`  | N/A                    | Arc radius (drill file only), mutually exclusive with `i/j` |

#### InterpolateMode

#### RegionMode

#### QuadrantMode

#### StepRepeat

#### Polarity
