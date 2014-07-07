# gerber-to-svg

[![Version](http://img.shields.io/npm/v/gerber-to-svg.svg?style=flat-square)](https://www.npmjs.org/package/gerber-to-svg)
[![Build Status](http://img.shields.io/travis/mcous/gerber-to-svg.svg?style=flat-square)](https://travis-ci.org/mcous/gerber-to-svg) [![Coverage](http://img.shields.io/coveralls/mcous/gerber-to-svg.svg?style=flat-square)](https://coveralls.io/r/mcous/gerber-to-svg)  [![Dependencies](http://img.shields.io/david/mcous/gerber-to-svg.svg?style=flat-square)](https://david-dm.org/mcous/gerber-to-svg)
[![DevDependencies](http://img.shields.io/david/dev/mcous/gerber-to-svg.svg?style=flat-square)](https://david-dm.org/mcous/gerber-to-svg#info=devDependencies)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/gerber-to-svg.svg)](https://saucelabs.com/u/gerber-to-svg)

Gerber and NC drill file to SVG converter for Node and the browser.

## usage

### api

`$ npm install --save gerber-to-svg`

``` javascript
var gerberToSvg = require('gerber-to-svg')
var converter = gerberToSvg(input, options, [callback])
```

See [the API documentation](./API.md) for full details.

### command line

1. `$ npm install -g gerber-to-svg`
2. `$ gerber2svg [options]  -- gerber_files`

#### options

switch             | type    | how it rolls
-------------------|---------|-------------------------
`-o, --out`        | string  | specify an output directory
`-q, --quiet`      | boolean | do not print warnings and messages
`-p, --pretty`     | int     | indent output with this length tabs (2 if unspecified)
`-c, --color`      | color   | use this color instead of "currentColor" for fills and strokes
`-f, --format`     | array   | override coordinate format with '[INT,DEC]'
`-z, --zero`       | string  | override zero suppression with 'L' or 'T'
`-u, --units`      | string  | set backup units with 'mm' or 'in'
`-n, --notation`   | string  | set backup absolute/incremental notation with 'A' or 'I'
`-a, --append-ext` | boolean | append .svg without replacing the existing extension
`-v, --version`    | boolean | display version information
`-h, --help`       | boolean | display help text

#### examples:

* `$ gerber2svg gerber.gbr` - convert gerber.gbr and output to stdout
* `$ gerber2svg -o out gerber.gbr` - convert and output to out/gerber.svg
* `$ gerber2svg -o out -a gerber.gbr` - output to out/gerber.gbr.svg

## what you get

Since Gerber is just an image format, this library does not attempt to identify nor infer anything about what the file represents (e.g. a copper layer, a silkscreen layer, etc.) It just takes in a Gerber and spits out an SVG. This converter uses RS-274X and strives to be true to the [latest format specification](http://www.ucamco.com/downloads). All the Gerber image features should be there.

Everywhere that is "dark" or "exposed" in the Gerber (think a copper trace or a line on the silkscreen) will be "currentColor" in the SVG. You can set this with the "color" CSS property or the "color" attribute in the SVG node itself.

Everywhere that is "clear" (anywhere that was never drawn on or was drawn on but cleared later) will be transparent. This is accomplished though judicious use of SVG masks and groups.

The bounding box is carefully calculated as the file is being converted, so the `width` and `height` of the resulting SVG should be nearly (if not exactly) the real world size of the Gerber image. The SVG's `viewBox` is in Gerber units, so its `min-x` and `min-y` values can be used to align SVGs generated from different board layers.

Excellon / NC drill files do not have a completely clearly defined spec, so drill file parsing is lenient in its attempt to generate an image. It should auto-detect when a drill file has been entered. You may have to override parsing settings (see [API.md](./API.md)) to get drill files to render properly if they do not adhere to certain assumptions. The library must make these assumptions because Excellon does not define commands for certain formatting decisions.

## developing and contributing

Clone and then `$ npm install`. Please accompany all PRs with applicable tests (unit and/or visual). Please test your code in browsers, as Travis CI cannot run browser tests for PRs.

### testing

This module uses [Mocha](http://mochajs.org/) and [Chai](http://chaijs.com/) for unit testing, [Istanbul](https://github.com/gotwarlost/istanbul) for coverage, and [ESLint](http://eslint.org/) for linting.

* `$ npm test` - run the tests, calculate coverage, and lint
* `$ npm run test:watch` - run the tests on code changes (does not lint nor cover)
* `$ npm run lint` - lint the code (will be run as a pre-commit script)

### browser testing

Browser tests are run with [Zuul](https://github.com/defunctzombie/zuul) and [Sauce Labs](https://saucelabs.com/opensauce/).

* `$ npm run test:browser` - run the unit tests in a local browser
* `$ npm run test:sauce` - run the units tests in several browsers using Open Sauce (Sauce Labs account and local [.zuulrc](https://github.com/defunctzombie/zuul/wiki/Zuulrc) required)

### visual testing

The visual test suite made up of sample Gerber files and expected (looks-like) results. Expected SVGs are output from [gerbv](http://gerbv.geda-project.org/) or hand-coded if the gerbv render is incorrect. Sample files live in [test-visual/gerber](./test-visual/gerber) and expected results live in [test-visual/expected](./test-visual/expected).

To run the visual tests, run `$ npm run test:visual` and point your browser to [localhost:4242](http://localhost.com:4242). Refreshing the page will re-render the files.
