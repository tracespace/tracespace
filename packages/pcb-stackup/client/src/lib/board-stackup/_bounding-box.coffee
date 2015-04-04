# bounding box helper class for the stackup builder

class BoundingBox
  constructor: (viewBox) ->
    if viewBox?
      @xMin = viewBox[0]
      @yMin = viewBox[1]
      @xMax = viewBox[0] + viewBox[2]
      @yMax = viewBox[1] + viewBox[3]
    else
      @xMin = Infinity
      @yMin = Infinity
      @xMax = -Infinity
      @yMax = -Infinity

  # add another bounding box
  add: (bBox) ->
    if bBox.xMin < @xMin then @xMin = bBox.xMin
    if bBox.yMin < @yMin then @yMin = bBox.yMin
    if bBox.xMax > @xMax then @xMax = bBox.xMax
    if bBox.yMax > @yMax then @yMax = bBox.yMax
    # return self for chainability
    this

  # add a viewbox array
  addViewBox: (vBox) ->
    vxMax = vBox[2] + vBox[0]
    vyMax = vBox[3] + vBox[1]
    if vBox[0] < @xMin then @xMin = vBox[0]
    if vBox[1] < @yMin then @yMin = vBox[1]
    if vxMax > @xMax then @xMax = vxMax
    if vyMax > @yMax then @yMax = vyMax
    # return self for chainability
    this

  # returns the width of the bounding box
  width: ->
    if @xMin is Infinity or @xMax is -Infinity then 0 else @xMax - @xMin

  # returns the height of the bounding box
  height: ->
    if @yMin is Infinity or @yMax is -Infinity then 0 else @yMax - @yMin

  # returns and svg rect with the dimensions of the bounding box
  rect: (fill = 'currentColor') ->
    {
      rect: {
        x: @xMin
        y: @yMin
        width: @width()
        height: @height()
        fill: fill
      }
    }

module.exports = BoundingBox
