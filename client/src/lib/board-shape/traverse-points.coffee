# given an aray of point objects, traverses them in order and spits out the
# path data
remove = require 'lodash.remove'

traversePoints = (points) ->
  # start the path off
  path = []
  pathStart = points?[0]
  nextPoint = pathStart
  newPath = true
  # loop over all points in the path
  while points?.length
    if newPath
      path.push 'M', nextPoint.x, nextPoint.y
      newPath = false
    draw = nextPoint.drawToAdjacent()
    lastPoint = nextPoint
    nextPoint = draw.point
    # special case: if the draw is a line to the pathStart, use a closePath
    if nextPoint is pathStart and draw.path[0] isnt 'A'
      draw.path = ['Z']
      newPath = true
    # if the starting point has no more adjacent points, it's safe to remove
    # it from the points array
    if lastPoint.edges.length is 0 then remove points, lastPoint
    # if the next point has no more adjacent points, we've hit the end of this
    # particular loop
    if nextPoint.edges.length is 0
      remove points, nextPoint
      nextPoint = points[0]
      newPath = true
    # finally, concatinate the draw to the path data
    path = path.concat draw.path

  path

module.exports = traversePoints
