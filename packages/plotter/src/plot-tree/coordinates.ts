// Coordinate string utilities
import {TRAILING} from '@tracespace/parser'
import {LayerFormat} from '../types'

export function parseCoordinate(
  coord: string | null,
  format: LayerFormat
): number {
  if (coord === null) return Number.NaN

  // Short-circuit if coordinate has a decimal point
  if (coord.includes('.')) return Number(coord)

  const {coordFormat, zeroSuppression} = format
  const numberDigits = coordFormat[0] + coordFormat[1]
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

  const leading = coord.slice(0, coordFormat[0])
  const trailing = coord.slice(coordFormat[0])

  return Number(`${sign}${leading}.${trailing}`)
}
