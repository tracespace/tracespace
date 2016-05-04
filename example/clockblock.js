'use strict'

var fs = require('fs')
var path = require('path')
var async = require('async')
var shortId = require('shortid')
var gerberToSvg = require('gerber-to-svg')
var whatsThatGerber = require('whats-that-gerber')
var pcbStackup = require('../lib')

var gerberPaths = [
  '../integration/boards/clockblock/clockblock-F_Cu.gbr',
  '../integration/boards/clockblock/clockblock-F_Mask.gbr',
  '../integration/boards/clockblock/clockblock-F_SilkS.gbr',
  '../integration/boards/clockblock/clockblock-F_Paste.gbr',
  '../integration/boards/clockblock/clockblock-B_Cu.gbr',
  '../integration/boards/clockblock/clockblock-B_Mask.gbr',
  '../integration/boards/clockblock/clockblock-B_SilkS.gbr',
  '../integration/boards/clockblock/clockblock-Edge_Cuts.gbr',
  '../integration/boards/clockblock/clockblock.drl'
].map(function(gerberPath) {
  return path.join(__dirname, gerberPath)
})

// asynchronously map a gerber filename to a layer object expected by pcbStackup
var mapFilenameToLayerObject = function(filename, done) {
  var gerber = fs.createReadStream(filename, 'utf-8')
  var type = whatsThatGerber(filename)
  var converterOptions = {
    id: shortId.generate(),
    plotAsOutline: type.id === 'out'
  }

  var converter = gerberToSvg(gerber, converterOptions, function(error) {
    if (error) {
      console.warn(filename + ' failed to convert') // eslint-disable-line
      return done()
    }

    done(null, {type: type, converter: converter})
  })
}

// pass an array of layer objects to pcbStackup and write the stackup results
var handleLayers = function(error, layers) {
  if (error) {
    return console.error('Unexpected error converting gerbers') // eslint-disable-line
  }

  var stackupOptions = {
    id: 'clockblock',
    maskWithOutline: true,
    color: {
      fr4: '#666',
      cu: '#ccc',
      cf: '#c93',
      sm: 'rgba(0, 66, 0, 0.75)',
      ss: '#fff',
      sp: '#999',
      out: '#000'
    }
  }

  var stackup = pcbStackup(layers.filter(Boolean), stackupOptions)
  fs.writeFileSync(path.join(__dirname, './clockblock-top.svg'), stackup.top)
  fs.writeFileSync(path.join(__dirname, './clockblock-bottom.svg'), stackup.bottom)
}

// map the gerber files to layer objects, then pass them to pcbStackup
async.map(gerberPaths, mapFilenameToLayerObject, handleLayers)
