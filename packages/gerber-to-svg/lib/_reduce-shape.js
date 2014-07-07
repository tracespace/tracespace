// reduce a shape array into a string to place is defs
'use strict'

var reduce = require('lodash.reduce')

var util = require('./_util')
var shift = util.shift
var xmlNode = util.xmlNode
var startMask = util.startMask
var maskLayer = util.maskLayer

var circle = function(id, cx, cy, r, width) {
  width = (width != null) ? shift(width) : null
  var fill = (width != null) ? 'none' : null

  return xmlNode('circle', true, {
    id: id,
    cx: shift(cx),
    cy: shift(cy),
    r: shift(r),
    'stroke-width': width,
    fill: fill
  })
}

var rect = function(id, cx, cy, r, width, height) {
  r = (r) ? shift(r) : null

  return xmlNode('rect', true, {
    id: id,
    x: shift(cx - width / 2),
    y: shift(cy - height / 2),
    rx: r,
    ry: r,
    width: shift(width),
    height: shift(height)
  })
}

var polyPoints = function(result, point, i, points) {
  var pointString = shift(point[0]) + ',' + shift(point[1])
  return (result + pointString + ((i < (points.length - 1)) ? ' ' : ''))
}

var poly = function(id, points) {
  return xmlNode('polygon', true, {id: id, points: reduce(points, polyPoints, '')})
}

var clip = function(id, shapes, ring) {
  var maskId = id + '_mask'
  var maskUrl = 'url(#' + maskId + ')'
  var mask = xmlNode('mask', false, {id: maskId, stroke: '#fff'})
  mask += circle(null, ring.cx, ring.cy, ring.r, ring.width) + '</mask>'

  var group = reduce(shapes, function(result, shape) {
    if (shape.type === 'rect') {
      return (result + rect(null, shape.cx, shape.cy, shape.r, shape.width, shape.height))
    }

    return (result + poly(null, shape.points))
  }, xmlNode('g', false, {id: id, mask: maskUrl}))

  return mask + group + '</g>'
}

var reduceShapeArray = function(prefix, code, shapeArray) {
  var id = prefix + '_pad-' + code
  var maskIdPrefix = id + '_'
  var start = ''
  var end = ''

  if (shapeArray.length > 1) {
    start = xmlNode('g', false, {id: id})
    end = '</g>'
    id = null
  }

  var image = reduce(shapeArray, function(result, shape) {
    var svg

    switch (shape.type) {
      case 'circle':
        svg = circle(id, shape.cx, shape.cy, shape.r)
        break

      case 'ring':
        svg = circle(id, shape.cx, shape.cy, shape.r, shape.width)
        break

      case 'rect':
        svg = rect(id, shape.cx, shape.cy, shape.r, shape.width, shape.height)
        break

      case 'poly':
        svg = poly(id, shape.points)
        break

      case 'clip':
        svg = clip(id, shape.shape, shape.clip)
        break

      case 'layer':
        result.count++
        result.last = shape.polarity
        // if the polarity is clear, wrap the group and start a mask
        if (shape.polarity === 'clear') {
          var nextMaskId = maskIdPrefix + result.count
          result.masks += startMask(nextMaskId, shape.box)
          result.layers = maskLayer(nextMaskId, result.layers)
        }
        else {
          result.masks += '</mask>'
        }
        return result
    }

    if (result.last === 'dark') {
      result.layers += svg
    }
    else {
      result.masks += svg
    }

    return result
  }, {count: 0, last: 'dark', layers: '', masks: ''})

  if (image.last === 'clear') {
    image.masks += '</mask>'
  }

  return image.masks + start + image.layers + end
}

module.exports = reduceShapeArray
