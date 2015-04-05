# given an array of individual layers, build images of the board
# stackup viewed from the top and the bottom

sortLayers = require './_sort-layers'

DEFAULT_SVG = -> {
  svg: {
    xmlns: 'http://www.w3.org/2000/svg'
    version: '1.1'
    'xmlns:xlink': 'http://www.w3.org/1999/xlink'
    width: 0
    height: 0
  }
}

boardStackup = (allLayers = [], board) ->
  stackups = {
    top: DEFAULT_SVG()
    bottom: DEFAULT_SVG()
  }

  # start by sorting the layers out
  sorted = sortLayers allLayers, board

  # sorted has keys top and bottom, so work on both of them
  # for side, stack of sorted

  # return
  stackups

module.exports = boardStackup
