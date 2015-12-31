// wrap a layer in a group given the layer's converter object
'use strict'

module.exports = function wrapLayer(id, converter, scale) {
  var layer = converter.layer
  var node = '<g id="' + id + '"'

  if (scale && (scale !== 1)) {
    node += ' transform="scale(' + scale + ',' + scale + ')"'
  }
  node += '>'

  return node + layer + '</g>'
}
