// simple warning class to be emitted when something questionable in the gerber is found
'use strict'

var warning = function(message, line) {
  return {message: message, line: line}
}

module.exports = warning
