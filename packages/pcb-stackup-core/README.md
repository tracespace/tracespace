# pcb stackup core

[![latest][pcb-stackup-core-latest-badge]][npm]
[![next][pcb-stackup-core-next-badge]][npm-next]
[![david][pcb-stackup-core-david-badge]][david]

> Stack gerber-to-svg layer renders to build PCB renders

If you're looking for an easy way to generate beautiful SVG renders of printed circuit boards, check out the higher-level [pcb-stackup](../pcb-stackup) tool first.

`pcb-stackup-core` is the low-level module that powers the rendering of `pcb-stackup`. It takes individual printed circuit board layer converters as output by [gerber-to-svg](../gerber-to-svg) and identified as PCB layer types by [whats-that-gerber](../whats-that-gerber) and uses them to build SVG renders of what the manufactured PCB will look like from the top and the bottom.

Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace
[npm]: https://www.npmjs.com/package/pcb-stackup-core
[npm-next]: https://www.npmjs.com/package/pcb-stackup-core/v/next
[david]: https://david-dm.org/tracespace/tracespace?path=packages/pcb-stackup-core
[pcb-stackup-core-latest-badge]: https://flat.badgen.net/npm/v/pcb-stackup-core
[pcb-stackup-core-next-badge]: https://flat.badgen.net/npm/v/pcb-stackup-core/next
[pcb-stackup-core-david-badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/pcb-stackup-core

## install

```shell
npm install --save pcb-stackup-core
# or
yarn add pcb-stackup-core
```

`gerber-to-svg` and `whats-that-gerber` are peer dependencies, so you'll want them, too:

```shell
npm install --save gerber-to-svg whats-that-gerber
# or
yarn add gerber-to-svg whats-that-gerber
```

## example

After you clone and set-up the repository as detailed in [development setup](../..#development-setup), you can run `pcb-stackup-core`'s [example script](./example/index.js) to render the top and bottom of an Arduino Uno PCB.

```shell
cd tracespace/packages/pcb-stackup-core
npm run example
```

Arduino Uno design files used here under the terms of the [Creative Commons Attribution Share-Alike license](https://www.arduino.cc/en/Main/FAQ).

## usage

This module is designed to work in Node or in the browser with Browserify or Webpack. The function takes two parameters: an array of layer objects and an options object. It returns an object with a `top` key and a `bottom` key, each of which contains the SVG element and various properties of the render.

```js
var pcbStackupCore = require('pcb-stackup-core')
var options = {id: 'my-board'}
var stackup = pcbStackupCore(layersArray, options)

// stackup =>
// {
//   top: {
//     svg: '<svg...',
//     defs: [DEFS_ARRAY...],
//     layer: [LAYER_ARRAY...],
//     viewBox: [X_MIN_X_1000, Y_MIN_X_1000, WIDTH_X_1000, HEIGHT_X_1000],
//     width: WIDTH,
//     height: HEIGHT,
//     units: UNITS
//   },
//   bottom: {
//     svg: '<svg...',
//     defs: [DEFS_ARRAY...],
//     layer: [LAYER_ARRAY...],
//     viewBox: [X_MIN_X_1000, Y_MIN_X_1000, WIDTH_X_1000, HEIGHT_X_1000],
//     width: WIDTH,
//     height: HEIGHT,
//     units: UNITS
//   }
// }
```

`svg` is the SVG element (by default as an XML string). The rest of the properties all correspond to the [public properties of a gerber-to-svg converter](../gerber-to-svg/API.md#public-properties). `units` is a string value of 'in' or 'mm'. `viewBox` is the minimum x value, minimum y value, width, and height in thousandths of (1000x) `units`. `width` and `height` are the width and height in `units`. `defs` and `layer` are arrays of XML elements that are used as children of the `defs` node and the SVG's main `g` node.

Astute readers will notice this is the same interface as gerber-to-svg converters, and this means the [render](../gerber-to-svg/API.md#render) and [clone](../gerber-to-svg/API.md#clone) static methods of gerber-to-svg will also work on the pcb-stackup-core renders.

### layers array

The first parameter to the function is an array of layer objects. A layer object is an object with `side`, `type`, and `converter` keys, where `side` and `type` are the layer's properties as reported by [whats-that-gerber](../whats-that-gerber) and `converter` is the converter object returned by gerber-to-svg for that Gerber file (note: this is the actual return value of gerber-to-svg, not the value that is emitted by the stream or passed to the callback).

It is expected that the converters will have already finished before being passed to pcb-stackup-core. This can be done by listening for the converter's `end` event or by using gerber-to-svg in callback mode, as shown in the example.

```js
var someLayer = {
  side: LAYER_SIDE,
  type: LAYER_TYPE,
  converter: FINISHED_GERBER_TO_SVG_CONVERTER,
}
```

#### using externally defined layers

In building the stackup, each converter's `<defs>` contents (`converter.defs`) are pushed to the `<defs>` node of each side render. The main `<g>` contents (`converter.layer`) are wrapped in a `<g>`, given an id, and also placed in the defs. The layers are then used in a board render's main `<g>` via `<use>`.

If you will be displaying the individual layers in the same page as the board renders, you may want to store these `<defs>` in a different, shared SVG document. You could do this manually, without the use of `pcb-stackup-core`, the same way the stackup function does it (as described above), except using the shared SVG document's `<defs>`.

You can tell the stackup function that a layer is stored externally by giving it a layer with an `externalId` attribute. This should be set to the `id` attribute of the layer's external `<g>`. This will prevent the stackup function from pushing the converters defs to the stackup image defs node.

```js
var sharedLayer = {
  side: GERBER_LAYER_SIDE,
  type: GERBER_LAYER_TYPE,
  converter: FINISHED_GERBER_TO_SVG_CONVERTER,
  externalId: ID_OF_THE_EXTERNALLY_STORED_LAYER_GROUP,
}
```

Please note that when using the `maskWithOutline` option as described below, the `externalId` option of the outline layer will be **ignored**, as a new `<clipPath>` element must be constructed to properly apply the outline shape.

### options

The second parameter of the pcb-stackup-core function is an options object. The only required option is the `id` options. For ease, if no other options are being specified, the id string may be passed as the second parameter directly.

```js
// stackup 1 and 2 are equivalent
var stackup1 = pcbStackupCore(layers, 'my-unique-board-id')
var stackup2 = pcbStackupCore(layers, {id: 'my-unique-board-id'})
```

| key           | default   | description                                                           |
| ------------- | --------- | --------------------------------------------------------------------- |
| id            | N/A       | Unique board identifier (required)                                    |
| color         | see below | Colors to apply to the board render by layer type                     |
| useOutline    | `true`    | Use the board outline layer as a mask for the board shape             |
| createElement | see below | Function used to create the XML element nodes                         |
| attributes    | `{}`      | Map of additional attributes (e.g. `class`) to apply to the SVG nodes |

#### id

The board ID is a string that is prefixed to `id` and `class` attributes of the internal nodes in the SVG documents. The IDs of any two stackups that may appear on the same web-page must be unique to avoid id collisions and potentially weird styling issues.

This option is required and the function will throw if it is missing.

#### color

The color object allows the user to override the default styling of the stackup. It consists of layer identifiers as the keys and CSS colors as the values. Any to all layers may be overridden. The default color object is:

```js
var DEFAULT_COLOR = {
  fr4: '#666',
  cu: '#ccc',
  cf: '#c93',
  sm: 'rgba(0, 66, 0, 0.75)',
  ss: '#fff',
  sp: '#999',
  out: '#000',
}
```

The keys represent the following layers:

| layer | component         |
| ----- | ----------------- |
| fr4   | Substrate         |
| cu    | Copper            |
| cf    | Copper (finished) |
| sm    | Soldermask        |
| ss    | Silkscreen        |
| sp    | Solderpaste       |
| out   | Board outline     |

If a value is falsey (e.g. an empty string), the layer will not be added to the style node. This is useful if you want to add styles with an external stylesheet. If applying colors with an external stylesheet, use the following class-names and specify the `color` attribute:

| layer | classname   | example (id = 'my-board')                      |
| ----- | ----------- | ---------------------------------------------- |
| fr4   | id + `_fr4` | `.my-board_fr4 {color: #666;}`                 |
| cu    | id + `_cu`  | `.my-board_cu {color: #ccc;}`                  |
| cf    | id + `_cf`  | `.my-board_cf {color: #c93;}`                  |
| sm    | id + `_sm`  | `.my-board_sm {color: #rgba(0, 66, 0, 0.75);}` |
| ss    | id + `_ss`  | `.my-board_ss {color: #fff;}`                  |
| sp    | id + `_sp`  | `.my-board_sp {color: #999;}`                  |
| out   | id + `_out` | `.my-board_out {color: #000;}`                 |

#### mask board shape with outline

When constructing the stackup, a `<mask>` of all the drill layers is built and applied to the final image to remove the image wherever there are drill hits. If the `useOutline` option is passed as true, the stackup function will _also_ create a `<clipPath>` with the contents of any included outline layers, and use that to remove any part of the image that falls outside of the board outline.

| setting           | result                                          |
| ----------------- | ----------------------------------------------- |
| `false` (default) | Board shape is a rectangle that fits all layers |
| `true`            | Board shape is the shape of the outline layer   |

To work, the outline layer must be one or more fully-enclosed loops. If it isn't, setting `useOutline` to true will likely result in the final image being incorrect (or non-existent), because the `<path>`s won't clip the image properly. See the [MDN's documentation of `<clipPath>`][clip-path] for more details.

To improve your chances of a board outline layer working for `useOutline`, make sure you set the `plotAsOutline` [option of gerber-to-svg](..gerber-to-svg/API.md#options) to `true` when converting the outline gerber. If the board outline still doesn't work, please open an issue to see if we can improve the masking process.

[clip-path]: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath

#### create element

Both gerber-to-svg and pcb-stackup-core take a `createElement` function as an option. It defaults to [xml-element-string][], which outputs a string. However, any function that takes a tag name, attributes object, and children array may be used. For example, you could pass in [React.createElement][react-create-element] and create virtual DOM nodes instead.

If you choose to use this option, the function you pass into pcb-stackup-core **must** be the same one you passed into gerber-to-svg.

[xml-element-string]: https://github.com/tracespace/xml-element-string
[react-create-element]: https://reactjs.org/docs/react-api.html#createelement

#### attributes

If you want to add more attributes to the SVG nodes than are there by default, this is where you do it. For example, to add some classes:

```js
var stackup = pcbStackupCore(layers, {
  id: 'board-id',
  attributes: {
    class: 'w-100 h-100',
  },
})
```

### layer types

The stackup can be made up of the following layer types:

| layer type               | abbreviation |
| ------------------------ | ------------ |
| top / bottom copper      | tcu / bcu    |
| top / bottom soldermask  | tsm / bsm    |
| top / bottom silkscreen  | tss / bss    |
| top / bottom solderpaste | tsp / bsp    |
| board outline            | out          |
| drill hits               | drl          |
