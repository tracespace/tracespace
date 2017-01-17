'use strict'
var fs = require('fs')
var glob = require('glob')
var path = require('path')

var BOARDS = []
var boardFolders = glob.sync(path.join(__dirname, 'boards', '*/'))
var count = boardFolders.length

var done = function () {
  if (--count === 0) {
    fs.writeFileSync(path.join(__dirname, 'boards.json'), JSON.stringify(BOARDS, null, 2))
  }
}

boardFolders.forEach(function (dir) {
  glob(path.join(dir, '*'), {}, function (dir, error, files) {
    if (error) {
      throw error
    }

    var board = path.basename(dir)
    var options = {}
    var optionsExists = files.findIndex(function (f) { return path.basename(f) === 'options.json' }) >= 0

    if (optionsExists) {
      options = require(path.join(dir, 'options.json'))
    }

    var layers = files.map(function (file) {
      var layerOptions

      if (options != null && options.layers != null) {
        layerOptions = options.layers[path.basename(file)]
      }

      return {path: file, options: layerOptions}
    })

    if (options != null) {
      delete options.layers
    }

    BOARDS.push({
      name: board,
      options: options,
      layers: layers
    })

    return done()
  }.bind(null, dir))
})
