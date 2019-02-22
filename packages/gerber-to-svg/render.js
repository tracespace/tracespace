// render a completed PlotterToSvg object
'use strict'

var xmlElementString = require('xml-element-string')

module.exports = function(converter, attr, createElement) {
  var element = createElement || xmlElementString

  var attributes = {
    version: '1.1',
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '0',
    'fill-rule': 'evenodd',
    width: converter.width + converter.units,
    height: converter.height + converter.units,
    viewBox: converter.viewBox.join(' '),
  }

  if (typeof attr === 'string') attr = {id: attr}

  Object.keys(attr || {}).forEach(function(key) {
    var value = attr[key]

    if (value != null) {
      attributes[key] = value
    }
  })

  var children = []

  if (converter.layer.length) {
    if (converter.defs.length) {
      children.push(element('defs', {}, converter.defs))
    }

    var yTranslate = converter.viewBox[3] + 2 * converter.viewBox[1]
    var transform = 'translate(0,' + yTranslate + ') scale(1,-1)'

    children.push(
      element(
        'g',
        {
          transform: transform,
          fill: 'currentColor',
          stroke: 'currentColor',
        },
        converter.layer
      )
    )
  }

  return element('svg', attributes, children)
}
