# xml id

[![latest][@tracespace/xml-id-latest-badge]][npm]
[![next][@tracespace/xml-id-next-badge]][npm-next]
[![david][@tracespace/xml-id-david-badge]][david]

> XML ID generation and sanitation utilities for tracespace projects

ID attributes in XML documents (e.g. SVG images) have certain requirements. This module provides utility methods for sanitizing and generating strings to meet those requirements so they can safely be used as XML IDs.

Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace
[npm]: https://www.npmjs.com/package/@tracespace/xml-id
[npm-next]: https://www.npmjs.com/package/@tracespace/xml-id/v/next
[david]: https://david-dm.org/tracespace/tracespace?path=packages/xml-id
[@tracespace/xml-id-latest-badge]: https://flat.badgen.net/npm/v/@tracespace/xml-id
[@tracespace/xml-id-next-badge]: https://flat.badgen.net/npm/v/@tracespace/xml-id/next
[@tracespace/xml-id-david-badge]: https://flat.badgen.net/david/dep/tracespace/tracespace/packages/xml-id

## install

Please note: because this package is an internal utility library, it may not follow semver and breaking changes could be introduced in _any_ version bump. **You should install an exact version.**

```shell
npm install --save --save-exact @tracespace/xml-id
# or
yarn add --exact @tracespace/xml-id
```

## usage

```js
const {sanitize, random} = require('@tracespace/xml-id')
```

The alphabet used by this module is a subset of what is valid for XML which is also CSS identifier and URL friendly.

### sanitize(source: string): string

Takes a string and replaces any characters that would be invalid in an XML ID with underscores (`_`).

```js
const id = sanitize('0abc def.') // id === _abc_def_
```

### random(length: number): string

Returns a basic, (non-cryptographically-secure) random string that can be safely used as an XML ID. If unspecified or 0, `length` will be 12.

```js
const id = random() // maybe "w57gH_nT3-o8"
const id = random(8) // maybe "Gi3ma2Ef"
```
