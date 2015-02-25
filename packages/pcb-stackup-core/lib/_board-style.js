// function to generate a board style node
'use strict'

module.exports = function boardStyle(element, prefix, side, layerColors, outMask) {
  var colors = {
    fr4: '#666',
    cu: '#ccc',
    cf: '#c93',
    sm: 'rgba(00, 66, 00, 0.75)',
    ss: '#fff',
    sp: '#999',
    out: '#000'
  }

  Object.keys(layerColors || {}).forEach(function(type) {
    colors[type] = layerColors[type]
  })

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

  var stylesString = '/* <![CDATA[ */' + styles.join('\n') + '/* ]]> */'

  return element('style', {}, [stylesString])
}
