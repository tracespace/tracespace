import {layerTypes} from './layer-types'
import {flatMap} from './flat-map'
import {GerberCad, LayerTest} from './types'

export const matchers: LayerTest[] = flatMap(layerTypes, layer => {
  return flatMap(layer.matchers, matcher => {
    const match =
      'ext' in matcher
        ? new RegExp('\\.' + matcher.ext + '$', 'i')
        : new RegExp(matcher.match, 'i')

    return ([] as GerberCad[]).concat(matcher.cad).map(cad => ({
      type: layer.type,
      side: layer.side,
      match,
      cad,
    }))
  })
})
