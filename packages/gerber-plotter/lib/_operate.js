// operate the plotter
'use strict'

var boundingBox = require('./_box')

var HALF_PI = Math.PI / 2
var PI = Math.PI
var TWO_PI = Math.PI * 2
var THREE_HALF_PI = (3 * Math.PI) / 2

// flash operation
// returns a bounding box for the operation
var flash = function(coord, tool, region, plotter) {
  // no flashing allowed in region mode
  if (region) {
    plotter._warn('flash in region ignored')
    return boundingBox.new()
  }

  // warn if tool was not defined
  if (!tool) {
    plotter._warn('flash with unknown tool ignored')
    return boundingBox.new()
  }

  // push the pad shape if needed
  if (!tool.flashed) {
    tool.flashed = true
    plotter.push({type: 'shape', tool: tool.code, shape: tool.pad})
  }

  plotter.push({type: 'pad', tool: tool.code, x: coord[0], y: coord[1]})
  return boundingBox.translate(tool.box, coord)
}

// given a start, end, direction, arc quadrant mode, and list of potential centers, find the
// angles of the start and end points, the sweep angle, and the center
var findCenterAndAngles = function(start, end, mode, arc, centers) {
  var thetaStart
  var thetaEnd
  var sweep
  var candidate
  var center
  while (center == null && centers.length > 0) {
    candidate = centers.pop()
    thetaStart = Math.atan2(start[1] - candidate[1], start[0] - candidate[0])
    thetaEnd = Math.atan2(end[1] - candidate[1], end[0] - candidate[0])

    // in clockwise mode, ensure the start is greater than the end and check the sweep
    // do the opposite for counter-clockwise
    if (mode === 'cw') {
      thetaStart = thetaStart >= thetaEnd ? thetaStart : thetaStart + TWO_PI
    } else {
      thetaEnd = thetaEnd >= thetaStart ? thetaEnd : thetaEnd + TWO_PI
    }

    sweep = Math.abs(thetaStart - thetaEnd)

    // in single quadrant mode, the center is only valid if the sweep is less than 90 degrees
    // in multiquandrant mode there's only one candidate; we're within spec to assume it's good
    if (arc === 's') {
      if (sweep <= HALF_PI) {
        center = candidate
      }
    } else {
      center = candidate
    }
  }

  if (center == null) {
    return undefined
  }

  // ensure the thetas are [0, TWO_PI)
  thetaStart = thetaStart >= 0 ? thetaStart : thetaStart + TWO_PI
  thetaStart = thetaStart < TWO_PI ? thetaStart : thetaStart - TWO_PI
  thetaEnd = thetaEnd >= 0 ? thetaEnd : thetaEnd + TWO_PI
  thetaEnd = thetaEnd < TWO_PI ? thetaEnd : thetaEnd - TWO_PI

  return {
    center: center,
    sweep: sweep,
    start: start.concat(thetaStart),
    end: end.concat(thetaEnd),
  }
}

var arcBox = function(cenAndAngles, r, region, tool, dir) {
  var startPoint = cenAndAngles.start
  var endPoint = cenAndAngles.end
  var center = cenAndAngles.center
  var sweep = cenAndAngles.sweep

  var start
  var end

  // normalize direction to counter-clockwise
  if (dir === 'cw') {
    start = endPoint[2]
    end = startPoint[2]
  } else {
    start = startPoint[2]
    end = endPoint[2]
  }

  // get bounding box definition points
  var points = [startPoint, endPoint]

  // check for sweep past 0 degrees
  if (start > end || sweep === TWO_PI) {
    points.push([center[0] + r, center[1]])
  }

  // rotate to check for sweep past 90 degrees
  start = start >= HALF_PI ? start - HALF_PI : start + THREE_HALF_PI
  end = end >= HALF_PI ? end - HALF_PI : end + THREE_HALF_PI
  if (start > end || sweep === TWO_PI) {
    points.push([center[0], center[1] + r])
  }

  // rotate again to check for sweep past 180 degrees
  start = start >= HALF_PI ? start - HALF_PI : start + THREE_HALF_PI
  end = end >= HALF_PI ? end - HALF_PI : end + THREE_HALF_PI
  if (start > end || sweep === TWO_PI) {
    points.push([center[0] - r, center[1]])
  }

  // rotate again to check for sweep past 270 degrees
  start = start >= HALF_PI ? start - HALF_PI : start + THREE_HALF_PI
  end = end >= HALF_PI ? end - HALF_PI : end + THREE_HALF_PI
  if (start > end || sweep === TWO_PI) {
    points.push([center[0], center[1] - r])
  }

  return points.reduce(function(result, m) {
    if (!region) {
      var mBox = boundingBox.translate(tool.box, m)
      return boundingBox.add(result, mBox)
    }

    return boundingBox.addPoint(result, m)
  }, boundingBox.new())
}

