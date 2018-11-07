// helper for stack layers that scales, wraps, gathers the defs of layers
'use strict'

var viewbox = require('viewbox')
var wtg = require('whats-that-gerber')

var wrapLayer = require('./wrap-layer')

module.exports = function gatherLayers(
  element,
  idPrefix,
  layers,
  drills,
  outline,
  maskWithOutline
) {
  var defs = []
  var layerIds = []
  var drillIds = []
  var units = ''
  var unitsCount = {in: 0, mm: 0}
  var allLayers = layers.concat(drills, outline || [])

  var drillCount = 0
  var getUniqueId = function(type) {
    var id = idPrefix + type

    if (type === wtg.TYPE_DRILL) {
      drillCount++
      id += drillCount
    }

    return id
  }

  allLayers.forEach(function(layer) {
    if (!layer.externalId) {
      defs = defs.concat(defs, layer.converter.defs)
    }

    if (layer.converter.units === 'mm') {
      unitsCount.mm++
    } else {
      unitsCount.in++
    }
  })

  if (unitsCount.in + unitsCount.mm) {
    units = unitsCount.in > unitsCount.mm ? 'in' : 'mm'
  }

  var viewboxLayers = outline ? [outline] : allLayers
  var box = viewboxLayers.reduce(function(result, layer) {
    var nextBox = layer.converter.viewBox

    nextBox = viewbox.scale(nextBox, getScale(units, layer.converter.units))

    return viewbox.add(result, nextBox)
  }, viewbox.create())

  var wrapConverterLayer = function(collection) {
    return function(layer) {
      var id = layer.externalId
      var converter = layer.converter

      if (!id) {
        id = getUniqueId(layer.type)
        defs.push(
          wrapLayer(element, id, converter, getScale(units, converter.units))
        )
      }

      collection.push({type: layer.type, id: id})
    }
  }

  layers.forEach(wrapConverterLayer(layerIds))
  drills.forEach(wrapConverterLayer(drillIds))

  var outlineId

  // add the outline to defs if it's not defined externally or if we're using it to clip
  if (outline) {
    if (outline.externalId && !maskWithOutline) {
      outlineId = outline.externalId
    } else {
      outlineId = getUniqueId(outline.type)

      defs.push(
        wrapLayer(
          element,
          outlineId,
          outline.converter,
          getScale(units, outline.converter.units),
          maskWithOutline ? 'clipPath' : 'g'
        )
      )
    }
  }

  return {
    defs: defs,
    box: box,
    units: units,
    layerIds: layerIds,
    drillIds: drillIds,
    outlineId: outlineId,
  }
}

function getScale(units, layerUnits) {
  var scale = units === 'in' ? 1 / 25.4 : 25.4
  var result = units === layerUnits ? 1 : scale

  return result
}
