# given an array of individual layers, build images of the board
# stackup viewed from the top and the bottom

sortLayers = require './_sort-layers'
stackLayers = require './_stack-layers'

DEFAULT_SVG = (side, boardId) -> {
  svg: {
    xmlns: 'http://www.w3.org/2000/svg'
    version: '1.1'
    'xmlns:xlink': 'http://www.w3.org/1999/xlink'
    'stroke-width': '0'
    'stroke-linecap': 'round'
    'stroke-linejoin': 'round'
    width: '0'
    height: '0'
    id: "#{boardId}_#{side}"
  }
}

boardStackup = (allLayers = [], boardId = '') ->
  stackups = {
    top: DEFAULT_SVG 'top', boardId
    bottom: DEFAULT_SVG 'bottom', boardId
  }

  # start by sorting the layers out
  sorted = sortLayers allLayers, boardId

  # sorted has keys top and bottom, so work on both of them
  for side, val of sorted
    stack = stackLayers val, boardId
    defs = {defs: {_: stack.defs}}
    group = {g: {_: stack.group}}
    svg = stackups[side].svg
    bBox = stack.bBox
    xMin = bBox.xMin
    xMax = bBox.xMax
    yMin = bBox.yMin
    yMax = bBox.yMax
    # set the mech mask if it exists
    if stack.maskId? then group.g.mask = "url(##{stack.maskId})"
    # apply the transformation to the group
    xT = if side is 'top' then 0 else xMin + xMax
    yT = yMin + yMax
    xS = if side is 'top' then 1 else -1
    yS = -1
    group.g.transform = "translate(#{xT},#{yT}) scale(#{xS},#{yS})"
    # put the defs and group in the svg children array
    svg._ = [defs, group]
    # set the dimensions
    width = bBox.width()
    height = bBox.height()
    svg.width = "#{width * stack.scale}#{stack.units}"
    svg.height = "#{height * stack.scale}#{stack.units}"
    svg.viewBox = [xMin, yMin, width, height]

  # return
  stackups

module.exports = boardStackup