var roundToZero = function(number, epsilon) {
  return number >= epsilon ? number : 0
}

// find the center of an arc given its endpoints and its radius
// assume the arc is <= 180 degress
// thank you this guy: http://math.stackexchange.com/a/87912
var arcCenterFromRadius = function(start, end, mode, epsilon, radius) {
  var sign = mode === 'ccw' ? 1 : -1
  var xAve = (start[0] + end[0]) / 2
  var yAve = (start[1] + end[1]) / 2
  var deltaX = end[0] - start[1]
  var deltaY = end[1] - start[1]
  var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
  var halfDistance = distance / 2
  var squareDifference = Math.sqrt(
    Math.pow(radius, 2) - Math.pow(halfDistance, 2)
  )
  var xOffset = (-sign * deltaY * squareDifference) / distance
  var yOffset = (sign * deltaX * squareDifference) / distance

  return [
    [
      roundToZero(xAve + xOffset, epsilon),
      roundToZero(yAve + yOffset, epsilon),
    ],
  ]
}

var drawArc = function(
  start,
  end,
  offset,
  tool,
  mode,
  arc,
  region,
  epsilon,
  pathGraph,
  plotter
) {
  // get the radius of the arc from the offsets
  var r =
    offset[2] || Math.sqrt(Math.pow(offset[0], 2) + Math.pow(offset[1], 2))

  // potential candidates for the arc center
  // in single quadrant mode, all offset signs are implicit, so we need to check a few
  var candidates = []
  var xCandidates = []
  var yCandidates = []

  if (offset[0] && arc === 's') {
    xCandidates.push(start[0] + offset[0], start[0] - offset[0])
  } else {
    xCandidates.push(start[0] + offset[0])
  }

  if (offset[1] && arc === 's') {
    yCandidates.push(start[1] + offset[1], start[1] - offset[1])
  } else {
    yCandidates.push(start[1] + offset[1])
  }

  for (var i = 0; i < xCandidates.length; i++) {
    for (var j = 0; j < yCandidates.length; j++) {
      candidates.push([xCandidates[i], yCandidates[j]])
    }
  }

  // find valid centers by comparing the distance to start and end for equality with the radius
  var validCenters
  if (offset[2]) {
    arc = 'm'
    validCenters = arcCenterFromRadius(start, end, mode, epsilon, offset[2])
  } else if (arc === 's') {
    validCenters = candidates.filter(function(c) {
      var startDist = Math.sqrt(
        Math.pow(c[0] - start[0], 2) + Math.pow(c[1] - start[1], 2)
      )
      var endDist = Math.sqrt(
        Math.pow(c[0] - end[0], 2) + Math.pow(c[1] - end[1], 2)
      )

      return (
        Math.abs(startDist - r) <= epsilon && Math.abs(endDist - r) <= epsilon
      )
    })
  } else {
    validCenters = candidates
  }

  var cenAndAngles = findCenterAndAngles(start, end, mode, arc, validCenters)

  // edge case: matching start and end in multi quadrant mode is a full circle
  if (arc === 'm' && start[0] === end[0] && start[1] === end[1]) {
    cenAndAngles.sweep = TWO_PI
  }

  var box = boundingBox.new()
  if (cenAndAngles != null) {
    pathGraph.add({
      type: 'arc',
      start: cenAndAngles.start,
      end: cenAndAngles.end,
      center: cenAndAngles.center,
      sweep: cenAndAngles.sweep,
      radius: r,
      dir: mode,
    })

    box = arcBox(cenAndAngles, r, region, tool, mode)
  } else {
    plotter._warn('skipping impossible arc')
  }

  return box
}

var drawLine = function(start, end, tool, region, pathGraph) {
  pathGraph.add({type: 'line', start: start, end: end})

  if (!region) {
    var startBox = boundingBox.translate(tool.box, start)
    var endBox = boundingBox.translate(tool.box, end)
    return boundingBox.add(startBox, endBox)
  }

  var box = boundingBox.new()
  box = boundingBox.addPoint(box, start)
  box = boundingBox.addPoint(box, end)
  return box
}

