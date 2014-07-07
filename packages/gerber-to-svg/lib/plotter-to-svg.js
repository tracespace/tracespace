// transform stream to take plotter objects and convert them to an SVG string
'use strict'

var Transform = require('readable-stream').Transform
var inherits = require('inherits')
var every = require('lodash.every')
var isFinite = require('lodash.isfinite')
var map = require('lodash.map')

var reduceShapeArray = require('./_reduce-shape')
var flashPad = require('./_flash-pad')
var createPath = require('./_create-path')
var util = require('./_util')
var shift = util.shift
var xmlNode = util.xmlNode
var maskLayer = util.maskLayer
var startMask = util.startMask

var BLOCK_MODE_OFF = 0
var BLOCK_MODE_DARK = 1
var BLOCK_MODE_CLEAR = 2

var PlotterToSvg = function(id, className, color) {
  Transform.call(this, {writableObjectMode: true})

  this.defs = ''
  this.layer = ''
  this.viewBox = [0, 0, 0, 0]
  this.width = 0
  this.height = 0
  this.units = ''

  this._mask = ''
  this._blockMode = false
  this._blockBox = []
  this._block = ''
  this._blockCount = 0
  this._blockLayerCount = 0
  this._offsets = []
  this._clearCount = 0
  this._lastLayer = 0
  this._blockCount = 0
  this._id = id
  this._className = className
  this._color = color
}

inherits(PlotterToSvg, Transform)

PlotterToSvg.prototype._transform = function(chunk, encoding, done) {
  switch (chunk.type) {
    case 'shape':
      this.defs += reduceShapeArray(this._id, chunk.tool, chunk.shape)
      break

    case 'pad':
      this._draw(flashPad(this._id, chunk.tool, chunk.x, chunk.y))
      break

    case 'fill':
      this._draw(createPath(chunk.path))
      break

    case 'stroke':
      this._draw(createPath(chunk.path, chunk.width))
      break

    case 'polarity':
      this._handleNewPolarity(chunk.polarity, chunk.box)
      break

    case 'repeat':
      this._handleNewRepeat(chunk.offsets, chunk.box)
      break

    case 'size':
      this._handleSize(chunk.box, chunk.units)
  }

  done()
}

PlotterToSvg.prototype._flush = function(done) {
  var result = xmlNode('svg', false, {
    id: this._id,
    class: this._className,
    xmlns: 'http://www.w3.org/2000/svg',
    version: 1.1,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 0,
    'fill-rule': 'evenodd',
    color: this._color,
    width: this.width + this.units,
    height: this.height + this.units,
    viewBox: this.viewBox.join(' ')
  })

  // shut off step repeat finish any in-progress clear layer and/or repeat
  this._handleNewRepeat([])

  // add the defs
  if (this.defs) {
    result += '<defs>' + this.defs + '</defs>'
  }

  // add the layer
  if (this.layer) {
    var yTranslate = this.viewBox[3] + 2 * this.viewBox[1]
    var transform = 'translate(0,' + yTranslate + ') scale(1,-1)'

    result += xmlNode('g', false, {
      transform: transform,
      fill: 'currentColor',
      stroke: 'currentColor'
    })
    result += this.layer + '</g>'
  }

  result += '</svg>'
  this.push(result)
  done()
}

PlotterToSvg.prototype._finishBlockLayer = function() {
  // if there's a block, wrap it up, give it an id, and repeat it
  if (this._block) {
    this._blockLayerCount++

    var blockLayerId = this._id + '_block-' + this._blockCount + '-' + this._blockLayerCount
    this.defs += xmlNode('g', false, {id: blockLayerId}) + this._block + '</g>'

    this._block = ''
  }
}

PlotterToSvg.prototype._finishClearLayer = function() {
  if (this._mask) {
    this.defs += this._mask + '</mask>'
    this._mask = ''
    return true
  }

  return false
}

PlotterToSvg.prototype._handleNewPolarity = function(polarity, box) {
  if (this._blockMode) {
    if ((this._blockLayerCount === 0) && (this._block === '')) {
      this._blockMode = (polarity === 'dark') ? BLOCK_MODE_DARK : BLOCK_MODE_CLEAR
    }
    return this._finishBlockLayer()
  }

  this._clearCount = (polarity === 'clear') ? this._clearCount + 1 : this._clearCount
  var maskId = this._id + '_clear-' + this._clearCount

  // if clear polarity, wrap the layer and start a mask
  if (polarity === 'clear') {
    this.layer = maskLayer(maskId, this.layer)
    this._mask = startMask(maskId, box)
  }
  // else, finish the mask and add it to the defs
  else {
    this._finishClearLayer(box)
  }
}

PlotterToSvg.prototype._handleNewRepeat = function(offsets, box) {
  var endOfBlock = (offsets.length === 0)

  // finish any in progress clear layer and block layer
  var wasClear = this._finishClearLayer()
  this._finishBlockLayer()

  var blockMode = this._blockMode
  var blockLayers = this._blockLayerCount
  var blockIdStart = this._id + '_block-' + this._blockCount + '-'

  // add dark layers to layer
  this.layer += map(this._offsets, function(offset) {
    var result = ''
    for (var i = blockMode; i <= blockLayers; i += 2) {
      result += xmlNode('use', true, {
        'xlink:href': '#' + blockIdStart + i,
        x: shift(offset[0]),
        y: shift(offset[1])
      })
    }

    return result
  }).join('')

  // if there are clear layers in the block, mask the layer with them
  if (blockLayers > (2 - blockMode)) {
    var maskId = blockIdStart + 'clear'
    this.layer = maskLayer(maskId, this.layer)
    this._mask = startMask(maskId, this._blockBox)
    this._mask += map(this._offsets, function(offset) {
      var result = ''
      var isDark
      for (var i = 1; i <= blockLayers; i++) {
        isDark = (blockMode === BLOCK_MODE_DARK) ? ((i % 2) === 1) : ((i % 2) === 0)
        result += xmlNode('use', true, {
          'xlink:href': '#' + blockIdStart + i,
          x: shift(offset[0]),
          y: shift(offset[1]),
          fill: isDark ? '#fff' : null,
          stroke: isDark ? '#fff' : null
        })
      }

      return result
    }).join('')
    wasClear = this._finishClearLayer()
  }

  // save the offsets
  this._offsets = offsets
  if (!endOfBlock) {
    this._blockMode = (!wasClear) ? BLOCK_MODE_DARK : BLOCK_MODE_CLEAR
    this._blockCount++
    this._blockLayerCount = 0
    this._blockBox = every(box, isFinite) ? box : [0, 0, 0, 0]
  }
  else {
    this._blockMode = BLOCK_MODE_OFF
  }
}

PlotterToSvg.prototype._handleSize = function(box, units) {
  if (every(box, isFinite)) {
    var x = shift(box[0])
    var y = shift(box[1])
    var width = shift(box[2] - box[0])
    var height = shift(box[3] - box[1])

    this.viewBox = [x, y, width, height]
    this.width = (width / 1000)
    this.height = (height / 1000)
    this.units = units
  }
}

PlotterToSvg.prototype._draw = function(object) {
  if (!this._blockMode) {
    if (!this._mask) {
      this.layer += object
    }
    else {
      this._mask += object
    }
  }
  else {
    this._block += object
  }
}

module.exports = PlotterToSvg
