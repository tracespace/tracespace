# gerber-to-svg API

Create a gerber-to-svg converter like:

``` javascript
var gerberToSvg = require('gerber-to-svg')
var converter = gerberToSvg(input, options, [callback])
```

## input

The function can either take a utf8 encoded string or a utf8 encoded readable-stream. For example:

``` javascript
var gerberToSvg = require('gerber-to-svg')
var fs = require('fs')

// input a readable-stream
var gerberStream = fs.createReadStream('/path/to/file.gbr')
var streamConverter = gerberToSvg(gerberStream, 'my-gerber-file')

// input a string
fs.readFile('/path/to/file.gbr', function(error, gerberString) {
  var stringConverter = gerberToSvg(gerberString, 'my-gerber-file')
})
```

## streaming API

The object returned by the function is a [readable-stream](https://nodejs.org/api/stream.html#stream_class_stream_readable). That means that the normal `data`, `readable`, `error`, etc. events are present, as well as the `pipe` method.

``` javascript
var gerberToSvg = require('gerber-to-svg')
var fs = require('fs')

var gerberStream = fs.createReadStream('/path/to/file.gbr', {encoding: 'utf8'})
var streamConverter = gerberToSvg(gerberStream, 'my-gerber-file')

// pipe the output to the stdout stream
streamConverter.pipe(process.stdout)
```

## callback API

Alternatively, if you don't like streams, you may pass in a callback function to be called when the conversion is complete. It is passed any error that occurred, and the result of the conversion if no error. The function will still return a readable-stream.

``` javascript
var gerberToSvg = require('gerber-to-svg')
var fs = require('fs')

fs.readFile('/path/to/file.gbr', {encoding: 'utf8'}, function(fsError, gerberString) {
  if (fsError) {
    return console.error('fs read error - ' + fsError.message)
  }

  gerberToSvg(gerberString, 'my-gerber-file', function(error, svg) {
    if (error) {
      return console.error('gerber to svg error - ' + error.message)
    }

    console.log(svg)
  })
})
```

## events

The stream events of `data`, `readable`, `end`, `close`, and `error` are present as described in the [readable-stream documentation](https://nodejs.org/api/stream.html#stream_class_stream_readable)

The returned object can also emit `warning` events. The warning object passed to the event handler is of the format:

``` javascript
{
  message: WARNING_MESSAGE,
  line: LINE_IN_GERBER_FILE
}
```

Warnings are non-fatal, but if they are present, it may be an indication of an incorrect or unexpected render. Generally, if the warning message says something about a "deprecated" command, you don't need to worry. If the message says something about an "arc" or a "flash" being "ignored", or anything being "assumed", you may get unexpected results. Most likely this is the result of poorly generated Gerber file.

``` javascript
converter.on('warning', function(w) {
  console.warn('warning on line ' + w.line + ' - ' + w.message)
})
```

## output

The output will be a string of an SVG node with the following format:

``` xml
<svg
  id="${id}"
  xmlns="http://www.w3.org/2000/svg"
  version="1.1"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${width}${units}"
  height="${height}${units}"
  viewBox="${xMin * 1000} ${yMin * 1000} ${width * 1000} ${height * 1000}"
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="0">

  <defs>
    <!-- example pad definition -->
    <circle cx="0" cy="0" r="200" id="${id}_pad-10"/>
  </defs>

  <g
    transform="translate(0,${1000 * (yMin + yMax)}) scale(1,-1)"
    fill="${color}"
    stroke="${color}">

    <!-- example pad flash -->
    <use x="1000" y="1000" xlink:href="#${id}_pad-10"/>
    <!-- example stroke -->
    <path stroke-width="5" fill="none" d="M 400 400 400 200 200 200"/>
    <!-- example region -->
    <path d="M 0 0 100 0 100 100 0 100 0 0 Z"/>
  </g>
</svg>
```

Note that units are scaled by 1000. This is to ensure proper rendering in Firefox, which has a slightly buggy SVG implementation.

## options

The function must be passed an options object or string. If passed a string, it will be used as the `id` option. If passed an object, the `id` key is required. The following options are available:

**svg options**

key    | value     | default        
-------|-----------|----------------
id     | String    | N/A (required)
class  | String    | undefined
color  | CSS color | undefined

**parsing and plotting options**

key           | value               | default
--------------|---------------------|------------------
places        | [int, int]          | Parsed from file
zero          | 'L' or 'T'          | Parsed from file
filetype      | 'gerber' or 'drill' | Parsed from file
units         | `mm` or `in`        | Parsed from file
backupUnits   | `mm` or `in`        | 'in'
nota          | `A` or `I`          | Parsed from file
backupNota    | `A` or `I`          | 'A'
optimizePaths | `true` or `false`   | `false`
plotAsOutline | `true` or `false`   | `false`

### id option

The `id` option is used as the id of the SVG node. It is also used to determine the prefix to the ids of internal nodes. If you are generating SVGs for multiple Gerber files for display on the same page, it is important that each conversion is passed a unique ID. If they are not unique, there may be id collisions between SVGs, and things could get weird. Any periods (`.`) in the id will be replaced with dashes (`-`).

### class option

The `class` option adds a class to the SVG node. Any periods (`.`) in the classname will be replaced with dashes (`-`).

### color option

The `color` option is a CSS color that will be used as the `fill` and `stroke` value of the image. The default value of 'currentColor' means the color will be defined by the CSS `color` property of the SVG.

### pretty option

If `pretty` is non-zero, the SVG string will be pretty-printed with tab-sizes equal to the number that was input.

### parsing and plotting options

These options are available in case you have an older or poorly formatted file that does not contain the necessary format information and does not conform to the assumptions this library makes in the absence of that information. Some knowledge of the Gerber and Excellon formats are helpful when trying to understand these options.

key         | description
------------|-----------------------------------------------------------------------------
places      | The number of places before and after the decimal used in coordinates
zero        | Leading or trailing zero suppression used in coordinates
filetype    | Whether to parse the file as a Gerber file or as a NC drill (Excellon) file
units       | Units of the file
backupUnits | Backup units only to be used if units cannot be parsed from the file
nota        | Absolute or incremental coordinate notation
backupNota  | Backup notation only to be used if the notation cannot be parsed

## public properties

The returned object also contains several public properties. Any properties not listed here should be considered private.

property | type
---------|--------------------------
parser   | `gerber-parser` parser
plotter  | `gerber-plotter` plotter
defs     | String
layer    | String
viewBox  | Array
width    | String
height   | String
units    | String

### parser and plotter

The parser and plotter properties are both transform streams used in the conversion process. If you need to hook into these streams, this is the place to do it. See [gerber-parser](https://github.com/mcous/gerber-parser) and [gerber-plotter](https://github.com/mcous/gerber-plotter) for more information and the APIs of these streams.

### defs

The interior (innerText) of the `defs` node of the SVG. This is where pad shapes and clear layers will be defined.

### layer

The interior of the top-level `g` node of the SVG. This is where regions, strokes, and flashes of dark layers will be. If there are clear layers, there may be nested `g` nodes with `mask` attributes inside `layer`. If no image was produces, this property will be falsey.

### viewBox

The viewBox of the SVG as an array of numbers. This property can be used to align several layers from the same board. (`viewBox[0]`, `viewBox[1]`) is the location of the bottom left of the SVG in board coordinates.

The viewBox units will be 1000 times the actual units.

### width and height

The real-world size of the SVG as a number. Will be 1/1000 of the corresponding `viewBox` value.

### units

Units of the width and height. Either `in` or `mm`. If `units` is an empty string, then no image was found in the file.
