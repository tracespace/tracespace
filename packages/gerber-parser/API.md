# gerber parser api

API documentation for gerber-parser. An understanding of the [Gerber file format specification](http://www.ucamco.com/en/guest/downloads) and the [Excellon NC drill format](http://www.excellon.com/manuals/program.htm) (as poorly defined as it is) will help with understanding the parser API.

<!-- TOC depthFrom:2 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [create a gerber parser](#create-a-gerber-parser) - [usage](#usage) - [streaming](#streaming) - [synchronous](#synchronous) - [options](#options)
- [public properties](#public-properties) - [format](#format) - [line](#line)
- [events](#events) - [warning event](#warning-event) - [error event](#error-event)
- [transform stream objects](#transform-stream-objects) - [done objects](#done-objects) - [set objects](#set-objects) - [operation objects](#operation-objects) - [coordinate objects](#coordinate-objects) - [level objects](#level-objects) - [tool objects](#tool-objects) - [shapes and parameters](#shapes-and-parameters) - [holes](#holes) - [macro objects](#macro-objects) - [macro blocks](#macro-blocks) - [variable set block](#variable-set-block) - [primitive blocks](#primitive-blocks)

<!-- /TOC -->

## create a gerber parser

```javascript
var gerberParser = require('gerber-parser')

var parser = gerberParser(OPTIONS)
var gerberStream = getReadableStreamSomehow()

gerberStream
  .pipe(parser)
  .on('warning', function(warning) {
    // handle warning
  })
  .once('error', function(error) {
    // handle error
  })
```

### usage

```javascript
var gerberParser = require('gerber-parser')
var parser = gerberParser(OPTIONS)
```

The parser is stateful, so be sure to use one parser per file. The parser has both a streaming and a synchronous interface.

#### streaming

The object returned by `gerberParser` is a Node [Transform Stream](https://nodejs.org/api/stream.html#stream_class_stream_transform). When you write a Gerber or Drill file contents into the stream, it will emit command objects to be consumed by an image generator (or plotter).

```javascript
var parser = gerberParser()
var gerberStream = getReadableStreamSomehow()

gerberStream.pipe(parser)
```

#### synchronous

The transform may also be performed synchronously on a string. This will block, but will most likely run faster.

```javascript
var parser = gerberParser()
var gerberFile = fs.readFileSync('path/to/file.gbr')

var arrayOfCommands = parser.parseSync(gerberFile)
```

### options

The gerberParser function takes an options object and returns a transform stream. The options object can be used to override or certain details that would normally be parsed from the Gerber file or may be missing from the file entirely (which can happen a lot, especially with drill files).

```javascript
var options = {
  places: [3, 5],
  zero: 'L',
  filetype: 'gerber',
}
var parser = gerberParser(options)
```

The available options are:

| key      | value               | description                                  |
| -------- | ------------------- | -------------------------------------------- |
| places   | [int, int]          | Coordinate places before / after the decimal |
| zero     | 'L' or 'T'          | Leading or trailing zero suppression         |
| filetype | 'gerber' or 'drill' | Type of file                                 |

## public properties

A gerber parser has certain public properties. Any properties not listed here as public could be changed at any time.

### format

The format object `parser.format` can be used once parsing has finished to determine any formatting decisions the parser made. Specifically, coordinate places format, zero suppression format, and filetype.

```javascript
parser.on('end', function() {
  console.log(parser.format)
})
// could print:
// {
//   places: [2, 4],
//   zero: 'L',
//   filetype: 'gerber'
// }
```

### line

`parser.line` indicates the current line of the gerber file that the parser is processing at any given moment. After parsing is done, it will indicate one less than the number of lines the file contained (`parser.line` starts at 0).

## events

Because the gerber parser is a Node stream, it is also an event emitter. In addition to the standard stream events, it will also emit certain other events.

### warning event

A `warning` event is emitted if the parser encounters a recoverable problem while parsing the file. Typically, these warning are caused by elements that are deprecated in the current Gerber specification or missing information that will be replaced with assumptions by the parser.

```javascript
// warning object
{message: WARNING_MESSAGE, line: LINE_NO_IN_GERBER}
```

The parser will emit warnings when:

- It encounters a block it does not recognize (usually caused by deprecated and harmless commands)
- Missing coordinate format (will assume `[2, 4]`)
- Trailing zero suppression is used in a Gerber file (it has been deprecated by the Gerber spec)
- No zero suppression was specified (will assume leading suppression for Gerber and trailing suppression for drill)
- Deprecated or unrecognized macro primitives are used
- `X` is used instead of `x` for multiplication in a macro

### error event

An `error` event will be emitted with an `Error` object if the parser encounters an unrecoverable problem (in addition to the Node Transorm stream errors). Because of the way EventEmitters work, unless the `error` event has a listener attached, an emitted `error` will throw.

The only custom error event that the parser will throw is if it is unable to determine the filetype (Gerber or drill) of the input stream.

## transform stream objects

Given a gerber or drill file stream, the parser will emit a stream of plotter command objects. Objects are of the format:

```javascript
{
  type: COMMAND_TYPE,
  line: GERBER_LINE_NO,
  params...
}
```

### done objects

Objects that indicate the end of a Gerber file. This corresponds to the Gerber "end" command, not the end of the text stream. If the end of the text stream happens without receiving this command, the file has likely been accidentally truncated.

```javascript
{
  type: 'done',
  line: GERBER_LINE_NO
}
```

### set objects

Commands used to set the state of the plotter.

```javascript
{
  type: 'set',
  line: GERBER_LINE_NO,
  prop: PROPERTY,
  value: VAL
}
```

| property      | value               | description                             |
| ------------- | ------------------- | --------------------------------------- |
| `mode`        | `i`, `cw`, or `ccw` | linear, CW-arc, or CCW-arc draw mode    |
| `arc`         | `s` or `m`          | single or multi-quadrant arc mode       |
| `region`      | `true` or `false`   | region mode on or off                   |
| `units`       | `mm` or `in`        | units                                   |
| `backupUnits` | `mm` or `in`        | backup units (used if units missing)    |
| `epsilon`     | `[Number]`          | threshold for comparing two coordinates |
| `nota`        | `A` or `I`          | absolute or incremental coord notation  |
| `backupNota`  | `A` or `I`          | backup notation (used if missing)       |
| `tool`        | `[Integer string]`  | currently used tool code                |

### operation objects

Commands used to move the plotter location and create image objects

```javascript
{
  type: 'op',
  line: GERBER_LINE_NO,
  op: OP_TYPE,
  coord: COORDINATE
}
```

where `COORDINATE` is a coordinate object and OP_TYPE is the type of operation:

| operation | description                                                       |
| --------- | ----------------------------------------------------------------- |
| `int`     | interpolate (draw) to `COORDINATE` based on current tool and mode |
| `move`    | move to `COORDINATE` without affecting the image                  |
| `flash`   | add image of current tool to the layer image at `COORDINATE`      |
| `last`    | do whatever the last operation was (deprectated)                  |

#### coordinate objects

A coordinate object is an object with the keys:

| key | description                                             |
| --- | ------------------------------------------------------- |
| `x` | x coordinate                                            |
| `y` | y coordiate                                             |
| `i` | (Optional) x-offset of arc center                       |
| `j` | (Optional) y-offset of arc center                       |
| `a` | (Optional) arc radius (mutually exclusive with i and j) |

### level objects

Commands used to create new polarity or step-repeat image levels.

```javascript
{
  type: 'level',
  line: GERBER_LINE_NO,
  level: LEVEL_TYPE,
  value: VAL
}
```

| level type | val                        | description                         |
| ---------- | -------------------------- | ----------------------------------- |
| `polarity` | `C` or `D`                 | Clear or Dark image polarity        |
| `stepRep`  | `{x: _, y: _, i: _, j: _}` | Steps in x and y at offsets i and j |

### tool objects

Commands used to create new tools.

```javascript
{
  type: 'tool',
  line: GERBER_LINE_NO,
  code: TOOL_CODE,
  tool: TOOL_OBJECT
}
```

where `TOOL_CODE` is the unique tool identifier in string format and `TOOL_OBJECT` is of the format:

```javascript
{
  shape: SHAPE,
  params: SHAPE_PARAMS_ARRAY,
  hole: HOLE_PARAMS_ARRAY
}
```

#### shapes and parameters

There are five types of shapes available

| shape        | parameters                         |
| ------------ | ---------------------------------- |
| `circle`     | `[DIA]`                            |
| `rect`       | `[WIDTH, HEIGHT]`                  |
| `obround`    | `[WIDTH, HEIGHT]`                  |
| `poly`       | `[DIA, N_POINTS, ROTATION_IN_DEG]` |
| `MACRO_NAME` | `[$1, $2, ..., $N]`                |

#### holes

Standard tools (i.e. not macros) may have a hole in the middle. The hole, if it exists, may be a circle or a rectangle (though rectangle holes are deprecated by the latest Gerber file specification).

| hole type      | hole array        |
| -------------- | ----------------- |
| No hole        | `[]`              |
| Circle hole    | `[DIA]`           |
| Rectangle hole | `[WIDTH, HEIGHT]` |

### macro objects

Commands used to create new tool macros.

```javascript
{
  type: 'macro',
  line: GERBER_LINE_NO,
  name: MACRO_NAME,
  blocks: MACRO_BLOCKS_ARRAY
}
```

Where `MACRO_NAME` is the name of the macro being defined and `MACRO_BLOCKS_ARRAY` is an array of macro block objects.

#### macro blocks

A tool macro is composed of blocks. A macro block object has a `type` key that indicates the type of block.

##### variable set block

A variable set block contains a function that takes the current set of macro modifiers (variables) and returns a new, modified set to use.

```javascript
{type: 'variable', set: (mods) => mods}
```

##### primitive blocks

A primitive adjusts the macro image. All primitive objects have an exposure key `exp` that will be `0` if the primitive erases the existing image or `1` if it adds to the existing image. They also have a rotation in degrees key `rot` that will rotate the primitive around the macro image's origin.

All values in a primitive object will either be a `Number` or a function that takes the current modifier map and returns a number `(mods) => Number`

A **comment primitive** does nothing:

```javascript
{
  type: 'commment'
}
```

A **circle primitive** adds a circle to the macro image:

```javascript
{
  type: 'circle', exp, dia, cx, cy, rot
}
```

A **vector primitive** adds a stroke with `width` and endpoints (`x1`, `y1`) and (`x2`, `y2`):

```javascript
{
  type: 'vect', exp, width, x1, y1, x2, y2, rot
}
```

A **rectangle primitive** adds a rectangle with `width` and `height` centered at (`cx`, `cy`):

```javascript
{
  type: 'rect', exp, width, height, cx, cy, rot
}
```

A **lower-left rectangle primitive** adds a rectangle with `width` and `height` with its lower left point at at (`x`, `y`):

```javascript
{
  type: 'rectLL', exp, width, height, x, y, rot
}
```

An **outline primitive** adds an outline polygon described by a `points` array of format `[x1, y1, x2, y2, ..., xN, yN]`:

```javascript
{
  type: 'outline', exp, points, rot
}
```

An **polygon primitive** adds a regular polygon with circumcircle diameter `dia`, number of vertices `vertices`, and a center at (`cx`, `cy`):

```javascript
{
  type: 'poly', exp, vertices, cx, cy, dia, rot
}
```

A **moiré primitive** adds a moiré (target) with center at (`cx`, `cy`), outer diameter `dia`, ring thickness `ringThx`, ring gap `ringGap`, maximum number of rings `maxRings`, crosshair line thickness `crossThx`, and crosshair line length `crossLen`:

```javascript
{
  type: 'moire',
    exp,
    cx,
    cy,
    dia,
    ringThx,
    ringGap,
    maxRings,
    crossThx,
    crossLen,
    rot
}
```

A **thermal primitive** adds a thermal with center at (`cx`, `cy`), outer diameter `outerDia`, inner diameter `innerDia`, and ring gap `gap`:

```javascript
{
  type: 'thermal', exp, cx, cy, outerDia, innerDia, gap, rot
}
```
