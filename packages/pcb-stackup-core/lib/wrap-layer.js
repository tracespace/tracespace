// wrap a layer in a group given the layer's converter object
'use strict'

module.exports = function wrapLayer(element, id, converter, scale, tag) {
  var layer = converter.layer
  var attr = {id: id}

  if (scale && scale !== 1) {
    attr.transform = 'scale(' + scale + ',' + scale + ')'
  }

  return element(tag || 'g', attr, layer)
}
