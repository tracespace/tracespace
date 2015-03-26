# point helper class for the board shape builder
find = require 'lodash.find'
remove = require 'lodash.remove'

class Point
  constructor: (@x, @y) -> @edges = []

  # assert that a point is adjacent to another point
  addEdgeTo: (point, radius, largeArc, sweep) ->
    @addToAdjacent point, radius, largeArc, sweep
    point.addToAdjacent this, radius, largeArc, (if sweep is 1 then 0 else 1)

  # add a object to the adjacent array provided it is not already in there
  addToAdjacent: (point, r, lg, s) ->
    edgeObj = {point: point}
    if r?
      edgeObj.radius = r
      edgeObj.largeArc = lg
      edgeObj.sweep = s
    unless find @edges, edgeObj then @edges.push edgeObj

  # return the segment in path form to the next point
  drawToAdjacent: ->
    start = this
    # pop the last edge off the edges array
    edge = start.edges.pop()
    a = edge.point
    if edge.radius?
      path = [
        'A', edge.radius, edge.radius, 0, edge.largeArc, edge.sweep, a.x, a.y
      ]
    else
      path = ['L', a.x, a.y]
    # also make sure the coresponding edge is removed from the end point
    edge.point = start
    if edge.sweep? then edge.sweep = (if edge.sweep is 1 then 0 else 1)
    remove a.edges, edge
    # return the adjacent point and the path data
    {point: a, path: path}

module.exports = Point
