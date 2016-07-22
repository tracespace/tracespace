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
  '<div> <a class="save_top" style="visibility:hidden" href="data:image/svg+xml;base64," href-lang="image/svg+xml"> save to file </a> </div>',
  '</div>',
  '<div class="side">',
  '<h4>bottom</h4>',
  '<div data-hook="bottom"> loading </div>',
  '<div> <a class="save_bottom" style="visibility:hidden" href="data:image/svg+xml;base64," href-lang="image/svg+xml"> save to file </a> </div>',
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
      {type: 'tcu', path: 'boards/core/core.GTL'},
      {type: 'tsm', path: 'boards/core/core.GTS'},
      {type: 'tss', path: 'boards/core/core.GTO'},
      {type: 'tsp', path: 'boards/core/core.GTP'},
      {type: 'bcu', path: 'boards/core/core.GBL'},
      {type: 'bsm', path: 'boards/core/core.GBS'},
      {type: 'bss', path: 'boards/core/core.GBO'},
      {type: 'bsp', path: 'boards/core/core.GBP'},
      {type: 'out', path: 'boards/core/core.MIL'},
      {type: 'drl', path: 'boards/core/core.TXT'}
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
