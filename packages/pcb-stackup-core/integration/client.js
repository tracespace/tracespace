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
      {id: 'clockblock-tcu', path: 'boards/clockblock/clockblock-F_Cu.gbr'},
      {id: 'clockblock-tsm', path: 'boards/clockblock/clockblock-F_Mask.gbr'},
      {id: 'clockblock-tss', path: 'boards/clockblock/clockblock-F_SilkS.gbr'},
      {id: 'clockblock-tsp', path: 'boards/clockblock/clockblock-F_Paste.gbr'},
      {id: 'clockblock-bcu', path: 'boards/clockblock/clockblock-B_Cu.gbr'},
      {id: 'clockblock-bsm', path: 'boards/clockblock/clockblock-B_Mask.gbr'},
      {id: 'clockblock-bss', path: 'boards/clockblock/clockblock-B_SilkS.gbr'},
      {id: 'clockblock-out', path: 'boards/clockblock/clockblock-Edge_Cuts.gbr'},
      {id: 'clockblock-drl1', path: 'boards/clockblock/clockblock-NPTH.drl'},
      {id: 'clockblock-drl2', path: 'boards/clockblock/clockblock.drl'}
    ]
  },
  {
    name: 'mchck',
    maskWithOutline: true,
    layers: [
      {id: 'mchck-tcu', path: 'boards/mchck/mchck-F_Cu.pho'},
      {id: 'mchck-tsm', path: 'boards/mchck/mchck-F_Mask.pho'},
      {id: 'mchck-tss', path: 'boards/mchck/mchck-F_SilkS.pho'},
      {id: 'mchck-bcu', path: 'boards/mchck/mchck-B_Cu.pho'},
      {id: 'mchck-bsm', path: 'boards/mchck/mchck-B_Mask.pho'},
      {id: 'mchck-bss', path: 'boards/mchck/mchck-B_SilkS.pho'},
      {id: 'mchck-out', path: 'boards/mchck/mchck-Edge_Cuts.pho'},
      {id: 'mchck-drl', path: 'boards/mchck/mchck.drl'}
    ]
  },
  {
    name: 'freeduino',
    maskWithOutline: true,
    layers: [
      {id: 'freeduino-tcu', path: 'boards/freeduino/freeduino.cmp'},
      {id: 'freeduino-tsm', path: 'boards/freeduino/freeduino.stc'},
      {id: 'freeduino-tss', path: 'boards/freeduino/freeduino.plc'},
      {id: 'freeduino-bcu', path: 'boards/freeduino/freeduino.sol'},
      {id: 'freeduino-bsm', path: 'boards/freeduino/freeduino.sts'},
      {id: 'freeduino-drl', path: 'boards/freeduino/freeduino.drd'}
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
      {id: 'arduino-uno-tcu', path: 'boards/arduino-uno/arduino-uno.cmp'},
      {id: 'arduino-uno-tsm', path: 'boards/arduino-uno/arduino-uno.stc'},
      {id: 'arduino-uno-tss', path: 'boards/arduino-uno/arduino-uno.plc'},
      {id: 'arduino-uno-bcu', path: 'boards/arduino-uno/arduino-uno.sol'},
      {id: 'arduino-uno-bsm', path: 'boards/arduino-uno/arduino-uno.sts'},
      {id: 'arduino-uno-out', path: 'boards/arduino-uno/arduino-uno.gko'},
      {id: 'arduino-uno-drl', path: 'boards/arduino-uno/arduino-uno.drd'}
    ]
  }
]

var boardsContainer = document.getElementById('boards')

BOARDS.forEach(function (board) {
  var name = board.name
  var mask = board.maskWithOutline
  var boardContainer = domify(boardTemplate({name: name, mask: mask}))
  var topContainer = boardContainer.querySelector('[data-hook=top]')
  var bottomContainer = boardContainer.querySelector('[data-hook=bottom]')

  boardsContainer.appendChild(boardContainer)

  xhr.post({
    uri: '/stackup',
    json: board
  }, function (error, response, body) {
    var top = 'failed'
    var bottom = 'failed'

    if (error) {
      console.error(error.message)
    } else if (response.statusCode !== 200) {
      console.error('Recived status code: ' + response.statusCode)
    } else {
      top = body.top.svg
      bottom = body.bottom.svg
    }

    topContainer.innerHTML = top
    bottomContainer.innerHTML = bottom
  })
})
