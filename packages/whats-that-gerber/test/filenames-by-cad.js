// test filenames by cad package for testing the identify function
'use strict'

module.exports = [
  {
    cad: 'kicad',
    files: [
      // top copper
      {name: 'board-F_Cu.gbr', type: 'tcu'},
      // top soldermask
      {name: 'board-F_Mask.gbr', type: 'tsm'},
      // top silkscreen
      {name: 'board-F_SilkS.gbr', type: 'tss'},
      // top solderpaste
      {name: 'board-F_Paste.gbr', type: 'tsp'},
      // bottom copper
      {name: 'board-B_Cu.gbr', type: 'bcu'},
      // bottom soldermask
      {name: 'board-B_Mask.gbr', type: 'bsm'},
      // bottom silkscreen
      {name: 'board-B_SilkS.gbr', type: 'bss'},
      // bottom paste
      {name: 'board-B_Paste.gbr', type: 'bsp'},
      // inner copper
      {name: 'board-In1_Cu.gbr', type: 'icu'},
      // outline
      {name: 'board-Edge_Cuts.gbr', type: 'out'},
      // drill
      {name: 'board.drl', type: 'drl'}
    ]
  },
  {
    cad: 'eagle',
    files: [
      // top copper
      {name: 'board.CMP', type: 'tcu'},
      {name: 'board.top', type: 'tcu'},
      // top soldermask
      {name: 'board.STC', type: 'tsm'},
      {name: 'board.tsm', type: 'tsm'},
      // top silkscreen
      {name: 'board.PLC', type: 'tss'},
      {name: 'board.tsk', type: 'tss'},
      // top solderpaste
      {name: 'board.CRC', type: 'tsp'},
      {name: 'board.tsp', type: 'tsp'},
      // bottom copper
      {name: 'board.SOL', type: 'bcu'},
      {name: 'board.bot', type: 'bcu'},
      // bottom soldermask
      {name: 'board.STS', type: 'bsm'},
      {name: 'board.bsm', type: 'bsm'},
      // bottom silkscreen
      {name: 'board.PLS', type: 'bss'},
      {name: 'board.bsk', type: 'bss'},
      // bottom solderpaste
      {name: 'board.CRS', type: 'bsp'},
      {name: 'board.bsp', type: 'bsp'},
      // inner copper
      {name: 'board.LY2', type: 'icu'},
      {name: 'board.ly3', type: 'icu'},
      // outline
      {name: 'board.DIM', type: 'out'},
      {name: 'board.mil', type: 'out'},
      {name: 'board.gml', type: 'out'},
      // drill
      {name: 'board.TXT', type: 'drl'},
      {name: 'board.xln', type: 'drl'},
      {name: 'board.drd', type: 'drl'}
    ]
  },
  {
    cad: 'alitum',
    files: [
      // top copper
      {name: 'board.gtl', type: 'tcu'},
      // top soldermask
      {name: 'board.gts', type: 'tsm'},
      // top silkscreen
      {name: 'board.gto', type: 'tss'},
      // top solderpaste
      {name: 'board.gtp', type: 'tsp'},
      // bottom copper
      {name: 'board.gbl', type: 'bcu'},
      // bottom soldermask
      {name: 'board.gbs', type: 'bsm'},
      // bottom silkscreen
      {name: 'board.gbo', type: 'bss'},
      // bottom solderpaste
      {name: 'board.gbp', type: 'bsp'},
      // inner copper
      {name: 'board.g1', type: 'icu'},
      // outline
      {name: 'board.gm3', type: 'out'},
      {name: 'board.gko', type: 'out'},
      // drill
      {name: 'board.txt', type: 'drl'}
    ]
  },
  {
    cad: 'orcad',
    files: [
      // top copper
      {name: 'board.TOP', type: 'tcu'},
      // top soldermask
      {name: 'board.SMT', type: 'tsm'},
      // top silkscreen
      {name: 'board.SST', type: 'tss'},
      // top solderpaste
      {name: 'board.SPT', type: 'tsp'},
      // bottom copper
      {name: 'board.BOT', type: 'bcu'},
      // bottom soldermask
      {name: 'board.SMB', type: 'bsm'},
      // bottom silkscreen
      {name: 'board.SSB', type: 'bss'},
      // bottom solderpaste
      {name: 'board.SPB', type: 'bsp'},
      // inner copper
      {name: 'board.IN1', type: 'icu'},
      // outline
      {name: 'board.FAB', type: 'out'},
      // drill
      {name: 'board.TAP', type: 'drl'}
    ]
  }
]
