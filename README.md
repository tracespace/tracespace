<div align="center">
  <h1>tracespace</h1>
  <p>Printed circuit board visualization tools for JavaScript</p>
  <p>
    <a title="CI Status" href="https://github.com/tracespace/tracespace/actions"><img src="https://img.shields.io/github/workflow/status/tracespace/tracespace/continuous%20integration/v5?style=flat-square"></a>
    <a title="Code Coverage" href="https://codecov.io/gh/tracespace/tracespace/branch/v5"><img src="https://img.shields.io/codecov/c/github/tracespace/tracespace/v5?style=flat-square"></a>
    <a title="License" href="https://github.com/tracespace/tracespace/blob/main/LICENSE"><img src="https://img.shields.io/github/license/tracespace/tracespace?style=flat-square"></a>
    <a title="Chat room" href="https://gitter.im/tracespace/Lobby"><img src="https://img.shields.io/gitter/room/tracespace/tracespace?style=flat-square"></a>
  </p>
</div>

## Work in progress

**Welcome to the development branch for tracespace v5!** This version of tracespace is still in early development. Documentation may not be accurate, and package APIs may change without warning.

### To do

- [x] Use TypeScript
- `@tracespace/parser` package to generate [unist][] abstract syntax trees
  - [x] Parses Gerber files
  - [x] Parses drill files
  - [x] Synchronous by default but streaming compatible
  - [x] Fully covered by tests
  - [x] In-code documentation
- `@tracespace/plotter` package to take a board's collection of Gerber ASTs and generate image description trees
  - [ ] Can plot any Gerber file
  - [ ] Can plot any drill file
  - [ ] Infers coordinate format settings using the full context of all layers
  - [ ] Infers board outline
  - [ ] Fully covered by tests
  - [ ] In-code documentation
- `@tracespace/renderer` package to output [hast][] ASTs of the SVG translation of the image trees
  - [ ] Renders individual layer views
  - [ ] Renders board views
  - [ ] Covered by tests
  - [ ] In-code documentation
- [ ] tracespace CLI powered by new libraries
- [ ] tracespace view powered by new libraries
- [ ] documentation website

[unist]: https://unifiedjs.com/
[hast]: https://github.com/syntax-tree/hast

### Issues to fix

The v5 release will attempt to fix / address the following open issues:

- [ ] Handle disagreements between filename type vs parsed type ([#49][])
- [ ] Reduce number of `<use>` tags in SVG output ([#80][])
- [ ] Arc plotting should be more lenient ([#82][])
- [ ] Operation with non-existent tool should no-op with a warning ([#83][])
- [x] Fails to detect units if format spec combined with units spec ([#234][])
- [ ] clipPath for outline breaks in Firefox if outline has clear layers ([#302][])
- [x] gerberParser.parseSync clobbers filetype option ([#306][])
- [x] Gerber file starting with newline incorrectly identified as drill file ([#307][])
- [ ] Generate consistent document size for all layers. ([#324][])

[#49]: https://github.com/tracespace/tracespace/issues/49
[#80]: https://github.com/tracespace/tracespace/issues/80
[#82]: https://github.com/tracespace/tracespace/issues/82
[#83]: https://github.com/tracespace/tracespace/issues/83
[#234]: https://github.com/tracespace/tracespace/issues/234
[#302]: https://github.com/tracespace/tracespace/issues/302
[#306]: https://github.com/tracespace/tracespace/issues/306
[#307]: https://github.com/tracespace/tracespace/issues/307
[#324]: https://github.com/tracespace/tracespace/issues/324

## Examples

Renders of the [Arduino Uno][arduino] produced by tracespace:

![arduino uno top][top]
![arduino uno bottom][bottom]

Arduino Uno design files used under the terms of the [Creative Commons Attribution Share-Alike license][arduino-osh].

<details>
  <summary>Individual layers</summary>
  <h4>top copper</h4>
  <img
    title='arduino uno cmp'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.cmp.svg'
  >

  <h4>drill hits</h4>
  <img
    title='arduino uno drd'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.drd.svg'>

  <h4>outline</h4>
  <img
    title='arduino uno gko'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.gko.svg'>

  <h4>top silkscreen</h4>
  <img
    title='arduino uno plc'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.plc.svg'>

  <h4>bottom copper</h4>
  <img
    title='arduino uno sol'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.sol.svg'>

  <h4>top soldermask</h4>
  <img
    title='arduino uno stc'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.stc.svg'>

  <h4>bottom soldermask</h4>
  <img
    title='arduino uno sts'
    src='https://unpkg.com/gerber-to-svg@latest/example/arduino-uno.sts.svg'>
</details>

[arduino]: https://www.arduino.cc/
[arduino-osh]: https://www.arduino.cc/en/Main/FAQ
[top]: https://unpkg.com/pcb-stackup@latest/example/arduino-uno-top.svg
[bottom]: https://unpkg.com/pcb-stackup@latest/example/arduino-uno-bottom.svg

## tracespace in the wild

- [tracespace.io/view][tracespace-view] - A Gerber viewer powered by the tracespace libraries
- [kitspace.org][kitspace] - An electronics project sharing site with links to easily buy the required parts
- [OpenHardware.io][openhardware] - A social site around open source hardware. Enables authors to sell and manufacture their boards.

[tracespace-view]: https://tracespace.io/view
[kitspace]: https://kitspace.org
[openhardware]: https://www.openhardware.io
