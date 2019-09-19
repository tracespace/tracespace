// @tracespace/plotter
// build abstract board images from @tracespace/parser ASTs
import {InputLayer, InputOptions, Layer, Board} from './types'
import {getLayerTypes, getLayerFormats} from './layer-formats'
import {createPlot} from './plot-tree'

export * from './types'
export * from './plot-tree'
export * from './utils'

export function createBoard(
  layers: InputLayer[],
  options?: InputOptions
): Board {
  const layerTypes = getLayerTypes(layers)
  const layerFormats = getLayerFormats(layers)
  // TODO(mc, 2019-06-14): infer units from layerFormats if missing
  const boardOptions = {units: (options && options.units) || 'mm'}

  const boardLayers = layers
    .map(
      (ly: InputLayer, i: number): Layer | null => {
        const type = layerTypes[i]
        const format = layerFormats[i]

        if (format) {
          const {filename, tree} = ly
          const image = createPlot(type, format, tree)

          return {
            ...type,
            ...format,
            tree,
            image,
            filename: filename || null,
          }
        }

        return null
      }
    )
    .filter((ly: Layer | null): ly is Layer => ly !== null)

  return {layers: boardLayers, options: boardOptions}
}
