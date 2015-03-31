# function to gather the points of a path's d array
find = require 'lodash.find'
Point = require './_point'

gatherPoints = (data) ->
  # get the first point in the path, start the points array, and set up the loop
  firstPoint = new Point data[1], data[2]
  points = [firstPoint]
  index = 3
  # last point visited by the loop
  lastPoint = firstPoint
  # loop through all elements in the path data to get all the points
  while index < data.length
    command = data[index++]
    # if it's a close path, then make sure the adjacency gets set properly
    if command is 'Z'
      nextPoint = firstPoint
    else
      # set the arc properties if the segment is an arc
      if command is 'A'
        radius = data[index]
        largeArc = data[index + 3]
        sweep = data[index + 4]
        index += 5
      # get the next point in the path data and push it if necessary
      x = data[index]
      y = data[index + 1]
      nextPoint = find points, {x: x, y: y}
      unless nextPoint?
        nextPoint = new Point x, y
        points.push nextPoint
      index += 2
    # set adjacency unless the last segment was a moveTo (not a real segment)
    if command is 'M'
      # also, if it's a move, update the current subpath start in case of 'Z'
      firstPoint = nextPoint
    else
      lastPoint.addEdgeTo nextPoint, radius, largeArc, sweep
    # get ready for the next go around
    lastPoint = nextPoint

  points


module.exports = gatherPoints
