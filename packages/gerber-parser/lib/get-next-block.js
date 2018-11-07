// function for getting the next block of the chunk
// returns {next: '_', read: [chars read], lines: [lines read]}
'use strict'

var getNext = function(type, chunk, start) {
  if (type !== 'gerber' && type !== 'drill') {
    throw new Error('filetype to get next block must be "drill" or "gerber"')
  }

  // parsing constants
  var limit = chunk.length - start
  var split = type === 'gerber' ? '*' : '\n'
  var param = type === 'gerber' ? '%' : ''

  // search flags
  var splitFound = false
  var paramStarted = false
  var paramFound = false
  var blockFound = false

  // chunk results
  var found = []
  var read = 0
  var lines = 0

  while (!blockFound && read < limit) {
    var c = chunk[start + read]

    // count newlines
    if (c === '\n') {
      lines++
    }

    // check for a param start or end
    if (c === param) {
      if (!paramStarted) {
        paramStarted = true
        found.push(c)
      } else {
        paramFound = true
        found.pop()
      }
    } else if (c === split) {
      splitFound = true
      if (paramStarted) {
        found.push(c)
      }
    } else if (c >= ' ' && c <= '~') {
      found.push(c)
    }

    read++
    blockFound = splitFound && (!paramStarted || paramFound)
  }

  var block = blockFound ? found.join('').trim() : ''
  var rem = !blockFound ? found.join('') : ''
  return {lines: lines, read: read, block: block, rem: rem}
}

module.exports = getNext
