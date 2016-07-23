// utilities to create a graph of path segments and traverse that graph
'use strict'

var fill = require('lodash.fill')

var MAX_GAP = 0.00011

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

var distance = function(point, target) {
  return Math.sqrt(Math.pow(point[0] - target[0], 2) + Math.pow(point[1] - target[1], 2))
}

var pointsEqual = function(point, target, fillGaps) {
  if (!fillGaps) {
    return ((point[0] === target[0]) && (point[1] === target[1]))
  }

  return (distance(point, target) < fillGaps)
}

var lineSegmentsEqual = function(segment, target) {
  return (
    (segment.type === 'line') &&
    (
      (pointsEqual(segment.start, target.start) && pointsEqual(segment.end, target.end)) ||
      (pointsEqual(segment.start, target.end) && pointsEqual(segment.end, target.start))))
}

var reverseSegment = function(segment) {
  var reversed = {type: segment.type, start: segment.end, end: segment.start}

  if (segment.type === 'arc') {
    reversed.center = segment.center
    reversed.radius = segment.radius
    reversed.sweep = segment.sweep
    reversed.dir = (segment.dir === 'cw') ? 'ccw' : 'cw'
  }

  return reversed
}

var PathGraph = function(optimize, fillGaps) {
  this._points = []
  this._edges = []
  this._optimize = optimize
  this._fillGaps = (fillGaps === true)
    ? MAX_GAP
    : fillGaps

  this.length = 0
}

PathGraph.prototype.add = function(newSeg) {
  var start
  var end
  var fillGaps = this._fillGaps

  if (this._optimize) {
    start = find(this._points, function(point) {
      return pointsEqual(point.position, newSeg.start, fillGaps)
    })

    end = find(this._points, function(point) {
      return pointsEqual(point.position, newSeg.end, fillGaps)
    })

    end = find(this._points, function(point) {
      return pointsEqual(point.position, newSeg.end, fillGaps)
    })
  }

  var startAndEndExist = (start && end)

  if (!start) {
    start = {position: newSeg.start, edges: []}
    this._points.push(start)
  }
  else if (fillGaps) {
    newSeg.start = start.position
  }

  if (!end) {
    end = {position: newSeg.end, edges: []}
    this._points.push(end)
  }
  else if (fillGaps) {
    newSeg.end = end.position
  }

  // if optimizing, do not allow duplicate line segments
  if (startAndEndExist) {
    var edges = this._edges
    var existing = find(start.edges.concat(end.edges), function(edge) {
      return lineSegmentsEqual(edges[edge].segment, newSeg)
    })

    if (existing != null) {
      return
    }
  }

  var newEdgeIndex = this._edges.length
  var edge = {segment: newSeg, start: start, end: end}

  this._edges.push(edge)
  this.length++

  end.edges.push(newEdgeIndex)
  start.edges.push(newEdgeIndex)
}

PathGraph.prototype.traverse = function() {
  if (!this._optimize) {
    return this._edges.map(function(edge) {
      return edge.segment
    })
  }

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
        }
        else {
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
