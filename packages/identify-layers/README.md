# @tracespace/identify-layers

[![npm][npm badge]][npm package]

Try to guess Gerber files' layer types based on filenames. Part of the [tracespace][] collection of PCB visualization tools.

This module is one part of the tracespace render pipeline, and you may not need to use it directly. See [@tracespace/core][] to integrate the full render pipeline into your project.

```shell
npm install @tracespace/identify-layers
```

[tracespace]: https://github.com/tracespace/tracespace
[@tracespace/core]: ../core
[npm package]: https://www.npmjs.com/package/@tracespace/identify-layers/v/next
[npm badge]: https://img.shields.io/npm/v/@tracespace/identify-layers/next?style=flat-square

## usage

Pass `identifyLayers` an array of filenames from a PCB, and it will give you back an object keyed by filename with the best guess it can make for the type and side of each file. If both `side` and `type` are `null`, the filename cannot be identified as a Gerber / drill file.

```js
import {identifyLayers} from '@tracespace/identify-layers'

const filenames = ['my-board-F_Cu.gbr', 'my-board-B_Cu.gbr', 'foo.bar']
const typeByFilename = identifyLayers(filenames)
// {
//   'my-board-F_Cu.gbr': {type: 'copper', side: 'top'},
//   'my-board-B_Cu.gbr': {type: 'copper', side: 'bottom'},
//   'my-board-notes.gbr': {type: 'drawing', side: null},
//   'foo.bar': {type: null, side: null},
// }
```

### layer types and names

There are 12 available layer types, were a type is an object of the format:

```js
{
  side: 'top' | 'bottom' | 'inner' | 'all' | null,
  type: 'copper' | 'soldermask' | 'silkscreen' | 'solderpaste' | 'drill' | 'outline' | 'drawing' | null,
}
```

You can get an array of all types with:

```js
import {getAllLayers} from '@tracespace/identify-layers'

const allLayers = getAllLayers()
```

| side       | type            |
| ---------- | --------------- |
| `'top'`    | `'copper'`      |
| `'top'`    | `'soldermask'`  |
| `'top'`    | `'silkscreen'`  |
| `'top'`    | `'solderpaste'` |
| `'bottom'` | `'copper'`      |
| `'bottom'` | `'soldermask'`  |
| `'bottom'` | `'silkscreen'`  |
| `'bottom'` | `'solderpaste'` |
| `'inner'`  | `'copper'`      |
| `'all'`    | `'outline'`     |
| `'all'`    | `'drill'`       |
| `null`     | `'drawing'`     |

#### constants

Side and type constants are exported for your usage:

```js
import {
  // layer types
  TYPE_COPPER, // 'copper'
  TYPE_SOLDERMASK, // 'soldermask'
  TYPE_SILKSCREEN, // 'silkscreen'
  TYPE_SOLDERPASTE, // 'solderpaste'
  TYPE_DRILL, // 'drill'
  TYPE_OUTLINE, // 'outline'
  TYPE_DRAWING, // 'drawing'

  // board sides
  SIDE_TOP, // 'top'
  SIDE_BOTTOM, // 'bottom'
  SIDE_INNER, // 'inner'
  SIDE_ALL, // 'all'
} from '@tracespace/identify-layers'
```

#### checking if a layer type is valid

You can check if any given string is a valid layer type with:

```js
import {validate} from '@tracespace/identify-layers'

const type1 = {side: 'top', type: 'copper'}
const type2 = {side: 'foo', type: 'silkscreen'}
const type3 = {side: 'bottom', type: 'bar'}

console.log(validate(type1)) // {valid: true, side: 'top', type: 'copper'}
console.log(validate(type2)) // {valid: false, side: null, type: 'silkscreen'}
console.log(validate(type3)) // {valid: false, side: 'bottom', type: null}
```

### supported cad programs

We should be able to identify files output by the following programs:

- KiCad
- Eagle
- Altium
- Orcad
- gEDA PCB
- DipTrace

## contributing

Please read the [Contributing Guide](../CONTRIBUTING.md) for development setup instructions.

If you're adding or modifying a filetype matcher, please remember to add or modify an example filename in [`@tracespace/fixtures/gerber-filenames.json`](../fixtures/gerber-filenames.json) to ensure your change is tested.
