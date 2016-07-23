// client for the integration tests
'use strict'

var xhr = require('xhr')
var template = require('lodash.template')
var domify = require('domify')

var BOARDS = require('./boards.json')

var boardTemplate = template([
  '<div class="board">',
  '<h3><%= name %><small> outline mask: <%= mask %></small></h3>',
  '<div class="side">',
  '<h4>top</h4>',
  '<div data-hook="top"> loading </div>',
  '<div> <a class="save_top" style="visibility:hidden" href="data:image/svg+xml;base64," href-lang="image/svg+xml"> save to file </a> </div>',
  '</div>',
  '<div class="side">',
  '<h4>bottom</h4>',
  '<div data-hook="bottom"> loading </div>',
  '<div> <a class="save_bottom" style="visibility:hidden" href="data:image/svg+xml;base64," href-lang="image/svg+xml"> save to file </a> </div>',
  '</div>',
  '</div>'
].join(''))

var boardsContainer = document.getElementById('boards')

BOARDS.forEach(function(board) {
  var name = board.name
  var mask = board.options.maskWithOutline
  var boardContainer = domify(boardTemplate({name: name, mask: mask}))
  var topContainer = boardContainer.querySelector('[data-hook=top]')
  var bottomContainer = boardContainer.querySelector('[data-hook=bottom]')

  boardsContainer.appendChild(boardContainer)

  xhr.post({
    uri: '/stackup',
    json: board
  }, function(error, response, body) {
    var top = 'failed'
    var bottom = 'failed'

    if (error) {
      console.error(error.message)
    }
    else if (response.statusCode !== 200) {
      console.error('Received status code: ' + response.statusCode)
    }
    else {
      top =  body.top.svg
      bottom = body.bottom.svg
    }


    topContainer.innerHTML = top
    bottomContainer.innerHTML = bottom

    var a_top = boardContainer.querySelector('a.save_top')
    var a_bottom = boardContainer.querySelector('a.save_bottom')

    a_top.href += window.btoa(top)
    a_bottom.href += window.btoa(bottom)
    a_top.download = name + '_top.svg'
    a_bottom.download = name + '_bottom.svg'
    a_top.style = 'visibility:visible'
    a_bottom.style = 'visibility:visible'

  })
})
