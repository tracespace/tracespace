<div align="center">
  <h1>tracespace</h1>
  <p>Printed circuit board visualization tools for JavaScript</p>
  <p>
    <a title="CI Status" href="https://github.com/tracespace/tracespace/actions"><img src="https://img.shields.io/github/actions/workflow/status/tracespace/tracespace/ci.yml?branch=v5&style=flat-square"></a>
    <a title="Code Coverage" href="https://codecov.io/gh/tracespace/tracespace/branch/v5"><img src="https://img.shields.io/codecov/c/github/tracespace/tracespace/v5?style=flat-square"></a>
    <a title="License" href="https://github.com/tracespace/tracespace/blob/main/LICENSE"><img src="https://img.shields.io/github/license/tracespace/tracespace?style=flat-square"></a>
    <a title="Chat room" href="https://gitter.im/tracespace/Lobby"><img src="https://img.shields.io/gitter/room/tracespace/tracespace?style=flat-square"></a>
  </p>
  <p>
    <a href="https://tracespace.io">https://tracespace.io</a>
  </p>
</div>

## Work in progress

**Welcome to tracespace v5!** This version of tracespace is still in development, so documentation may not be accurate and package APIs may change without warning.

See the [main branch][] for the current v4 release.

[main branch]: https://github.com/tracespace/tracespace/tree/main

## Packages

| package                                             |                                 | description                                                                                 |
| --------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------- |
| [![cli version][]][cli npm]                         | [@tracespace/cli][]             | Use Gerber/drill files to create an SVG render of a finished PCB from the command line.     |
| [![core version][]][core npm]                       | [@tracespace/core][]            | Use Gerber/drill files to create an SVG render of a finished PCB in Node.js or the browser. |
| [![fixtures version][]][fixtures npm]               | [@tracespace/fixtures][]        | Sample Gerber/drill files for use as test fixtures.                                         |
| [![identify-layers version][]][identify-layers npm] | [@tracespace/identify-layers][] | Try to guess Gerber files' layer types based on filenames.                                  |
| [![parser version][]][parser npm]                   | [@tracespace/parser][]          | Parse Gerber/drill files into abstract syntax trees.                                        |
| [![plotter version][]][plotter npm]                 | [@tracespace/plotter][]         | Plot @tracespace/parser ASTs into image trees.                                              |
| [![renderer version][]][renderer npm]               | [@tracespace/renderer][]        | Render @tracespace/plotter image trees as SVGs                                              |
| [![xml-id version][]][xml-id npm]                   | [@tracespace/xml-id][]          | XML element ID generation and sanitation utilities.                                         |

[@tracespace/cli]: ./packages/cli
[@tracespace/core]: ./packages/parser
[@tracespace/fixtures]: ./packages/fixtures
[@tracespace/identify-layers]: ./packages/identify-layers
[@tracespace/parser]: ./packages/parser
[@tracespace/plotter]: ./packages/plotter
[@tracespace/renderer]: ./packages/renderer
[@tracespace/xml-id]: ./packages/xml-id
[cli npm]: https://www.npmjs.com/package/@tracespace/cli/v/next
[core npm]: https://www.npmjs.com/package/@tracespace/core/v/next
[fixtures npm]: https://www.npmjs.com/package/@tracespace/fixtures/v/next
[identify-layers npm]: https://www.npmjs.com/package/@tracespace/identify-layers/v/next
[parser npm]: https://www.npmjs.com/package/@tracespace/parser/v/next
[plotter npm]: https://www.npmjs.com/package/@tracespace/plotter/v/next
[renderer npm]: https://www.npmjs.com/package/@tracespace/renderer/v/next
[xml-id npm]: https://www.npmjs.com/package/@tracespace/xml-id/v/next
[cli version]: https://img.shields.io/npm/v/@tracespace/cli/next?style=flat-square
[core version]: https://img.shields.io/npm/v/@tracespace/core/next?style=flat-square
[fixtures version]: https://img.shields.io/npm/v/@tracespace/fixtures/next?style=flat-square
[identify-layers version]: https://img.shields.io/npm/v/@tracespace/identify-layers/next?style=flat-square
[parser version]: https://img.shields.io/npm/v/@tracespace/parser/next?style=flat-square
[plotter version]: https://img.shields.io/npm/v/@tracespace/plotter/next?style=flat-square
[renderer version]: https://img.shields.io/npm/v/@tracespace/renderer/next?style=flat-square
[xml-id version]: https://img.shields.io/npm/v/@tracespace/xml-id/next?style=flat-square

