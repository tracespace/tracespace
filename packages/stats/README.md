# @tracespace/stats

A drill stats collector for [@tracespace/parser][] ASTs.

Part of the [tracespace][] collection of PCB visualization tools.

**This package is still in development and is not yet published.**

## usage

```js
import {createParser} from '@tracespace/parser'
import {collectDrillStats} from '@tracespace/stats'

const syntaxTree = createParser().feed(/* ...some gerber string... */).result()

const stats = collectDrillStats([syntaxTree])
```
