# sort the layers into top and bottom layers and gather the defs

find = require 'lodash.find'
result = require 'lodash.result'
layerProps = require './_layer-props'

TOP_LAYERS_RE = /^(t)|(out)/
BOT_LAYERS_RE = /^(b)|(out)/
DRL_LAYERS_RE = /^drl$/

# get a more generic layer type
genericType = (type) ->
  if type isnt 'out' and type isnt 'drl' then type[1..] else type

sortLayers = (layers, boardId) ->
  topLayers = {}
  topDefs = []
  bottomLayers = {}
  bottomDefs = []
  drillLayerGroup = []
  drillLayerProps = null
  for ly in layers
    svg = ly.svg
    children = svg.svg._
    type = ly.type
    props = layerProps svg
    gType = genericType type
    group = result find(children, 'g'), 'g', {_: []}
    defs = result find(children, 'defs'), 'defs', {_: []}
    # drill files are special because there might be more than one drill file
    # and they need to be consolidated
    if type is 'drl'
      drillLayerGroup = drillLayerGroup.concat group._
      topDefs = topDefs.concat defs._
      bottomDefs = bottomDefs.concat defs._
      if drillLayerProps?
        drillLayerProps.bBox.add props.bBox
      else
        drillLayerProps = props
    # else let's go about our business assuming the layer is singular
    else
      if TOP_LAYERS_RE.test type
        topLayers[gType] = {
          id: "#{boardId}-top-#{gType}", _: group._, props: props
        }
        topDefs = topDefs.concat defs._
      if BOT_LAYERS_RE.test ly.type
        bottomLayers[gType] = {
          id: "#{boardId}-bottom-#{gType}", _: group._, props: props
        }
        bottomDefs = bottomDefs.concat defs._

  # after the loop drops out, push the consolidated drill to top and bottom
  topLayers.drl = {
    id: "#{boardId}-top-drl", _: drillLayerGroup, props: drillLayerProps
  }
  bottomLayers.drl = {
    id: "#{boardId}-bottom-drl", _: drillLayerGroup, props: drillLayerProps
  }

  # return
  {
    topLayers: topLayers
    topDefs: topDefs
    bottomLayers: bottomLayers
    bottomDefs: bottomDefs
  }

module.exports = sortLayers
