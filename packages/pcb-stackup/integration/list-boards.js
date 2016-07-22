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
    files = files.filter(function(file) {return !/LICENSE/.test(file)})
    BOARDS.push({
      name: board,
      maskWithOutline: true,
      layers: files.map(function(file) {return {path: 'boards/' + board + '/' + file}})
    })

    return done()
  }.bind(null, board))
})
