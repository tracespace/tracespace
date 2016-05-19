// render a completed PlotterToSvg object
'use strict'

var xmlNode = require('./_util').xmlNode

module.exports = function renderConverter(converter, id, className, color) {
  var result = []

  result.push(xmlNode('svg', false, {
    id: id,
    class: className,
    xmlns: 'http://www.w3.org/2000/svg',
    version: 1.1,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 0,
    'fill-rule': 'evenodd',
    color: color,
    width: converter.width + converter.units,
    height: converter.height + converter.units,
    viewBox: converter.viewBox.join(' ')
  }))

  if (converter.defs) {
    result.push('<defs>' + converter.defs + '</defs>')
  }

  if (converter.layer) {
    var yTranslate = converter.viewBox[3] + 2 * converter.viewBox[1]
    var transform = 'translate(0,' + yTranslate + ') scale(1,-1)'

    result.push(xmlNode('g', false, {
      transform: transform,
      fill: 'currentColor',
      stroke: 'currentColor'
    }) + converter.layer + '</g>')
  }

  result.push('</svg>')

  return result.join('')
}
