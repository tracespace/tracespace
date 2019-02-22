// sort layers array into top and bottom
'use strict'

var wtg = require('whats-that-gerber')

module.exports = function sortLayers(layers) {
  return layers.filter(acceptLayer).reduce(assignLayer, {
    top: [],
    bottom: [],
    drills: [],
    outline: null,
  })
}

function acceptLayer(layer) {
  return (
    layer != null &&
    layer.type != null &&
    layer.side != null &&
    layer.converter != null &&
    layer.converter.layer != null &&
    layer.converter.layer.length
  )
}

function assignLayer(result, layer) {
  var type = layer.type
  var side = layer.side

  if (type === wtg.TYPE_DRILL) {
    result.drills.push(layer)
  } else if (type === wtg.TYPE_OUTLINE) {
    result.outline = layer
  } else {
    if (side === wtg.SIDE_TOP) {
      result.top.push(layer)
    } else if (side === wtg.SIDE_BOTTOM) {
      result.bottom.push(layer)
    }
  }

  return result
}
