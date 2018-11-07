// function to generate a board style node
'use strict'
var colorString = require('color-string')

module.exports = function boardStyle(element, prefix, side, layerColors) {
  var colors = {
    fr4: '#666',
    cu: '#ccc',
    cf: '#c93',
    sm: 'rgba(00, 66, 00, 0.75)',
    ss: '#fff',
    sp: '#999',
    out: '#000',
  }

  Object.keys(layerColors || {}).forEach(function(type) {
    colors[type] = layerColors[type]
  })

  var colorClass = function(layer) {
    var style = 'color: ' + colors[layer] + ';'

    // convert rgba to hex and opacity for inkscape compatibility
    if (/rgba/.test(colors[layer])) {
      var rgba = colorString.get.rgb(colors[layer])

      if (rgba) {
        var hex = colorString.to.hex(rgba).slice(0, 7)

        style = 'color: ' + hex + '; opacity: ' + rgba[3] + ';'
      }
    }

    return '.' + prefix + layer + ' {' + style + '}'
  }

  var styles = [
    colorClass('fr4'),
    colorClass('cu'),
    colorClass('cf'),
    colorClass('sm'),
    colorClass('ss'),
    colorClass('sp'),
    colorClass('out'),
  ]

  var stylesString = styles.join('\n')

  return element('style', {}, [stylesString])
}
