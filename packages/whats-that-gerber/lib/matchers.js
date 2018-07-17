'use strict'

var flatMap = require('./flat-map')
var layerTypes = require('./layer-types')

module.exports = flatMap(layerTypes, layerTypeToMatchers)

function layerTypeToMatchers (layer) {
  return flatMap(layer.matchers, matcherToCadMatchers)

  function matcherToCadMatchers (matcher) {
    var match = matcher.ext
      ? new RegExp(`\\.${matcher.ext}$`, 'i')
      : new RegExp(matcher.match, 'i')

    return [].concat(matcher.cad).map(mergeLayerWithCad)

    function mergeLayerWithCad (cad) {
      return {
        id: layer.id,
        type: layer.type,
        side: layer.side,
        match: match,
        cad: cad
      }
    }
  }
}
