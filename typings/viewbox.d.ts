// Type definitions for viewbox 1.0
// Project: https://github.com/tracespace/viewbox
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare module 'viewbox' {
  namespace viewbox {
    type ViewBox = Array<number>

    interface Rectangle {
      x: number
      y: number
      width: number
      height: number
    }

    function create(): ViewBox
    function add(box: ViewBox, addend: ViewBox): ViewBox
    function scale(box: ViewBox, scale: number): ViewBox
    function rect(box: ViewBox | null): Rectangle
    function asString(box: ViewBox | null): string
  }

  export = viewbox
}
