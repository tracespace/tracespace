# what's that gerber?

[![version][npm-badge]][npm]

> Identify Gerber and drill files by filename

Have you got a bunch of Gerber files lying around without any idea what they're for? We've all been there. `whats-that-gerber` is here to help.

[npm]: https://www.npmjs.com/package/whats-that-gerber
[npm-badge]: https://img.shields.io/npm/v/whats-that-gerber.svg?style=flat-square&maxAge=3600

## install

```shell
npm install --save whats-that-gerber
# or
yarn add whats-that-gerber
```

## usage

```js
const whatsThatGerber = require('whats-that-gerber')

const filename = 'my-board-F_Cu.gbr'
const layerType = whatsThatGerber(filename) // 'tcu'
const layerName = whatsThatGerber.getFullName(layerType) // 'top copper'
```

### layer types and names

There are 12 available layer types. You can get an array of all types with:

```js
const whatsThatGerber = require('whats-that-gerber')
const allLayerTypes = whatsThatGerber.getAllTypes() // ['drw', 'tcu', ...]
```

| type | full name (en)                |
| ---- | ----------------------------- |
| drw  | gerber drawing (unknown type) |
| tcu  | top copper                    |
| tsm  | top soldermask                |
| tss  | top silkscreen                |
| tsp  | top solderpaste               |
| bcu  | bottom copper                 |
| bsm  | bottom soldermask             |
| bss  | bottom silkscreen             |
| bsp  | bottom solderpaste            |
| icu  | inner copper                  |
| out  | board outline                 |
| drl  | drill hits                    |

#### checking if a layer type is valid

You can check if any given string is a valid layer type with:

```js
const whatsThatGerber = require('whats-that-gerber')
const isValidType = whatsThatGerber.isValidType

const type1 = 'tsm'
const type2 = 'hello'

console.log(isValidType(type1)) // true
console.log(isValidType(type2)) // false
```

### full name locales

The full name method takes a locale string as its second parameter, which defaults to 'en':

```js
const fullName = whatsThatGerber.getFullName('tcu', 'en')
```

Currently, no other locales are supported (because I don't know any!); contributions are greatly appreciated. If the type or locale is unrecognized, the result will be an empty string. Locale additions will be considered patch-level upgrades.

### supported cad programs

We should be able to identify files output by the following programs:

* KiCad
* Eagle
* Altium
* Orcad
* gEDA PCB

## contributing

Please read the [Contributing Section](../README.md#contributing) of the main README for development setup instructions.

If you're adding or modifying a filetype matcher, please remember to add or modify an example filename in [`@tracespace/fixtures/gerber-filenames.json`](../fixtures/gerber-filenames.json) to ensure your change is tested.
