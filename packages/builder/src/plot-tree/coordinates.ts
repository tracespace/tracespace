// coordinate string utilities
import {LEADING, TRAILING} from '@tracespace/parser'
import {LayerFormat} from '../types'

import padStart from 'lodash.padstart'
import padEnd from 'lodash.padend'

export function parseCoordinate(coord: string, format: LayerFormat): number {
  // short-circuit if coordinate has a decimal point
  if (coord.indexOf('.') > -1) return Number(coord)

  const {coordFormat, zeroSuppression} = format
  const numDigits = coordFormat[0] + coordFormat[1]
  const pad = zeroSuppression === LEADING ? padStart : padEnd
  let sign = '+'

  // handle optional sign
  if (coord[0] === '-' || coord[0] === '+') {
    sign = coord[0]
    coord = coord.slice(1)
  }

  coord = pad(coord, numDigits, '0')
  const leading = coord.slice(0, coordFormat[0])
  const trailing = coord.slice(coordFormat[0])

  return Number(`${sign}${leading}.${trailing}`)
}
