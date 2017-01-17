'use strict'

var fs = require('fs')
var path = require('path')
var pcbStackup = require('../index')

var gerberPaths = [
  '../integration/boards/arduino-uno/arduino-uno.cmp',
  '../integration/boards/arduino-uno/arduino-uno.drd',
  '../integration/boards/arduino-uno/arduino-uno.gko',
  '../integration/boards/arduino-uno/arduino-uno.plc',
  '../integration/boards/arduino-uno/arduino-uno.sol',
  '../integration/boards/arduino-uno/arduino-uno.stc',
  '../integration/boards/arduino-uno/arduino-uno.sts'
]

var layers = gerberPaths.map(function (gerberPath) {
  var filename = path.join(__dirname, gerberPath)
  var gerber = fs.createReadStream(filename)

  return {filename: filename, gerber: gerber}
})

pcbStackup(layers, function (error, stackup) {
  if (error) {
    throw error
  }

  var topOut = path.join(__dirname, './arduino-top.svg')
  var bottomOut = path.join(__dirname, './arduino-bottom.svg')

  fs.writeFileSync(topOut, stackup.top.svg)
  fs.writeFileSync(bottomOut, stackup.bottom.svg)
})
