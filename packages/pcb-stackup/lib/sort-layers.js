// sort layers array into top and bottom
'use strict'

module.exports = function sortLayers(layers) {
  var drillCount = 1
  return layers.reduce(function(result, layer) {
    var converter = layer.converter
    var type = layer.type.id
    var side = type[0]
    var subtype = type.slice(1)

    if (type === 'drl') {
      result.mech['drl' + drillCount] = converter
      drillCount++
    }
    else if (type === 'out') {
      result.mech.out = converter
    }
    else if (side === 't') {
      result.top[subtype] = converter
    }
    else if (side === 'b') {
      result.bottom[subtype] = converter
    }

    return result
  }, {top: {}, bottom: {}, mech: {}})
}
