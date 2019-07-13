// return an array of layer formats
import * as Parser from '@tracespace/parser'
import {InputLayer, LayerFormat} from './types'

type FormatResult = LayerFormat | null

export default function getLayerFormats(layers: InputLayer[]): FormatResult[] {
  const result: FormatResult[] = layers
    .map(ly => {
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

      return {filetype, units, coordMode, coordFormat, zeroSuppression}
    })
    .map(f => {
      const {filetype, units, coordMode, coordFormat, zeroSuppression} = f

      // TODO(mc, 2019-06-09): infer and/or assume missing values based on context
      return filetype && units && coordMode && coordFormat && zeroSuppression
        ? {filetype, units, coordMode, coordFormat, zeroSuppression}
        : null
    })

  return result
}
