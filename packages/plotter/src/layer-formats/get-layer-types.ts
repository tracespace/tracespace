// return an array of side/types for input layers
// index of output matches index of input
import {identifyLayers} from 'whats-that-gerber'
import {InputLayer, LayerType} from '../types'

export function getLayerTypes(layers: InputLayer[]): LayerType[] {
  const layerFilenames = layers
    .map(ly => ly.filename)
    .filter((name): name is string => Boolean(name))

  const layerTypes = identifyLayers(layerFilenames)

  return layers.map(ly => {
    const typeByFilename = ly.filename
      ? layerTypes[ly.filename]
      : {type: null, side: null}

    return {
      type: ly.type || typeByFilename.type,
      side: ly.side || typeByFilename.side,
    }
  })
}
