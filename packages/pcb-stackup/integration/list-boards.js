'use strict'
var fs = require('fs')

var BOARDS = []
var boardFolders = fs.readdirSync(__dirname + '/boards')
var count = boardFolders.length

var done = function() {
  if (--count === 0) {
    fs.writeFileSync(__dirname + '/boards.json', JSON.stringify(BOARDS, null, 2))
  }
}

boardFolders.forEach(function(board) {
  fs.readdir(__dirname + '/boards/' + board, function(board, error, files) {
    if (error) {
      throw error
    }

    var dir = 'boards/' + board + '/'

    var options = {}
    var optionsExists = files.findIndex(function(file) {file === 'options.json'}) >= 0

    if (optionsExists) {
      options = require(__dirname + '/' + dir + 'options.json')
    }

    var layers = files.map(function(file) {
      var layerOptions
      if (options != null) {
        layerOptions = options.layers
      }
      return {path: dir + file, options: layerOptions}
    })

    BOARDS.push({
      name: board,
      maskWithOutline: true,
      layers: layers
    })

    return done()
  }.bind(null, board))
})