## Roadmap

[I][] work on tracespace in my free time, so this roadmap should be taken with several grains of salt. While the new version is in development, pre-production versions of libraries will be periodically released under the `next` tag in npm.

- [x] New build tools based on [vite][] and [TypeScript][]
- [x] Create [@tracespace/parser][] package to generate [unist][] abstract syntax trees
  - Replaces gerber-parser from tracespace v4
- [x] Create [@tracespace/plotter][] package convert ASTs to image trees
  - Replaces gerber-plotter from tracespace v4
- [x] Create [@tracespace/renderer][] package convert image trees to [hast][] SVG trees
  - Replaces gerber-to-svg from tracespace v4
- [x] Rename whats-that-gerber to [@tracespace/identify-layers][]
- [x] Create [@tracespace/core][] package to hold the core render pipeline
  - Replaces pcb-stackup and pcb-stackup-core from tracespace v4
- [x] Rewrite [@tracespace/cli] to use new render pipeline
- [ ] Rewrite <https://tracespace.io/view/> to use new render pipeline
- [ ] Build documentation website for tracespace libraries
- [ ] Ensure all important Gerber / drill features are supported
- [ ] Release tracespace v5

[i]: https://github.com/mcous
[vite]: https://vitejs.dev/
[typescript]: https://www.typescriptlang.org/
[unist]: https://unifiedjs.com/
[hast]: https://github.com/syntax-tree/hast

### Issues to fix

The v5 release will attempt to fix / address the following open issues:

- [x] Handle disagreements between filename type vs parsed type ([#49][])
- [x] Reduce number of `<use>` tags in SVG output ([#80][])
- [x] Arc plotting should be more lenient ([#82][])
- [x] Operation with non-existent tool should no-op with a warning ([#83][])
- [x] Fails to detect units if format spec combined with units spec ([#234][])
- [x] clipPath for outline breaks in Firefox if outline has clear layers ([#302][])
- [x] gerberParser.parseSync clobbers filetype option ([#306][])
- [x] Gerber file starting with newline incorrectly identified as drill file ([#307][])
- [x] Generate consistent document size for all layers. ([#324][])
- [ ] G93 code in drill file rendered as drilled hole ([#353][])
- [x] Allow soldermask layer to cover vias in board render ([#399][])

[#49]: https://github.com/tracespace/tracespace/issues/49
[#80]: https://github.com/tracespace/tracespace/issues/80
[#82]: https://github.com/tracespace/tracespace/issues/82
[#83]: https://github.com/tracespace/tracespace/issues/83
[#234]: https://github.com/tracespace/tracespace/issues/234
[#302]: https://github.com/tracespace/tracespace/issues/302
[#306]: https://github.com/tracespace/tracespace/issues/306
[#307]: https://github.com/tracespace/tracespace/issues/307
[#324]: https://github.com/tracespace/tracespace/issues/324
[#353]: https://github.com/tracespace/tracespace/issues/353
[#399]: https://github.com/tracespace/tracespace/issues/399

## tracespace in the wild

- [tracespace.io/view][tracespace-view] - A Gerber viewer powered by the tracespace libraries
- [kitspace.org][kitspace] - An electronics project sharing site with links to easily buy the required parts
- [OpenHardware.io][openhardware] - A social site around open source hardware. Enables authors to sell and manufacture their boards.

[tracespace-view]: https://tracespace.io/view
[kitspace]: https://kitspace.org
[openhardware]: https://www.openhardware.io
