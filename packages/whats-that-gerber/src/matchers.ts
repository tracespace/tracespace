import {layerTypes} from './layer-types'
import type {LayerTest} from './types'

export const matchers: LayerTest[] = layerTypes.flatMap(layer => {
  return layer.matchers.flatMap(matcher => {
    const cadList = Array.isArray(matcher.cad) ? matcher.cad : [matcher.cad]
    const match =
      'ext' in matcher
        ? new RegExp('\\.' + matcher.ext + '$', 'i')
        : new RegExp(matcher.match, 'i')

    return cadList.map(cad => ({
      type: layer.type,
      side: layer.side,
      match,
      cad,
    }))
  })
})
