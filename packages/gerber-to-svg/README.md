# gerber to svg

[![latest][gerber-to-svg-latest-badge]][npm]
[![next][gerber-to-svg-next-badge]][npm-next]
[![david][gerber-to-svg-david-badge]][david]

> Render individual Gerber / NC drill files as SVGs

`gerber-to-svg` is a library and CLI tool for converting [Gerber][gerber] and [NC drill][nc-drill] files (manufacturing files for printed circuit boards) into [SVG][svg] files for the web.

Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace
[npm]: https://www.npmjs.com/package/gerber-to-svg
[npm-next]: https://www.npmjs.com/package/gerber-to-svg/v/next
[david]: https://david-dm.org/tracespace/tracespace?path=packages/gerber-to-svg
[gerber-to-svg-latest-badge]: https://flat.badgen.net/npm/v/gerber-to-svg
[gerber-to-svg-next-badge]: https://flat.badgen.net/npm/v/gerber-to-svg/next
[gerber-to-svg-david-badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/gerber-to-svg
[gerber]: https://en.wikipedia.org/wiki/Gerber_format
[nc-drill]: https://en.wikipedia.org/wiki/Excellon_format
[svg]: https://en.wikipedia.org/wiki/Scalable_Vector_Graphics

## install

```shell
npm install --save gerber-to-svg
# or
yarn add gerber-to-svg
```

Or, use a script tag:

```html
<script src="https://unpkg.com/gerber-to-svg@^4.0.0/dist/gerber-to-svg.min.js"></script>
<script>
  // global variable gerberToSvg now available
  var converter = gerberToSvg(input)
</script>
```

## example

After you clone and set-up the repository as detailed in [development setup](../..#development-setup), you can run `gerber-to-svg`'s [example script](./example/index.js) to render all the layers of an Arduino Uno PCB.

```shell
cd tracespace/packages/gerber-to-svg
yarn example
```

![arduino uno sol][sol]

Arduino Uno design files used here under the terms of the [Creative Commons Attribution Share-Alike license](https://www.arduino.cc/en/Main/FAQ).

[sol]: https://unpkg.com/gerber-to-svg@next/example/arduino-uno.sol.svg

## usage

```js
var gerberToSvg = require('gerber-to-svg')
var converter = gerberToSvg(input, options, [callback])
```

See [the API documentation](./API.md) for full details.

### command line

If you would like to use `gerber-to-svg` from the command line, check out [`@tracespace/cli`][tracespace-cli]

[tracespace-cli]: ../cli

## background

Since Gerber is a vector image format, this library takes in a Gerber file and spits it out in a different vector format: SVG. This converter uses RS-274X and strives to be true to the [latest format specification][gerber-spec].

Everywhere that is "dark" or "exposed" in the Gerber (think a copper trace or a line on the silkscreen) will be `currentColor` in the SVG. You can set this with the `color` CSS property or the `color` attribute in the SVG node itself.

Everywhere that is "clear" (anywhere that was never drawn on or was drawn on but cleared later) will be transparent. This is accomplished though judicious use of SVG masks and groups.

The bounding box is carefully calculated as the file is being converted, so the `width` and `height` of the resulting SVG should be nearly (if not exactly) the real world size of the Gerber image. The SVG's `viewBox` is in 1000x Gerber units, so its `min-x` and `min-y` values can be used to align SVGs generated from different board layers.

Excellon / NC drill files do not have a completely clearly defined spec, so drill file parsing is lenient in its attempt to generate an image. It should auto-detect when a drill file has been entered. You may need to override parsing settings (see [API.md](./API.md)) to get drill files to render properly if they do not adhere to certain assumptions. The library must make these assumptions because Excellon does not define commands for certain formatting decisions.

[gerber-spec]: http://www.ucamco.com/downloads
