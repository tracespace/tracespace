# point helper class for the board shape builder
find = require 'lodash.find'
remove = require 'lodash.remove'

class Point
  constructor: (@x, @y) -> @adjPoints = []

  # assert that a point is adjacent to another point
  adjacentTo: (point, radius, largeArc, sweep) ->
    @addToAdjacent point, radius, largeArc, sweep
    point.addToAdjacent this, radius, largeArc, (if sweep is 1 then 0 else 1)

  # add a object to the adjacent array provided it is not already in there
  addToAdjacent: (point, r, lg, s) ->
    unless find @adjPoints, {point: point}
      pointObj = {point: point}
      if r?
        pointObj.radius = r
        pointObj.largeArc = lg
        pointObj.sweep = s
      @adjPoints.push pointObj

  # return the segment in path form to the next point
  drawToAdjacent: ->
    start = this
    adj = start.adjPoints.pop()
    end = adj.point
    remove end.adjPoints, (adj) -> adj.point is start
    if adj.radius?
      ['A', adj.radius, adj.radius, 0, adj.largeArc, adj.sweep, end.x, end.y]
    else
      ['L', end.x, end.y]

module.exports = Point