// interpolate a rectangle and emit the fill immdeiately
var interpolateRect = function(start, end, tool, pathGraph, plotter) {
  var hWidth = tool.trace[0] / 2
  var hHeight = tool.trace[1] / 2
  var theta = Math.atan2(end[1] - start[1], end[0] - start[0])

  var sXMin = start[0] - hWidth
  var sXMax = start[0] + hWidth
  var sYMin = start[1] - hHeight
  var sYMax = start[1] + hHeight
  var eXMin = end[0] - hWidth
  var eXMax = end[0] + hWidth
  var eYMin = end[1] - hHeight
  var eYMax = end[1] + hHeight

  var points = []

  // no movement
  if (start[0] === end[0] && start[1] === end[1]) {
    points.push([sXMin, sYMin], [sXMax, sYMin], [sXMax, sYMax], [sXMin, sYMax])
  } else if (theta >= 0 && theta < HALF_PI) {
    // first quadrant move
    points.push(
      [sXMin, sYMin],
      [sXMax, sYMin],
      [eXMax, eYMin],
      [eXMax, eYMax],
      [eXMin, eYMax],
      [sXMin, sYMax]
    )
  } else if (theta >= HALF_PI && theta <= PI) {
    // second quadrant move
    points.push(
      [sXMax, sYMin],
      [sXMax, sYMax],
      [eXMax, eYMax],
      [eXMin, eYMax],
      [eXMin, eYMin],
      [sXMin, sYMin]
    )
  } else if (theta >= -PI && theta < -HALF_PI) {
    // third quadrant move
    points.push(
      [sXMax, sYMax],
      [sXMin, sYMax],
      [eXMin, eYMax],
      [eXMin, eYMin],
      [eXMax, eYMin],
      [sXMax, sYMin]
    )
  } else {
    // fourth quadrant move
    points.push(
      [sXMin, sYMax],
      [sXMin, sYMin],
      [eXMin, eYMin],
      [eXMax, eYMin],
      [eXMax, eYMax],
      [sXMax, sYMax]
    )
  }

  points.forEach(function(p, i) {
    var j = i < points.length - 1 ? i + 1 : 0
    pathGraph.add({type: 'line', start: p, end: points[j]})
  })

  plotter._finishPath()

  return boundingBox.add(
    boundingBox.translate(tool.box, start),
    boundingBox.translate(tool.box, end)
  )
}

// interpolate operation
// returns a bounding box for the operation
var interpolate = function(
  start,
  end,
  offset,
  tool,
  mode,
  arc,
  region,
  epsilon,
  pathGraph,
  plotter
) {
  var strokableTool = region || (tool && tool.trace.length > 0)
  var arcableTool = region || (tool && tool.trace.length === 1)
  var toolCode = tool ? tool.code : '[NO TOOL SET]'

  if (!strokableTool) {
    plotter._warn(
      'tool ' + toolCode + ' is not strokable; ignoring interpolate'
    )

    return boundingBox.new()
  }

  if (mode === 'i') {
    // add a line to the path normally if region mode is on or the tool is a circle
    if (region || tool.trace.length === 1) {
      return drawLine(start, end, tool, region, pathGraph)
    }

    // else, the tool is a rectangle, which needs a special interpolation function
    return interpolateRect(start, end, tool, pathGraph, plotter)
  }

  // else, make sure we're allowed to be drawing an arc, then draw an arc
  if (!arcableTool) {
    plotter._warn(
      'cannot draw arc with non-circular tool ' +
        toolCode +
        '; ignoring interpolate'
    )
    return boundingBox.new()
  }

  return drawArc(
    start,
    end,
    offset,
    tool,
    mode,
    arc,
    region,
    epsilon,
    pathGraph,
    plotter
  )
}

// takes the start point, the op type, the op coords, the tool, and the push function
// returns the new plotter position
var operate = function(
  type,
  coord,
  start,
  tool,
  mode,
  arc,
  region,
  pathGraph,
  epsilon,
  plotter
) {
  var end = [
    coord.x != null ? coord.x : start[0],
    coord.y != null ? coord.y : start[1],
  ]

  var offset = [
    coord.i != null ? coord.i : 0,
    coord.j != null ? coord.j : 0,
    coord.a,
  ]

  var box
  switch (type) {
    case 'flash':
      box = flash(end, tool, region, plotter)
      break

    case 'int':
      box = interpolate(
        start,
        end,
        offset,
        tool,
        mode,
        arc,
        region,
        epsilon,
        pathGraph,
        plotter
      )
      break

    default:
      box = boundingBox.new()
      break
  }

  return {
    pos: end,
    box: box,
  }
}

module.exports = operate
