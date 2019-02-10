// parse options from input
'use strict'

var boardColor = require('./board-color')
var xid = require('@tracespace/xml-id')
var xmlElementString = require('xml-element-string')

module.exports = function parseOptions(input) {
  if (typeof input === 'string') {
    input = {id: input}
  } else if (!input) {
    input = {}
  }

  return {
    id: xid.ensure(input.id),
    color: boardColor.getColor(input.color),
    attributes: input.attributes || {},
    useOutline: input.useOutline != null ? input.useOutline : true,
    createElement: input.createElement || xmlElementString,
  }
}
