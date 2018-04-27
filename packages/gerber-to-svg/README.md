# gerber to svg

[![npm][npm-badge]][npm]

> Render Gerber and NC drill files as SVGs in Node and the browser

`gerber-to-svg` is a library and CLI tool for converting [Gerber][gerber] and [NC drill][nc-drill] files (manufacturing files for printed circuit boards) into [SVG][svg] files for the web.

## install

```shell
npm install --save gerber-to-svg
// or
yarn add gerber-to-svg
```

## example

After you clone and set-up the repository as detailed in [development setup](../..#development-setup), you can run `gerber-to-svg`'s [example script](./example/index.js) to render all the layers of an Arduino Uno PCB.

```shell
cd tracespace/packages/gerber-to-svg
yarn run example
```

Arduino Uno design files used here under the terms of the [Creative Commons Attribution Share-Alike license](https://www.arduino.cc/en/Main/FAQ).

## usage

```js
var gerberToSvg = require('gerber-to-svg')
var converter = gerberToSvg(input, options, [callback])
```

See [the API documentation](./API.md) for full details.

### command line

`gerber-to-svg` also ships with a command-line utility.

1.  `npm install -g gerber-to-svg` or `yarn global add gerber-to-svg`
2.  `gerber-to-svg [options] -- gerber_files`

#### options

 switch                | description                                 | type
---------------------- | ------------------------------------------- | -----------
 -o, --out             | output directory                            | string
 -q, --quiet           | do not print warnings and messages          | boolean
 -p, --pretty          | pretty print output                         | boolean, tab-size
 -c, --color           | SVG fill and stroke color                   | color
 -a, --append-ext      | append, rather than replace, .svg extension | boolean
 -f, --format          | coordinate decimal places format            | "$int,$dec"
 -z, --zero            | override zero suppression                   | "L", "T"
 -u, --units           | set backup units to                         | "mm", "in"
 -n, --notation        | set backup absolute/incremental notation    | "A", "I"
 -t, --optimize-paths  | optimize and deduplicate paths              | boolean
 -b, --plot-as-outline | optimize paths and fill gaps                | boolean, max-gap
 -v, --version         | display version information                 | boolean
 -h, --help            | display this help text                      | boolean

#### examples:

*   `gerber-to-svg gerber.gbr` - convert gerber.gbr and output to stdout
*   `gerber-to-svg -o out gerber.gbr` - convert and output to out/gerber.svg
*   `gerber-to-svg -o out -a gerber.gbr` - output to out/gerber.gbr.svg

## background

Since Gerber is a vector image format, this library takes in a Gerber file and spits it out in a different vector format: SVG. This converter uses RS-274X and strives to be true to the [latest format specification](http://www.ucamco.com/downloads).

Everywhere that is "dark" or "exposed" in the Gerber (think a copper trace or a line on the silkscreen) will be `currentColor` in the SVG. You can set this with the `color` CSS property or the `color` attribute in the SVG node itself.

Everywhere that is "clear" (anywhere that was never drawn on or was drawn on but cleared later) will be transparent. This is accomplished though judicious use of SVG masks and groups.

The bounding box is carefully calculated as the file is being converted, so the `width` and `height` of the resulting SVG should be nearly (if not exactly) the real world size of the Gerber image. The SVG's `viewBox` is in 1000x Gerber units, so its `min-x` and `min-y` values can be used to align SVGs generated from different board layers.

Excellon / NC drill files do not have a completely clearly defined spec, so drill file parsing is lenient in its attempt to generate an image. It should auto-detect when a drill file has been entered. You may need to override parsing settings (see [API.md](./API.md)) to get drill files to render properly if they do not adhere to certain assumptions. The library must make these assumptions because Excellon does not define commands for certain formatting decisions.


[npm]: https://www.npmjs.com/package/gerber-to-svg
[npm-badge]: https://img.shields.io/npm/v/gerber-to-svg.svg?style=flat-square&maxAge=86400

[gerber]: https://en.wikipedia.org/wiki/Gerber_format
[nc-drill]: https://en.wikipedia.org/wiki/Excellon_format
[svg]: https://en.wikipedia.org/wiki/Scalable_Vector_Graphics
