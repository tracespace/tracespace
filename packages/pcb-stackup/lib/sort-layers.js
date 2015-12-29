// sort layers array into top and bottom
'use strict'

module.exports = function(layerObjects) {
  return layerObjects.reduce(function(result, layerObject) {
    var layer = layerObject.layer
    var type = layerObject.type
    var side = type[0]
    var subtype = type.slice(1)

    if (type === 'drl') {
      result.mech.drl = result.mech.drl || []
      result.mech.drl.push(layer)
    }
    else if (type === 'out') {
      result.mech.out = layer
    }
    else if (side === 't') {
      result.top[subtype] = layer
    }
    else if (side === 'b') {
      result.bottom[subtype] = layer
    }

    return result
  }, {top: {}, bottom: {}, mech: {}})
}
