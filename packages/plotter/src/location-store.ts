// Track the location of the plotter and parse coordinate strings
import type {GerberNode} from '@tracespace/parser'
import {GRAPHIC, TRAILING} from '@tracespace/parser'

import type {PlotOptions} from './options'

export interface Point {
  x: number
  y: number
}

export interface ArcOffsets {
  i: number
  j: number
  a: number
}

export interface Location {
  startPoint: Point
  endPoint: Point
  arcOffsets: ArcOffsets
}

export interface LocationStore {
  use(node: GerberNode, options: PlotOptions): Location
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

  use(node: GerberNode, options: PlotOptions): Location {
    let arcOffsets = this._DEFAULT_ARC_OFFSETS
    let startPoint = this._previousPoint
    let endPoint = startPoint

    if (node.type === GRAPHIC) {
      const {coordinates} = node
      const x0 = parseCoordinate(coordinates.x0, startPoint.x, options)
      const y0 = parseCoordinate(coordinates.y0, startPoint.y, options)
      const x = parseCoordinate(coordinates.x, x0, options)
      const y = parseCoordinate(coordinates.y, y0, options)
      const i = parseCoordinate(coordinates.i, 0, options)
      const j = parseCoordinate(coordinates.j, 0, options)
      const a = parseCoordinate(coordinates.a, 0, options)

      if (startPoint.x !== x0 || startPoint.y !== y0) {
        startPoint = {x: x0, y: y0}
      }

      if (endPoint.x !== x || endPoint.y !== y) {
        endPoint = {x, y}
      }

      if (i !== 0 || j !== 0 || a !== 0) {
        arcOffsets = {i, j, a}
      }
    }

    this._previousPoint = endPoint
    return {startPoint, endPoint, arcOffsets}
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
