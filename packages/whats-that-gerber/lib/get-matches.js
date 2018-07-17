'use strict'

var extend = require('xtend')

var matchers = require('./matchers')

module.exports = function getMatches (filename) {
  return matchers.map(matcherToFileMatches).filter(Boolean)

  function matcherToFileMatches (matcher) {
    if (!matcher.match.test(filename)) return null
    return extend(matcher, {filename: filename})
  }
}
