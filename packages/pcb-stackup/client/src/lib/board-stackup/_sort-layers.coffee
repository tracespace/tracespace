# sort the layers into top and bottom layers and gather the defs

find = require 'lodash.find'
result = require 'lodash.result'

TOP_LAYERS_RE = /^(t)|(out)/
BOT_LAYERS_RE = /^(b)|(out)/
DRL_LAYERS_RE = /^drl$/

sortLayers = (layers, boardId) ->
  topLayers = []
  topDefs = []
  bottomLayers = []
  bottomDefs = []
  drillLayer = {type: 'drl', id: "#{boardId}_drl", _: []}
  for ly in layers
    type = ly.type
    group = result find(ly.svg.svg._, 'g'), 'g'
    defs = result find(ly.svg.svg._, 'defs'), 'defs', {_: []}
    # drill files are special because there might be more than one drill file
    # and they need to be consolidated
    if type is 'drl'
      drillLayer._ = drillLayer._.concat group._
      topDefs = topDefs.concat defs._
      bottomDefs = bottomDefs.concat defs._
    # else let's go about our business assuming the layer is singular
    else
      id = "#{boardId}_#{type}"
      layer = {type: type, id: id, _: group._}
      if TOP_LAYERS_RE.test type
        topLayers.push layer
        topDefs = topDefs.concat defs._
      if BOT_LAYERS_RE.test ly.type
        bottomLayers.push layer
        bottomDefs = bottomDefs.concat defs._

  # after the loop drops out, push the consolidated drill to top and bottom
  topLayers.push drillLayer
  bottomLayers.push drillLayer

  # return
  {
    topLayers: topLayers
    topDefs: topDefs
    bottomLayers: bottomLayers
    bottomDefs: bottomDefs
  }

module.exports = sortLayers
