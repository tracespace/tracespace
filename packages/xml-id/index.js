// xml id utilities
'use strict'

// subset of characters that are XML ID, CSS identifier, and URL friendly
var START_CHAR = '_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
var CHAR = '-0123456789' + START_CHAR
var REPLACE_RE = new RegExp('^[^' + START_CHAR + ']|[^\\' + CHAR + ']', 'g')

var DEFAULT_RANDOM_LENGTH = 12

module.exports = {
  random: random,
  sanitize: sanitize,
  ensure: ensure,
}

function random(length) {
  length = length || DEFAULT_RANDOM_LENGTH
  return _getRandomString(1, START_CHAR) + _getRandomString(length - 1, CHAR)
}

function sanitize(source) {
  return source.replace(REPLACE_RE, '_')
}

function ensure(maybeId, length) {
  return typeof maybeId === 'string' ? sanitize(maybeId) : random(length)
}

function _getRandomString(length, alphabet) {
  var abLength = alphabet.length
  var result = ''

  while (length > 0) {
    length--
    result += alphabet[Math.floor(Math.random() * abLength)]
  }

  return result
}
