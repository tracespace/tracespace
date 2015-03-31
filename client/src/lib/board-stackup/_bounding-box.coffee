# bounding box helper class for the stackup builder

class BoundingBox
  constructor: ->
    @xMin = Infinity
    @xMax = -Infinity
    @yMin = Infinity
    @yMax = -Infinity

  addViewBox: (vBox) ->
    vxMax = vBox[2] + vBox[0]
    vyMax = vBox[3] + vBox[1]
    if vBox[0] < @xMin then @xMin = vBox[0]
    if vBox[1] < @yMin then @yMin = vBox[1]
    if vxMax > @xMax then @xMax = vxMax
    if vyMax > @yMax then @yMax = vyMax

  width: ->
    if @xMin is Infinity or @xMax is -Infinity then 0 else @xMax - @xMin

  height: ->
    if @yMin is Infinity or @yMax is -Infinity then 0 else @yMax - @yMin

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
