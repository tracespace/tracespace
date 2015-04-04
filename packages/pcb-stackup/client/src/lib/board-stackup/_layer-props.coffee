# function to get the viewbox scale, bbox, and units of a layer object

BoundingBox = require './_bounding-box'

layerProperties = (svgObj) ->
  props = {}
  # get the units
  props.units = svgObj.svg.width[-2..-1]
  # get the viewbox scale
  props.scale = parseFloat(svgObj.svg.width) / svgObj.svg.viewBox[2]
  # get the bounding box
  props.bBox = new BoundingBox svgObj.svg.viewBox
  # return the properties
  props

module.exports = layerProperties
