// generic file parser for gerber and drill files
'use strict'

var StringDecoder = require('string_decoder').StringDecoder
var inherits = require('inherits')
var Transform = require('readable-stream').Transform

var determineFiletype = require('./_determine-filetype')
var getNext = require('./get-next-block')
var parseGerber = require('./_parse-gerber')
var parseDrill = require('./_parse-drill')
var warning = require('./_warning')
var drillMode = require('./_drill-mode')

var LIMIT = 65535

var Parser = function(places, zero, filetype) {
  Transform.call(this, {readableObjectMode: true})

  // parser properties
  this._decoder = new StringDecoder('utf8')
  this._stash = ''
  this._index = 0
  this._drillMode = drillMode.DRILL
  this._drillStash = []
  this._syncResult = null
  this.line = 0
  this.format = {places: places, zero: zero, filetype: filetype}
}

inherits(Parser, Transform)

Parser.prototype._process = function(chunk, filetype) {
  while (this._index < chunk.length) {
    var next = getNext(filetype, chunk, this._index)
    this._index += next.read
    this.line += next.lines
    this._stash += next.rem

    if (next.block) {
      if (filetype === 'gerber') {
        parseGerber(this, next.block)
      } else {
        parseDrill.parse(this, next.block)
      }
    }
  }
}

Parser.prototype._transform = function(chunk, encoding, done) {
  var filetype = this.format.filetype

  // decode buffer to string
  chunk = this._decoder.write(chunk)

  // determine filetype within 65535 characters
  if (!filetype) {
    filetype = determineFiletype(chunk, this._index, LIMIT)
    this._index += chunk.length

    if (!filetype) {
      if (this._index >= LIMIT) {
        return done(new Error('unable to determine filetype'))
      }
      this._stash += chunk
      return done()
    } else {
      this.format.filetype = filetype
      this._index = 0
    }
  }

  chunk = this._stash + chunk
  this._stash = ''

  try {
    this._process(chunk, filetype)
    this._index = 0
    done()
  } catch (error) {
    done(error)
  }
}

Parser.prototype._flush = function(done) {
  if (this.format.filetype === 'drill') {
    parseDrill.flush(this)
  }

  return done && done()
}

Parser.prototype._push = function(data) {
  if (data.line === -1) {
    data.line = this.line
  }

  var pushTarget = !this._syncResult ? this : this._syncResult
  pushTarget.push(data)
}

Parser.prototype._warn = function(message) {
  this.emit('warning', warning(message, this.line))
}

Parser.prototype.parseSync = function(file) {
  var filetype = determineFiletype(file, this._index, 100 * LIMIT)
  this.format.filetype = filetype
  this._syncResult = []
  this._process(file, filetype)
  this._flush()

  return this._syncResult
}

module.exports = Parser
