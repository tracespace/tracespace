// Type definitions for whats-that-gerber 4.0
// Project: https://github.com/tracespace/tracespace
// Definitions by: Mike Cousins <https://mike.cousins.io>

declare function whatsThatGerber<T extends string>(
  filenames: ReadonlyArray<T>
): Record<T, whatsThatGerber.GerberProps>

declare namespace whatsThatGerber {
  // TODO(mc, 2018-11-21): dedupe this definition and source
  const TYPE_COPPER = 'copper'
  const TYPE_SOLDERMASK = 'soldermask'
  const TYPE_SILKSCREEN = 'silkscreen'
  const TYPE_SOLDERPASTE = 'solderpaste'
  const TYPE_DRILL = 'drill'
  const TYPE_OUTLINE = 'outline'
  const TYPE_DRAWING = 'drawing'

  // board sides
  const SIDE_TOP = 'top'
  const SIDE_BOTTOM = 'bottom'
  const SIDE_INNER = 'inner'
  const SIDE_ALL = 'all'

  function validate(target: object): GerberProps & {valid: boolean}

  function getAllLayers(): Array<GerberProps>

  type GerberType =
    | typeof TYPE_COPPER
    | typeof TYPE_SOLDERMASK
    | typeof TYPE_SILKSCREEN
    | typeof TYPE_SOLDERPASTE
    | typeof TYPE_DRILL
    | typeof TYPE_OUTLINE
    | typeof TYPE_DRAWING
    | null

  type GerberSide =
    | typeof SIDE_TOP
    | typeof SIDE_BOTTOM
    | typeof SIDE_INNER
    | typeof SIDE_ALL
    | null

  interface GerberProps {
    type: GerberType
    side: GerberSide
  }
}

export = whatsThatGerber
