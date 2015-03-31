# function to get the viewbox scale and units of a layer object

layerProperties = (svgObj) ->
  props = {}
  # get the units
  props.units = svgObj.svg.width[-2..-1]
  # get the viewbox scale
  props.scale = parseFloat(svgObj.svg.width) / svgObj.svg.viewBox[2]
  # return the properties
  props

module.exports = layerProperties
