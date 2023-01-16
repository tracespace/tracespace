# xml id

[![npm][npm badge]][npm package]

XML element ID generation and sanitation utilities. Part of the [tracespace][] collection of PCB visualization tools.

ID attributes in XML documents (e.g. SVG images) have certain requirements. This module provides utility methods for sanitizing and generating strings to meet those requirements so they can safely be used element IDs, CSS identifiers, and URLs.

```shell
npm install @tracespace/xml-id@next
```

[tracespace]: https://github.com/tracespace/tracespace
[npm package]: https://www.npmjs.com/package/@tracespace/xml-id/v/next
[npm badge]: https://img.shields.io/npm/v/@tracespace/xml-id/next?style=flat-square

## usage

```js
import {ensure, random, sanitize} from '@tracespace/xml-id'
```

The alphabet used by this module is a subset of what is valid for XML which is also CSS identifier and URL friendly.

### ensure(source: unknown, length?: number): string

Given an input `source`, returns a sanitized `source` if it was a string. Otherwise, generates a random ID with length `length` (defaulting to 12 if unspecified).

```js
const id1 = ensure(undefined) // 'w57gH_nT3-o8'
const id2 = ensure(undefined, 8) // 'Gi3ma2Ef'
const id3 = ensure('0abc def.') // '_abc_def_'
```

### random(length?: number): string

Returns a basic, (non-cryptographically-secure) random string that can be safely used as an XML ID. If unspecified or 0, `length` will be 12.

```js
const id1 = random() // maybe 'w57gH_nT3-o8'
const id2 = random(8) // maybe 'Gi3ma2Ef'
```

### sanitize(source: string): string

Takes a string and replaces any characters that would be invalid in an XML ID with underscores (`_`).

```js
const id1 = sanitize('0abc def.') // '_abc_def_'
```
