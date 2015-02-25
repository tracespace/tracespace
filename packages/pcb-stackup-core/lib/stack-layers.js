// stack layers function (where the magic happens)
'use strict'

var wrapLayer = require('./wrap-layer')
var viewBox = require('./view-box')

var useLayer = function(element, id, className, mask) {
  var attr = {'xlink:href': '#' + id}

  if (className) {
    attr.fill = 'currentColor'
    attr.stroke = 'currentColor'
    attr.class = className
  }

  if (mask) {
    attr.mask = 'url(#' + mask + ')'
  }

  return element('use', attr)
}

var mechMask = function(element, id, box, mechIds, useOutline) {
  var mask = []
  var maskAttr = {id: id, fill: '#000', stroke: '#000'}

  if (useOutline && mechIds.out) {
    mask.push(useLayer(element, mechIds.out))
  }
  else {
    mask.push(viewBox.rect(element, box, '', '#fff'))
  }

  mask = Object.keys(mechIds).reduce(function(result, type) {
    var id = mechIds[type]

    if (type !== 'out') {
      result.push(useLayer(element, id))
    }

    return result
  }, mask)

  return element('mask', maskAttr, mask)
}

module.exports = function(element, id, side, converters, mechs, maskWithOutline) {
  var classPrefix = id + '_'
  var idPrefix = id + '_' + side + '_'

  // decide what units we're using
  var converterTypes = Object.keys(converters)
  var mechTypes = Object.keys(mechs)
  var allConverters = {}
  var allConverterTypes = []
  var collectAllConverters = function(types, convertersByType) {
    types.forEach(function(type) {
      allConverters[type] = convertersByType[type]
      allConverterTypes.push(type)
    })
  }

  collectAllConverters(converterTypes, converters)
  collectAllConverters(mechTypes, mechs)

  var unitsCount = allConverterTypes.reduce(function(result, type) {
    var units = allConverters[type].units

    result[units] = (result[units] || 0) + 1

    return result
  }, {in: 0, mm: 0})

  var units = (allConverterTypes.length !== 0)
    ? (((unitsCount.in) > (unitsCount.mm)) ? 'in' : 'mm')
    : ''

  var switchUnitsScale = (units === 'in') ? (1 / 25.4) : 25.4

  var getScale = function(converter) {
    return (converter.units === units) ? 1 : switchUnitsScale
  }

  // gather defs and viewboxes from all converters
  var defsAndBox = allConverterTypes.reduce(function(result, type) {
    var converter = allConverters[type]
    var scale = getScale(converter)

    // only combine viewboxes if there's no outline layer, otherwise use outline
    if (!mechs.out || (mechs.out && type === 'out')) {
      result.box = viewBox.addScaled(result.box, converter.viewBox, scale)
    }

    result.defs = result.defs.concat(converter.defs)

    return result
  }, {defs: [], box: viewBox.new()})

  var defs = defsAndBox.defs
  var box = defsAndBox.box

  // wrap all layers in layers and add them to defs
  var mapConvertersToIds = function(types, convertersByType) {
    return types.reduce(function(result, type) {
      var converter = convertersByType[type]
      var layerId = idPrefix + type
      var scale = getScale(converter)

      defs.push(wrapLayer(element, layerId, converter, scale))
      result[type] = layerId

      return result
    }, {})
  }

  var layerIds = mapConvertersToIds(converterTypes, converters)
  var mechIds = mapConvertersToIds(mechTypes, mechs)
  var mechMaskId = idPrefix + 'mech-mask'

  defs.push(mechMask(element, mechMaskId, box, mechIds, maskWithOutline))

  // build the layer starting with an fr4 rectangle the size of the viewbox
  var layer = [viewBox.rect(element, box, classPrefix + 'fr4', 'currentColor')]

  // add copper and copper finish
  if (layerIds.cu) {
    var cfMaskId = idPrefix + 'cf-mask'
    var cfMaskAttr = {id: cfMaskId, fill: '#fff', stroke: '#fff'}
    var cfMaskShape = (layerIds.sm)
      ? [useLayer(element, layerIds.sm)]
      : [viewBox.rect(element, box)]

    defs.push(element('mask', cfMaskAttr, cfMaskShape))
    layer.push(useLayer(element, layerIds.cu, classPrefix + 'cu'))
    layer.push(useLayer(element, layerIds.cu, classPrefix + 'cf', cfMaskId))
  }

  // add soldermask and silkscreen
  // silkscreen will not be added if no soldermask, because that's how it works in RL
  if (layerIds.sm) {
    // solder mask is... a mask, so mask it
    var smMaskId = idPrefix + 'sm-mask'
    var smMaskAttr = {id: smMaskId, fill: '#000', stroke: '#000'}
    var smMaskShape = [
      viewBox.rect(element, box, '', '#fff'),
      useLayer(element, layerIds.sm)
    ]

    defs.push(element('mask', smMaskAttr, smMaskShape))

    // add the layer that gets masked
    var smGroupAttr = {mask: 'url(#' + smMaskId + ')'}
    var smGroupShape = [viewBox.rect(element, box, classPrefix + 'sm', 'currentColor')]

    if (layerIds.ss) {
      smGroupShape.push(useLayer(element, layerIds.ss, classPrefix + 'ss'))
    }

    layer.push(element('g', smGroupAttr, smGroupShape))
  }

  // add solderpaste
  if (layerIds.sp) {
    layer.push(useLayer(element, layerIds.sp, classPrefix + 'sp'))
  }

  // add board outline if necessary
  if (mechs.out && !maskWithOutline) {
    layer.push(useLayer(element, mechIds.out, classPrefix + 'out'))
  }

  return {
    defs: defs,
    layer: layer,
    mechMaskId: mechMaskId,
    box: box,
    units: units
  }
}
