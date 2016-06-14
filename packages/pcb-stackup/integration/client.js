// client for the integration tests
'use strict'

var xhr = require('xhr')
var template = require('lodash.template')
var domify = require('domify')

var boardTemplate = template([
  '<div class="board">',
  '<h3><%= name %><small> outline mask: <%= mask %></small></h3>',
  '<div class="side">',
  '<h4>top</h4>',
  '<div data-hook="top"> loading </div>',
  '</div>',
  '<div class="side">',
  '<h4>bottom</h4>',
  '<div data-hook="bottom"> loading </div>',
  '</div>',
  '</div>'
].join(''))

var BOARDS = [
  {
    name: 'clockblock',
    maskWithOutline: true,
    layers: [
      {path: 'boards/clockblock/clockblock-F_Cu.gbr'},
      {path: 'boards/clockblock/clockblock-F_Mask.gbr'},
      {path: 'boards/clockblock/clockblock-F_SilkS.gbr'},
      {path: 'boards/clockblock/clockblock-F_Paste.gbr'},
      {path: 'boards/clockblock/clockblock-B_Cu.gbr'},
      {path: 'boards/clockblock/clockblock-B_Mask.gbr'},
      {path: 'boards/clockblock/clockblock-B_SilkS.gbr'},
      {path: 'boards/clockblock/clockblock-Edge_Cuts.gbr'},
      {path: 'boards/clockblock/clockblock-NPTH.drl'},
      {path: 'boards/clockblock/clockblock.drl'}
    ]
  },
  {
    name: 'mchck',
    maskWithOutline: true,
    layers: [
      {path: 'boards/mchck/mchck-F_Cu.pho'},
      {path: 'boards/mchck/mchck-F_Mask.pho'},
      {path: 'boards/mchck/mchck-F_SilkS.pho'},
      {path: 'boards/mchck/mchck-B_Cu.pho'},
      {path: 'boards/mchck/mchck-B_Mask.pho'},
      {path: 'boards/mchck/mchck-B_SilkS.pho'},
      {path: 'boards/mchck/mchck-Edge_Cuts.pho'},
      {path: 'boards/mchck/mchck.drl'}
    ]
  },
  {
    name: 'freeduino',
    maskWithOutline: true,
    layers: [
      {path: 'boards/freeduino/freeduino.cmp'},
      {path: 'boards/freeduino/freeduino.stc'},
      {path: 'boards/freeduino/freeduino.plc'},
      {path: 'boards/freeduino/freeduino.sol'},
      {path: 'boards/freeduino/freeduino.sts'},
      {path: 'boards/freeduino/freeduino.drd'}
    ]
  },
  {
    name: 'core',
    maskWithOutline: true,
    layers: [
      {id: 'core-tcu', path: 'boards/core/core.GTL'},
      {id: 'core-tsm', path: 'boards/core/core.GTS'},
      {id: 'core-tss', path: 'boards/core/core.GTO'},
      {id: 'core-tsp', path: 'boards/core/core.GTP'},
      {id: 'core-bcu', path: 'boards/core/core.GBL'},
      {id: 'core-bsm', path: 'boards/core/core.GBS'},
      {id: 'core-bss', path: 'boards/core/core.GBO'},
      {id: 'core-bsp', path: 'boards/core/core.GBP'},
      {id: 'core-out', path: 'boards/core/core.MIL'},
      {id: 'core-drl', path: 'boards/core/core.TXT'}
    ]
  },
  {
    name: 'arduino-uno',
    maskWithOutline: true,
    layers: [
      {path: 'boards/arduino-uno/arduino-uno.cmp'},
      {path: 'boards/arduino-uno/arduino-uno.stc'},
      {path: 'boards/arduino-uno/arduino-uno.plc'},
      {path: 'boards/arduino-uno/arduino-uno.sol'},
      {path: 'boards/arduino-uno/arduino-uno.sts'},
      {path: 'boards/arduino-uno/arduino-uno.gko'},
      {path: 'boards/arduino-uno/arduino-uno.drd'}
    ]
  }
]

var boardsContainer = document.getElementById('boards')

BOARDS.forEach(function(board) {
  var name = board.name
  var mask = board.maskWithOutline
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
      console.error('Recived status code: ' + response.statusCode)
    }
    else {
      top =  body.top.svg
      bottom = body.bottom.svg
    }

    topContainer.innerHTML = top
    bottomContainer.innerHTML = bottom
  })
})
