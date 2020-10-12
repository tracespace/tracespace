// returns a pad shape array given a tool definition
'use strict'

var isFunction = require('lodash.isfunction')
var isFinite = require('lodash.isfinite')

var boundingBox = require('./_box')

var roundToPrecision = function(number) {
  var rounded = Math.round(number * 100000000) / 100000000
  // remove -0 for ease
  if (rounded === 0) {
    return 0
  }
  return rounded
}

var degreesToRadians = function(degrees) {
  return (degrees * Math.PI) / 180
}

var rotatePointAboutOrigin = function(point, rot) {
  rot = degreesToRadians(rot)
  var sin = Math.sin(rot)
  var cos = Math.cos(rot)
  var x = point[0]
  var y = point[1]

  return [
    roundToPrecision(x * cos - y * sin),
    roundToPrecision(x * sin + y * cos),
  ]
}

var circle = function(dia, cx, cy, rot) {
  var r = dia / 2
  cx = cx || 0
  cy = cy || 0

  // rotate cx and cy if necessary
  if (rot && (cx || cy)) {
    var rotatedCenter = rotatePointAboutOrigin([cx, cy], rot)
    cx = rotatedCenter[0]
    cy = rotatedCenter[1]
  }

  return {
    shape: {type: 'circle', cx: cx, cy: cy, r: dia / 2},
    box: boundingBox.addCircle(boundingBox.new(), r, cx, cy),
  }
}

var vect = function(x1, y1, x2, y2, width, rot) {
  // rotate the endpoints if necessary
  if (rot) {
    var start = rotatePointAboutOrigin([x1, y1], rot)
    var end = rotatePointAboutOrigin([x2, y2], rot)
    x1 = start[0]
    y1 = start[1]
    x2 = end[0]
    y2 = end[1]
  }

  var m = (y2 - y1) / (x2 - x1)
  var hWidth = width / 2
  var sin = hWidth
  var cos = hWidth
  if (isFinite(m)) {
    sin *= m / Math.sqrt(1 + Math.pow(m, 2))
    cos *= 1 / Math.sqrt(1 + Math.pow(m, 2))
  } else {
    cos = 0
  }

  // add all four corners to the ponts array and the box
  var points = []
  points.push([roundToPrecision(x1 + sin), roundToPrecision(y1 - cos)])
  points.push([roundToPrecision(x2 + sin), roundToPrecision(y2 - cos)])
  points.push([roundToPrecision(x2 - sin), roundToPrecision(y2 + cos)])
  points.push([roundToPrecision(x1 - sin), roundToPrecision(y1 + cos)])

  var box = points.reduce(function(result, p) {
    return boundingBox.addPoint(result, p)
  }, boundingBox.new())

  return {
    shape: {type: 'poly', points: points},
    box: box,
  }
}

var rect = function(width, height, r, cx, cy, rot) {
  cx = cx || 0
  cy = cy || 0
  r = r || 0
  rot = rot || 0

  var hWidth = width / 2
  var hHeight = height / 2

  if (rot) {
    var x1 = cx - hWidth
    var x2 = cx + hWidth
    var y1 = cy
    var y2 = cy

    return vect(x1, y1, x2, y2, height, rot)
  }

  return {
    shape: {type: 'rect', cx: cx, cy: cy, r: r, width: width, height: height},
    box: [-hWidth + cx, -hHeight + cy, hWidth + cx, hHeight + cy],
  }
}

var outlinePolygon = function(flatPoints, rot) {
  var points = []
  var box = boundingBox.new()
  var point
  for (var i = 0; i < flatPoints.length - 2; i += 2) {
    point = [flatPoints[i], flatPoints[i + 1]]
    if (rot) {
      point = rotatePointAboutOrigin(point, rot)
    }

    points.push(point)
    box = boundingBox.addPoint(box, point)
  }

  return {
    shape: {type: 'poly', points: points},
    box: box,
  }
}

var regularPolygon = function(dia, nPoints, rot, cx, cy) {
  cx = cx || 0
  cy = cy || 0

  var points = []
  var box = boundingBox.new()

  var r = dia / 2
  var offset = (rot * Math.PI) / 180
  var step = (2 * Math.PI) / nPoints
  var theta
  var x
  var y
  for (var n = 0; n < nPoints; n++) {
    theta = step * n + offset
    x = cx + roundToPrecision(r * Math.cos(theta))
    y = cy + roundToPrecision(r * Math.sin(theta))

    box = boundingBox.addPoint(box, [x, y])
    points.push([x, y])
  }

  return {
    shape: {type: 'poly', points: points},
    box: box,
  }
}

// just returns a ring object, does not return a box
var ring = function(cx, cy, r, width) {
  return {type: 'ring', cx: cx, cy: cy, r: r, width: width}
}

var moire = function(
  dia,
  ringThx,
  ringGap,
  maxRings,
  crossThx,
  crossLen,
  cx,
  cy,
  rot
) {
  var r = dia / 2
  var shape = []
  var box = boundingBox.addCircle(boundingBox.new(), r, cx, cy)
  var halfThx = ringThx / 2
  var gapAndHalfThx = ringGap + halfThx

  // add rings
  while (r > ringThx && shape.length < maxRings) {
    r -= halfThx
    shape.push(ring(cx, cy, roundToPrecision(r), ringThx))
    r -= gapAndHalfThx
  }

  // add a circle if necessary
  if (r > 0 && shape.length < maxRings) {
    shape.push(circle(roundToPrecision(2 * r), cx, cy).shape)
  }

  // add cross hairs
  var horCross = rect(crossLen, crossThx, 0, cx, cy, rot)
  var verCross = rect(crossThx, crossLen, 0, cx, cy, rot)
  shape.push(horCross.shape)
  shape.push(verCross.shape)
  box = boundingBox.add(box, horCross.box)
  box = boundingBox.add(box, verCross.box)

  return {shape: shape, box: box}
}

