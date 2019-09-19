// return an array of layer formats
import * as Parser from '@tracespace/parser'
import unistVisit from 'unist-util-visit-parents'

import {InputLayer, LayerFormat} from '../types'
import {getArrayMode} from '../utils'

type NullableFormat = {[P in keyof LayerFormat]: LayerFormat[P] | null}
type FormatResult = LayerFormat | null

const DEFAULT_UNITS = Parser.MM
const DEFAULT_MODE = Parser.ABSOLUTE
const DEFAULT_FORMAT_IN: Parser.Format = [2, 4]
const DEFAULT_FORMAT_MM: Parser.Format = [3, 5]
const DEFAULT_ZERO = Parser.LEADING

const filterDrillFormatHint = (node: Parser.Node): boolean =>
  node.type === Parser.COMMENT && node.value.indexOf('FORMAT') > -1

export function getLayerFormats(layers: InputLayer[]): FormatResult[] {
  const result: NullableFormat[] = layers.map(ly => {
    const filetype = ly.tree.filetype
    let units = ly.units || null
    let coordMode = ly.coordMode || null
    let coordFormat = ly.coordFormat || null
    let zeroSuppression = ly.zeroSuppression || null

    const [header] = ly.tree.children

    header.children.forEach(node => {
      if (node.type === Parser.UNITS && units === null) {
        units = node.units
      } else if (node.type === Parser.COORDINATE_FORMAT) {
        if (coordMode === null) coordMode = node.mode
        if (coordFormat === null) coordFormat = node.format
        if (zeroSuppression === null) zeroSuppression = node.zeroSuppression
      }
    })

    return {
      filetype,
      units,
      coordMode: coordMode || inferCoordinateMode(),
      coordFormat: coordFormat || inferCoordinateFormat(ly),
      zeroSuppression: zeroSuppression || inferZeroSuppression(ly),
    }
  })

  const commonUnits = getArrayMode(result.map(f => f.units))
  const commonMode = getArrayMode(result.map(f => f.coordMode))
  const commonFormat = getArrayMode(result.map(f => f.coordFormat))
  const commonZero = getArrayMode(result.map(f => f.zeroSuppression))

  return result.map(format => {
    const {filetype} = format
    if (filetype === null) return null

    const units = format.units || commonUnits || DEFAULT_UNITS
    const coordMode = format.coordMode || commonMode || DEFAULT_MODE
    const coordFormat =
      format.coordFormat ||
      commonFormat ||
      (units === Parser.MM ? DEFAULT_FORMAT_MM : DEFAULT_FORMAT_IN)
    const zeroSuppression = format.zeroSuppression || commonZero || DEFAULT_ZERO

    return {filetype, units, coordMode, coordFormat, zeroSuppression}
  })
}

// as far as I can tell, incremental coordinates are never used by anyone
export function inferCoordinateMode(): Parser.Mode {
  return Parser.ABSOLUTE
}

export function inferCoordinateFormat(layer: InputLayer): Parser.Format | null {
  let result: Parser.Format | null = null

  if (layer.tree.filetype === Parser.DRILL) {
    unistVisit<Parser.Node, Parser.Comment>(
      layer.tree,
      filterDrillFormatHint,
      comment => {
        const {value} = comment
        const formatMatch = value.match(/(\d):(\d)/)

        if (formatMatch) {
          result = [Number(formatMatch[1]), Number(formatMatch[2])]
        }

        // stop traversing when we have a result
        if (result) return false
      }
    )

    if (result !== null) return result
  }

  return result
}

export function inferZeroSuppression(
  layer: InputLayer
): Parser.ZeroSuppression | null {
  let result: Parser.ZeroSuppression | null = null

  // drill files often contain comments that spec out their format due to
  // shortcomings in the NC drill "format"; look at the comments if we need to
  if (layer.tree.filetype === Parser.DRILL) {
    unistVisit<Parser.Node, Parser.Comment>(
      layer.tree,
      filterDrillFormatHint,
      comment => {
        const {value} = comment
        if (value.indexOf('suppress trailing zeros') > -1) {
          result = Parser.TRAILING
        } else if (
          value.indexOf('suppress leading zeros') > -1 ||
          value.indexOf('keep zeros') > -1 ||
          value.indexOf('decimal') > -1
        ) {
          result = Parser.LEADING
        }

        // stop traversing when we have a result
        if (result) return false
      }
    )
  }

  if (result !== null) return result

  // if we weren't able to get zero suppression from comments (or if this
  // isn't a drill file), try to look for zeros at the beginnings and ends of
  // the coordinate strings themselves
  unistVisit<Parser.Node, Parser.Graphic>(layer.tree, Parser.GRAPHIC, node => {
    const {coordinates} = node

    Object.keys(coordinates).forEach(axis => {
      const coordString = coordinates[axis] || ''

      // this logic may trigger for coordinates with no zero suppression, but
      // that's ok, because if all zeros are present the coordinate parsing
      // will be correct regardless of the zero suppression setting
      if (
        coordString[coordString.length - 1] === '0' ||
        coordString.indexOf('.') > -1
      ) {
        result = Parser.LEADING
      } else if (coordString[0] === '0') {
        result = Parser.TRAILING
      }
    })

    // stop traversing when we have a result
    if (result !== null) return false
  })

  return result
}
