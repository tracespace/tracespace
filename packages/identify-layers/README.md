# @tracespace/identify-layers

Have you got a bunch of Gerber files lying around without any idea what they're for? We've all been there. `@tracespace/identify-layers` is here to help.

This module examines a set of Gerber and NC drill file names and tries to guess the layer type of each file from the filename.

Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace

## install

```shell
npm install @tracespace/identify-layers
```

Or, use a script tag:

```html
<script src="https://unpkg.com/@tracespace/identify-layers"></script>
<script>
  // namespace TracespaceIdentifyLayers now available
  const {identifyLayers} = TracespaceIdentifyLayers
</script>
```

## usage

Pass `identifyLayers` an array of filenames from a PCB, and it will give you back an object keyed by filename with the best guess it can make for the type and side of each file. If both `side` and `type` are `null`, the filename cannot be identified as a Gerber / drill file.

```js
const {identifyLayers} = require('@tracespace/identify-layers')
// ES Modules work, too
// import {identifyLayers} from '@tracespace/identify-layers'

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
const {getAllLayers} = require('@tracespace/identify-layers')
// ES Modules work, too
// import {getAllLayers} from '@tracespace/identify-layers'

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
const {
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
} = require('@tracespace/identify-layers')

// ES Modules work, too
// import {TYPE_COPPER} from '@tracespace/identify-layers'
```

#### checking if a layer type is valid

You can check if any given string is a valid layer type with:

```js
const {validate} = require('@tracespace/identify-layers')
// ES Modules work, too
// import {validate} from '@tracespace/identify-layers'

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

Please read the [Contributing Section](../README.md#contributing) of the main README for development setup instructions.

If you're adding or modifying a filetype matcher, please remember to add or modify an example filename in [`@tracespace/fixtures/gerber-filenames.json`](../fixtures/gerber-filenames.json) to ensure your change is tested.