var thermal = function(cx, cy, outerDia, innerDia, gap, rot) {
  var side = roundToPrecision((outerDia - gap) / 2)
  var offset = roundToPrecision((outerDia + gap) / 4)
  var width = roundToPrecision((outerDia - innerDia) / 2)
  var r = roundToPrecision((outerDia - width) / 2)
  var box = boundingBox.addCircle(boundingBox.new(), outerDia / 2, cx, cy)

  var rects = [
    rect(side, side, 0, cx + offset, cy + offset, rot).shape,
    rect(side, side, 0, cx - offset, cy + offset, rot).shape,
    rect(side, side, 0, cx - offset, cy - offset, rot).shape,
    rect(side, side, 0, cx + offset, cy - offset, rot).shape,
  ]
  var clip = ring(cx, cy, r, width)

  return {
    shape: {type: 'clip', shape: rects, clip: clip},
    box: box,
  }
}

var runMacro = function(mods, blocks) {
  var emptyMacro = {shape: [], box: boundingBox.new()}
  var exposure = 1

  blocks = blocks || []

  return blocks.reduce(function(result, block) {
    var shapeAndBox

    if (block.type !== 'variable' && block.type !== 'comment') {
      block = Object.keys(block).reduce(function(result, key) {
        var value = block[key]
        result[key] = resolveValue(value)
        return result

        function resolveValue(v) {
          if (Array.isArray(v)) {
            return v.map(resolveValue)
          } else if (isFunction(v)) {
            return v(mods)
          } else {
            return v
          }
        }
      }, {})
    }

    if (block.exp != null && block.exp !== exposure) {
      result.shape.push({
        type: 'layer',
        polarity: block.exp === 1 ? 'dark' : 'clear',
        box: result.box.slice(0),
      })
      exposure = block.exp
    }

    switch (block.type) {
      case 'circle':
        shapeAndBox = circle(block.dia, block.cx, block.cy, block.rot)
        break

      case 'vect':
        shapeAndBox = vect(
          block.x1,
          block.y1,
          block.x2,
          block.y2,
          block.width,
          block.rot
        )
        break

      case 'rect':
        shapeAndBox = rect(
          block.width,
          block.height,
          0,
          block.cx,
          block.cy,
          block.rot
        )
        break

      case 'rectLL':
        var hHeight = block.height / 2
        var hWidth = block.width / 2
        var cx = block.x + hWidth
        var cy = block.y + hHeight
        shapeAndBox = rect(block.width, block.height, 0, cx, cy, block.rot)
        break

      case 'outline':
        shapeAndBox = outlinePolygon(block.points, block.rot)
        break

      case 'poly':
        shapeAndBox = regularPolygon(
          block.dia,
          block.vertices,
          block.rot,
          block.cx,
          block.cy
        )
        break

      case 'moire':
        shapeAndBox = moire(
          block.dia,
          block.ringThx,
          block.ringGap,
          block.maxRings,
          block.crossThx,
          block.crossLen,
          block.cx,
          block.cy,
          block.rot
        )
        break

      case 'thermal':
        shapeAndBox = thermal(
          block.cx,
          block.cy,
          block.outerDia,
          block.innerDia,
          block.gap,
          block.rot
        )
        break

      case 'variable':
        mods = block.set(mods)
        return result

      default:
        return result
    }

    result.shape = result.shape.concat(shapeAndBox.shape)

    // only change the box if the exposure is creating an image
    if (exposure === 1) {
      result.box = boundingBox.add(result.box, shapeAndBox.box)
    }

    return result
  }, emptyMacro)
}

module.exports = function padShape(tool, macros) {
  var shape = []
  var box = boundingBox.new()
  var toolShape = tool.shape
  var params = tool.params
  var holeShape
  var shapeAndBox

  if (toolShape === 'circle') {
    shapeAndBox = circle(params[0])
  } else if (toolShape === 'rect') {
    shapeAndBox = rect(params[0], params[1])
  } else if (toolShape === 'obround') {
    shapeAndBox = rect(params[0], params[1], Math.min(params[0], params[1]) / 2)
  } else if (toolShape === 'poly') {
    shapeAndBox = regularPolygon(params[0], params[1], params[2])
  } else {
    // else we got a macro, so run the macro and return
    var mods = params.reduce(function(result, val, index) {
      result['$' + (index + 1)] = val

      return result
    }, {})

    return runMacro(mods, macros[toolShape])
  }

  // if we didn't return, we have a standard tool, so carry on accordingly
  shape.push(shapeAndBox.shape)
  box = boundingBox.add(box, shapeAndBox.box)

  if (tool.hole.length) {
    holeShape =
      tool.hole.length === 1
        ? circle(tool.hole[0]).shape
        : rect(tool.hole[0], tool.hole[1]).shape

    shape.push({type: 'layer', polarity: 'clear', box: box}, holeShape)
  }

  return {shape: shape, box: box}
}
