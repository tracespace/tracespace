// function to generate a board style node
'use strict'

var defaults = require('lodash.defaults')

var DEFAULT_COLORS = {
  fr4: '#666',
  cu: '#ccc',
  cf: '#c93',
  sm: 'rgba(00, 66, 00, 0.75)',
  ss: '#fff',
  sp: '#999',
  out: '#000'
}

module.exports = function boardStyle(prefix, side, layerColors, outMask) {
  var colors = defaults((layerColors || {}), DEFAULT_COLORS)

  var colorClass = function(layer) {
    var style = 'color: ' + colors[layer] + ';'
    return '.' + prefix + layer + ' {' + style + '}'
  }

  var styles = [
    colorClass('fr4'),
    colorClass('cu'),
    colorClass('cf'),
    colorClass('sm'),
    colorClass('ss'),
    colorClass('sp'),
    colorClass('out')
  ]

  if (outMask) {
    styles.push('#' + prefix + side + '_out path {fill: #fff; stroke-width: 0;}')
  }

  return '<style>/* <![CDATA[ */' + styles.join('\n') + '/* ]]> */</style>'
}
