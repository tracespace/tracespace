// create an xml node string
'use strict'

var escapeHtml = require('escape-html')

module.exports = function createXmlString(tag, attributes, children) {
  attributes = attributes || {}
  children = children || []

  var start = '<' + tag

  var middle = Object.keys(attributes).reduce(function(result, key) {
    var value = attributes[key]
    var attr = (value != null)
      ? (' ' + key + '="' + escapeHtml(value) + '"')
      : ''

    return result + attr
  }, '')

  var end = (children.length)
    ? '>' + children.join('') + '</' + tag + '>'
    : '/>'

  return start + middle + end
}
