// create a path from a fill or stroke object
'use strict'

var util = require('./_util')
var shift = util.shift

var pointsEqual = function(point, target) {
  return point[0] === target[0] && point[1] === target[1]
}

var move = function(start) {
  return 'M ' + shift(start[0]) + ' ' + shift(start[1])
}

var line = function(lastCmd, end) {
  var cmd = lastCmd === 'L' || lastCmd === 'M' ? '' : 'L '

  return cmd + shift(end[0]) + ' ' + shift(end[1])
}

var arc = function(lastCmd, radius, sweep, dir, end, center) {
  // add zero-length arcs as zero-length lines to render properly across all browsers
  if (sweep === 0) {
    return line(lastCmd, end)
  }

  // full-circle arcs must be rendered as two separate arcs
  if (sweep === 2 * Math.PI) {
    var half = [2 * center[0] - end[0], 2 * center[1] - end[1]]

    var arc1 = arc(lastCmd, radius, Math.PI, dir, half, center)
    var arc2 = arc('A', radius, Math.PI, dir, end, center)

    return arc1 + ' ' + arc2
  }

  var result = lastCmd === 'A' ? '' : 'A '

  radius = shift(radius)
  result += radius + ' ' + radius + ' 0 '
  result += sweep > Math.PI ? '1 ' : '0 '
  result += dir === 'ccw' ? '1 ' : '0 '
  result += shift(end[0]) + ' ' + shift(end[1])

  return result
}

var reduceSegments = function(result, segment) {
  var type = segment.type
  var start = segment.start
  var end = segment.end

  if (!pointsEqual(result.last, start)) {
    result.data += (result.data ? ' ' : '') + move(start)
    result.lastCmd = 'M'
  }

  result.data += ' '
  if (type === 'line') {
    result.data += line(result.lastCmd, end)
    result.lastCmd = 'L'
  } else {
    result.data += arc(
      result.lastCmd,
      segment.radius,
      segment.sweep,
      segment.dir,
      end,
      segment.center
    )

    result.lastCmd = 'A'
  }

  result.last = end

  return result
}

module.exports = function createPath(segments, width, element) {
  var pathData = segments.reduce(reduceSegments, {last: [], data: ''}).data
  var attr = {d: pathData}

  if (width != null) {
    attr.fill = 'none'
    attr['stroke-width'] = shift(width)
  }

  return element('path', attr)
}
