//simpler API main function
'use strict'

module.exports = function(layers, optionsOrCallback, callback) {
  var options
  if (typeof optionsOrCallback === 'object') {
    options = optionsOrCallback
  } else if (typeof optionsOrCallback === 'function') {
    callback = optionsOrCallback
  }
  callback(false, true)
}
