// Track the location of the plotter and parse coordinate strings
import {GRAPHIC, TRAILING, Child} from '@tracespace/parser'

import {PlotOptions} from './options'

export interface PreviousLocation {
  x: number
  y: number
}

export interface NextLocation {
  x: number
  y: number
  i: number
  j: number
  a: number
  x0: number
  y0: number
}

export type Location = [
  PreviousLocation: PreviousLocation,
  nextLocation: NextLocation
]

export interface LocationStore {
  use(node: Child, options: PlotOptions): Location
}

export function createLocationStore(): LocationStore {
  return Object.create(LocationStorePrototype)
}

interface LocationStoreState {
  _previousLocation: PreviousLocation
  _nextLocation: NextLocation
}

const LocationStorePrototype: LocationStore & LocationStoreState = {
  _previousLocation: {x: 0, y: 0},
  _nextLocation: {x: 0, y: 0, i: 0, j: 0, a: 0, x0: 0, y0: 0},

  use(node: Child, options: PlotOptions): Location {
    const previous = this._previousLocation

    if (node.type === GRAPHIC) {
      const {coordinates} = node
      const x = parseCoordinate(coordinates.x, previous.x, options)
      const y = parseCoordinate(coordinates.y, previous.y, options)
      this._nextLocation = {x, y, i: 0, j: 0, a: 0, x0: x, y0: y}
    }

    const next = this._nextLocation

    if (previous.x !== next.x || previous.y !== next.y) {
      this._previousLocation = {x: next.x, y: next.y}
    }

    return [previous, next]
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
  const digits = integerPlaces + decimalPlaces
  const sign =
    coordinate.startsWith('+') || coordinate.startsWith('-')
      ? coordinate[0]
      : ''

  const signlessCoordinate = coordinate.replace(/^[+-]/, '')
  const paddedCoordinate =
    zeroSuppression === TRAILING
      ? signlessCoordinate.padEnd(digits, '0')
      : signlessCoordinate.padStart(digits, '0')

  const leading = paddedCoordinate.slice(0, integerPlaces)
  const trailing = paddedCoordinate.slice(integerPlaces)

  return Number(`${sign}${leading}.${trailing}`)
  // if (coord == null) return defaultValue

  // Short-circuit if coordinate has a decimal point
  // if (coord.includes('.')) {return Number(coord)

  // const {coordinateFormat, zeroSuppression} = options
  // const [integerPlaces, decimalPlaces] = coordinateFormat ?? [2, 4]
  // const numberDigits = integerPlaces + decimalPlaces
  // let sign = '+'

  // // Handle optional sign
  // if (coord.startsWith('-') || coord.startsWith('+')) {
  //   sign = coord[0]
  //   coord = coord.slice(1)
  // }

  // coord =
  //   zeroSuppression === TRAILING
  //     ? coord.padEnd(numberDigits, '0')
  //     : coord.padStart(numberDigits, '0')

  // const leading = coord.slice(0, integerPlaces)
  // const trailing = coord.slice(integerPlaces)

  // return Number(`${sign}${leading}.${trailing}`)
}
