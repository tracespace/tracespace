// Track the location of the plotter and parse coordinate strings
import {GRAPHIC, TRAILING, Child} from '@tracespace/parser'

import {PlotOptions} from './options'

export interface Point {
  x: number
  y: number
}

export interface ArcOffsets {
  i: number
  j: number
  a: number
}

export type Location = [
  PreviousPoint: Point,
  nextPoint: Point,
  arcOffsets: ArcOffsets
]

export interface LocationStore {
  use(node: Child, options: PlotOptions): Location
}

export function createLocationStore(): LocationStore {
  return Object.create(LocationStorePrototype)
}

interface LocationStoreState {
  _DEFAULT_ARC_OFFSETS: ArcOffsets
  _previousPoint: Point
}

const LocationStorePrototype: LocationStore & LocationStoreState = {
  _DEFAULT_ARC_OFFSETS: {i: 0, j: 0, a: 0},
  _previousPoint: {x: 0, y: 0},

  use(node: Child, options: PlotOptions): Location {
    let offsets = this._DEFAULT_ARC_OFFSETS
    let previous = this._previousPoint
    let next = previous

    if (node.type === GRAPHIC) {
      const {coordinates} = node
      const x0 = parseCoordinate(coordinates.x0, previous.x, options)
      const y0 = parseCoordinate(coordinates.y0, previous.y, options)
      const x = parseCoordinate(coordinates.x, x0, options)
      const y = parseCoordinate(coordinates.y, y0, options)
      const i = parseCoordinate(coordinates.i, 0, options)
      const j = parseCoordinate(coordinates.j, 0, options)
      const a = parseCoordinate(coordinates.a, 0, options)

      if (previous.x !== x0 || previous.y !== y0) {
        previous = {x: x0, y: y0}
      }

      if (next.x !== x || next.y !== y) {
        next = {x, y}
      }

      if (i !== 0 || j !== 0 || a !== 0) {
        offsets = {i, j, a}
      }
    }

    this._previousPoint = next
    return [previous, next, offsets]
  },
}

function parseCoordinate(
  coordinate: string | undefined,
  defaultValue: number,
  options: PlotOptions
): number {
  if (typeof coordinate !== 'string') {
    return defaultValue
  }

  if (coordinate.includes('.') || coordinate === '0') {
    return Number(coordinate)
  }

  const {coordinateFormat, zeroSuppression} = options
  const [integerPlaces, decimalPlaces] = coordinateFormat

  const [sign, signlessCoordinate] =
    coordinate.startsWith('+') || coordinate.startsWith('-')
      ? [coordinate[0], coordinate.slice(1)]
      : ['+', coordinate]

  const digits = integerPlaces + decimalPlaces
  const paddedCoordinate =
    zeroSuppression === TRAILING
      ? signlessCoordinate.padEnd(digits, '0')
      : signlessCoordinate.padStart(digits, '0')

  const leading = paddedCoordinate.slice(0, integerPlaces)
  const trailing = paddedCoordinate.slice(integerPlaces)

  return Number(`${sign}${leading}.${trailing}`)
}
