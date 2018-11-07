// simple warning
'use strict'

var warning = function(message, line) {
  return {message: message, line: line}
}

module.exports = warning
