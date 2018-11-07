// utilities to create a graph of path segments and traverse that graph
'use strict'

var fill = require('lodash.fill')

var find = function(collection, condition) {
  var element
  var i

  for (i = 0; i < collection.length; i++) {
    element = collection[i]

    if (condition(element)) {
      return element
    }
  }
}

var findClosest = function(points, position, fillGaps) {
  var result = points.reduce(
    function(prev, point) {
      var d = distance(position, point.position)
      if (d < fillGaps && d < prev.distance) {
        return {point: point, distance: d}
      }
      return prev
    },
    {point: undefined, distance: Infinity}
  )

  return result.point
}

var distance = function(point, target) {
  return Math.sqrt(
    Math.pow(point[0] - target[0], 2) + Math.pow(point[1] - target[1], 2)
  )
}

var pointsEqual = function(point, target) {
  return point[0] === target[0] && point[1] === target[1]
}

var lineSegmentsEqual = function(segment, target) {
  return (
    segment.type === 'line' &&
    ((pointsEqual(segment.start, target.start) &&
      pointsEqual(segment.end, target.end)) ||
      (pointsEqual(segment.start, target.end) &&
        pointsEqual(segment.end, target.start)))
  )
}

var reverseSegment = function(segment) {
  var reversed = {type: segment.type, start: segment.end, end: segment.start}

  if (segment.type === 'arc') {
    reversed.center = segment.center
    reversed.radius = segment.radius
    reversed.sweep = segment.sweep
    reversed.dir = segment.dir === 'cw' ? 'ccw' : 'cw'
  }

  return reversed
}

var PathGraph = function(optimize, fillGaps) {
  this._edges = []
  this._optimize = optimize
  this._fillGaps = fillGaps
  this.length = 0
}

PathGraph.prototype.add = function(newSeg) {
  var edge = {segment: newSeg, start: newSeg.start, end: newSeg.end}
  this._edges.push(edge)
  this.length++
}

PathGraph.prototype._fillGapsAndOptimize = function() {
  var newSegs = this._edges.map(function(x) {
    return x.segment
  })
  this._edges = []
  this.length = 0
  var points = newSegs.reduce(function(prev, seg) {
    return prev.concat([
      {position: seg.start, edges: []},
      {position: seg.end, edges: []},
    ])
  }, [])

  var len = newSegs.length
  for (var i = 0; i < len; i++) {
    var newSeg = newSegs[i]
    var start
    var end
    var fillGaps = this._fillGaps

    var startIndex = i * 2
    var endIndex = startIndex + 1

    var otherPoints = points
      .slice(0, startIndex)
      .concat(points.slice(endIndex + 1))

    start = findClosest(otherPoints, newSeg.start, fillGaps)
    end = findClosest(otherPoints, newSeg.end, fillGaps)

    if (!start) {
      start = {position: newSeg.start, edges: []}
    } else if (fillGaps) {
      newSeg.start = start.position
    }

    if (!end) {
      end = {position: newSeg.end, edges: []}
    } else if (fillGaps) {
      newSeg.end = end.position
    }

    // do not allow duplicate line segments
    var existing = find(this._edges, function(edge) {
      return lineSegmentsEqual(edge.segment, newSeg)
    })

    if (!existing) {
      var newEdgeIndex = this._edges.length
      var edge = {segment: newSeg, start: start, end: end}

      points[startIndex].edges.push(newEdgeIndex)
      points[startIndex].position = edge.start.position
      points[endIndex].edges.push(newEdgeIndex)
      points[endIndex].position = edge.end.position

      this._edges.push(edge)
      this.length++
    }
  }

  // consolidate all the connecting edges to prepare for a depth first
  // traversal. depth first traversal is used so that when converted to an SVG
  // path it retains its shape. see discussion:
  // https://github.com/mcous/gerber-plotter/pull/13
  this._edges.forEach(function(edge) {
    points.forEach(function(point) {
      if (pointsEqual(point.position, edge.start.position)) {
        edge.start.edges = edge.start.edges.concat(point.edges)
      }
      if (pointsEqual(point.position, edge.end.position)) {
        edge.end.edges = edge.end.edges.concat(point.edges)
      }
    })
  })
}

PathGraph.prototype.traverse = function() {
  if (!this._optimize) {
    return this._edges.map(function(edge) {
      return edge.segment
    })
  }

  this._fillGapsAndOptimize()

  var walked = fill(Array(this._edges.length), false)
  var discovered = []
  var result = []

  var current
  var currentEdge
  var currentEnd
  var currentSegment
  var lastEnd = {position: []}

  while (result.length < this._edges.length) {
    current = walked.indexOf(false)
    discovered.push(current)

    while (discovered.length) {
      current = discovered.pop()

      if (!walked[current]) {
        walked[current] = true
        currentEdge = this._edges[current]
        currentEnd = currentEdge.end

        // reverse segment if necessary
        if (pointsEqual(lastEnd.position, currentEnd.position)) {
          currentSegment = reverseSegment(currentEdge.segment)
          lastEnd = currentEdge.start
        } else {
          currentSegment = currentEdge.segment
          lastEnd = currentEdge.end
        }

        // add non-walked adjacent nodes to the discovered stack
        lastEnd.edges.reverse().forEach(function(seg) {
          if (!walked[seg]) {
            discovered.push(seg)
          }
        })

        result.push(currentSegment)
      }
    }
  }

  return result
}

module.exports = PathGraph
