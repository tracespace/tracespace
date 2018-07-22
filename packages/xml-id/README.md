# xml id

[![npm][npm-badge]][npm]

> XML ID utilities for tracespace projects

ID attributes in XML documents (e.g. SVG images) have certain requirements. This module provides utility methods for sanitizing and generating strings to meet those requirements so they can safely be used as XML IDs.

Part of the [tracespace][] collection of PCB visualization tools.

[tracespace]: https://github.com/tracespace/tracespace
[npm]: https://www.npmjs.com/package/@tracespace/xml-id
[npm-badge]: https://img.shields.io/npm/v/@tracespace/xml-id.svg?style=flat-square&maxAge=3600

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

The alphabet used by this module is a subset of what is valid for XML which is also URL friendly.

### sanitize(source: string): string

Takes a string and replaces any characters that would be invalid in an XML ID with underscores (`_`).

```js
const id = sanitize('0abc def') // id === _abc_def
```

### random(length: number): string

Returns a basic, (non-cryptographically-secure) random string that can be safely used as an XML ID. If unspecified or 0, `length` will be 12.

```js
const id = random()  // maybe "w57gH_nT3-o8"
const id = random(8) // maybe "Gi3ma2Ef"
```
