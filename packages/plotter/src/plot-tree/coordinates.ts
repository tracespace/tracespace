// Coordinate string utilities
import {TRAILING} from '@tracespace/parser'
import {PlotOptions} from '../options'

export function parseCoordinate(
  coord: string | null,
  options: PlotOptions
): number {
  if (coord === null) return Number.NaN

  // Short-circuit if coordinate has a decimal point
  if (coord.includes('.')) return Number(coord)

  const {coordinateFormat, zeroSuppression} = options
  const [integerPlaces, decimalPlaces] = coordinateFormat!
  const numberDigits = integerPlaces + decimalPlaces
  let sign = '+'

  // Handle optional sign
  if (coord.startsWith('-') || coord.startsWith('+')) {
    sign = coord[0]
    coord = coord.slice(1)
  }

  coord =
    zeroSuppression === TRAILING
      ? coord.padEnd(numberDigits, '0')
      : coord.padStart(numberDigits, '0')

  const leading = coord.slice(0, integerPlaces)
  const trailing = coord.slice(integerPlaces)

  return Number(`${sign}${leading}.${trailing}`)
}
